'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { AdvertisementRules, AdvertisementFormState } from '@/lib/core/models/advertisement.models';
import { dailyRentService } from '@/lib/services/daily-rent';
import { useDailyRentState } from '@/lib/contexts/DailyRentContext';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/utils/toast';
import styles from '../AddDailyRentClient.module.css';

interface Step9Props {
  isSubmitting: boolean;
  advertisementFormState: AdvertisementFormState;
  onStepCompleted: (data: { advertisementData: any }) => void;
  onValidationStatusChanged: (data: { isValid: boolean; errors: string[] }) => void;
}

export interface Step9Handle {
  saveStep: () => Promise<{ advertisementData: any }>;
  checkIfInputsAreValid: () => boolean;
}

const Step9 = forwardRef<Step9Handle, Step9Props>(
  ({ isSubmitting, advertisementFormState, onStepCompleted, onValidationStatusChanged }, ref) => {
    const [advertisementForm, setAdvertisementForm] = useState<AdvertisementRules>({
      arriveTime: '',
      leaveTime: '',
      minDuration: null,
      cancelReservation: false,
      unitDescription: '',
      availableFrom: '',
      availableTo: '',
    });

    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [fieldInteractionStates, setFieldInteractionStates] = useState<{ [key: string]: boolean }>({});

    const { dailyRentId: advertisementId, clearDailyRentId } = useDailyRentState();
    const router = useRouter();

    useEffect(() => {
      updateValidationStatus();
    }, []);

    useEffect(() => {
      if (advertisementFormState?.step9) {
        populateFormWithSavedData(advertisementFormState.step9);
      }
    }, [advertisementFormState?.step9]);

    const populateFormWithSavedData = (savedData: any) => {
      if (savedData) {
        setAdvertisementForm((prev) => ({
          ...prev,
          ...savedData,
        }));
        updateValidationStatus();
      }
    };

    const onFieldFocus = (fieldName: string) => {
      setFieldInteractionStates((prev) => ({ ...prev, [fieldName]: false }));
    };

    const onFieldBlur = (fieldName: string) => {
      setFieldInteractionStates((prev) => ({ ...prev, [fieldName]: true }));
      validateField(fieldName);
      updateValidationStatus();
    };

    const shouldShowFieldFeedback = (fieldName: string): boolean => {
      return fieldInteractionStates[fieldName] === true;
    };

    const getFieldError = (fieldName: string): string => {
      return fieldErrors[fieldName] || '';
    };

    const onDateChange = (fieldName: string) => {
      validateField(fieldName);
      if (fieldName === 'availableFrom' && advertisementForm.availableTo) {
        validateField('availableTo');
      }
      updateValidationStatus();
    };

    const validateField = (fieldName: string): void => {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        newErrors[fieldName] = '';

        switch (fieldName) {
          case 'unitDescription':
            if (advertisementForm.unitDescription && advertisementForm.unitDescription.trim().length < 10) {
              newErrors[fieldName] = 'يجب أن تكون 10 أحرف على الأقل';
            }
            break;

          case 'availableFrom':
            if (advertisementForm.availableFrom) {
              const fromDate = new Date(advertisementForm.availableFrom);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (fromDate < today) {
                newErrors[fieldName] = 'تاريخ بداية الإتاحة يجب أن يكون من اليوم أو بعده';
              }
            }
            break;

          case 'availableTo':
            if (advertisementForm.availableTo && advertisementForm.availableFrom) {
              const fromDate = new Date(advertisementForm.availableFrom);
              const toDate = new Date(advertisementForm.availableTo);
              if (toDate <= fromDate) {
                newErrors[fieldName] = 'تاريخ نهاية الإتاحة يجب أن يكون بعد تاريخ البداية';
              }
            }
            break;
        }

        return newErrors;
      });
    };

    const updateValidationStatus = () => {
      const fieldsToValidate = ['arriveTime', 'leaveTime', 'minDuration', 'cancelReservation', 'unitDescription', 'availableFrom', 'availableTo'];
      fieldsToValidate.forEach((field) => validateField(field));

      const isValid = Object.keys(fieldErrors).every((key) => !fieldErrors[key]);
      const errors = Object.values(fieldErrors).filter((error) => error);
      onValidationStatusChanged({ isValid, errors });
    };

    const validateEnglishNumber = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const englishNumberRegex = /[0-9.]/;
      if (!englishNumberRegex.test(event.key)) {
        event.preventDefault();
      }
    };

    const onMinDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setAdvertisementForm((prev) => ({ ...prev, minDuration: value ? parseInt(value) : null }));
      validateField('minDuration');
      updateValidationStatus();
    };

    const formatTime = (time: string): string | null => {
      if (!time || time.trim() === '') {
        return null;
      }
      const [hours, minutes] = time.split(':');
      if (!hours || !minutes) {
        return null;
      }
      return `${hours}:${minutes}:00`;
    };

    const saveStep = async (): Promise<{ advertisementData: any }> => {
      const fieldsToValidate = ['arriveTime', 'leaveTime', 'minDuration', 'cancelReservation', 'unitDescription', 'availableFrom', 'availableTo'];
      fieldsToValidate.forEach((field) => {
        validateField(field);
        setFieldInteractionStates((prev) => ({ ...prev, [field]: true }));
      });

      updateValidationStatus();

      const isValid = Object.keys(fieldErrors).every((key) => !fieldErrors[key]);

      if (!isValid) {
        throw new Error('الرجاء تصحيح الأخطاء قبل المتابعة');
      }

      if (!advertisementId) {
        throw new Error('لم يتم العثور على معرف الإعلان اليومي');
      }

      try {
        const unitData = {
          Id: advertisementId,
          Step: 9,
          AvailableFrom: advertisementForm.availableFrom || null,
          AvailableTo: advertisementForm.availableTo || null,
          CheckInTime: formatTime(advertisementForm.arriveTime),
          CheckOutTime: formatTime(advertisementForm.leaveTime),
          MinimumStayDays: advertisementForm.minDuration || null,
          IsCancellationAllowed: advertisementForm.cancelReservation === true,
          Policies: advertisementForm.unitDescription || null,
        };

        const response = await dailyRentService.updateAdvertisementPolicies({ Unit: unitData });

        if (response.IsSuccess) {
          showToast('تم حفظ قوانين الإعلان اليومي بنجاح', 'success');
          onStepCompleted({ advertisementData: advertisementFormState });

          setTimeout(() => {
            clearDailyRentId();
            if (typeof window !== 'undefined') {
              localStorage.removeItem('dailyRentFormState');
              localStorage.removeItem('currentDailyRentId');
            }
            router.push('/home');
            window.location.reload();
          }, 1000);

          return { advertisementData: advertisementFormState };
        } else {
          showToast(response.Error || 'فشل في حفظ قوانين الإعلان اليومي', 'error');
          throw new Error(response.Error || 'فشل في حفظ قوانين الإعلان اليومي');
        }
      } catch (error: any) {
        showToast(error.message || 'فشل في حفظ قوانين الإعلان اليومي', 'error');
        throw error;
      }
    };

    const checkIfInputsAreValid = (): boolean => {
      const fieldsToValidate = ['arriveTime', 'leaveTime', 'minDuration', 'cancelReservation', 'unitDescription', 'availableFrom', 'availableTo'];
      fieldsToValidate.forEach((field) => validateField(field));
      return Object.keys(fieldErrors).every((key) => !fieldErrors[key]);
    };

    useImperativeHandle(ref, () => ({
      saveStep,
      checkIfInputsAreValid,
    }));

    return (
      <div className={styles.stepContent}>
        <h3 className="mb-4">قوانين الوحدة</h3>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="form-floating mb-3">
              <input
                id="minDuration"
                type="number"
                className="form-control"
                value={advertisementForm.minDuration || ''}
                onChange={onMinDurationChange}
                onFocus={() => onFieldFocus('minDuration')}
                onBlur={() => onFieldBlur('minDuration')}
                min="1"
                onKeyPress={validateEnglishNumber}
                placeholder="أدنى مدة للحجز"
              />
              <label htmlFor="minDuration">أدنى مدة للحجز (اختياري)</label>
              {shouldShowFieldFeedback('minDuration') && (
                <div className="text-danger small mt-1">{getFieldError('minDuration')}</div>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-floating mb-3">
              <select
                id="cancelReservation"
                className="form-control"
                value={advertisementForm.cancelReservation ? 'true' : 'false'}
                onChange={(e) => setAdvertisementForm((prev) => ({ ...prev, cancelReservation: e.target.value === 'true' }))}
                onFocus={() => onFieldFocus('cancelReservation')}
                onBlur={() => onFieldBlur('cancelReservation')}
              >
                <option value="false">لا</option>
                <option value="true">نعم</option>
              </select>
              <label htmlFor="cancelReservation">إمكانية إلغاء الحجز (اختياري)</label>
              {shouldShowFieldFeedback('cancelReservation') && (
                <div className="text-danger small mt-1">{getFieldError('cancelReservation')}</div>
              )}
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="form-floating mb-3">
              <input
                type="date"
                className={`form-control ${shouldShowFieldFeedback('availableFrom') ? 'is-invalid' : ''}`}
                value={advertisementForm.availableFrom}
                onChange={(e) => {
                  setAdvertisementForm((prev) => ({ ...prev, availableFrom: e.target.value }));
                  onDateChange('availableFrom');
                }}
                onFocus={() => onFieldFocus('availableFrom')}
                onBlur={() => onFieldBlur('availableFrom')}
              />
              <label>تاريخ بداية الإتاحة من (اختياري)</label>
              {shouldShowFieldFeedback('availableFrom') && (
                <div className="text-danger small mt-1">{getFieldError('availableFrom')}</div>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-floating mb-3">
              <input
                type="date"
                className={`form-control ${shouldShowFieldFeedback('availableTo') ? 'is-invalid' : ''}`}
                value={advertisementForm.availableTo}
                onChange={(e) => {
                  setAdvertisementForm((prev) => ({ ...prev, availableTo: e.target.value }));
                  onDateChange('availableTo');
                }}
                onFocus={() => onFieldFocus('availableTo')}
                onBlur={() => onFieldBlur('availableTo')}
              />
              <label>إلى (اختياري)</label>
              {shouldShowFieldFeedback('availableTo') && (
                <div className="text-danger small mt-1">{getFieldError('availableTo')}</div>
              )}
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6">
            <div className="form-floating mb-3">
              <input
                id="arriveTime"
                type="time"
                className="form-control"
                value={advertisementForm.arriveTime}
                onChange={(e) => {
                  setAdvertisementForm((prev) => ({ ...prev, arriveTime: e.target.value }));
                  validateField('arriveTime');
                  updateValidationStatus();
                }}
                onFocus={() => onFieldFocus('arriveTime')}
                onBlur={() => onFieldBlur('arriveTime')}
              />
              <label htmlFor="arriveTime">وقت الوصول (اختياري)</label>
              {shouldShowFieldFeedback('arriveTime') && (
                <div className="text-danger small mt-1">{getFieldError('arriveTime')}</div>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-floating mb-3">
              <input
                id="leaveTime"
                type="time"
                className="form-control"
                value={advertisementForm.leaveTime}
                onChange={(e) => {
                  setAdvertisementForm((prev) => ({ ...prev, leaveTime: e.target.value }));
                  validateField('leaveTime');
                  updateValidationStatus();
                }}
                onFocus={() => onFieldFocus('leaveTime')}
                onBlur={() => onFieldBlur('leaveTime')}
              />
              <label htmlFor="leaveTime">وقت المغادرة (اختياري)</label>
              {shouldShowFieldFeedback('leaveTime') && (
                <div className="text-danger small mt-1">{getFieldError('leaveTime')}</div>
              )}
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <label className="form-label">شروط الوحدة (اختياري)</label>
            <textarea
              className={`form-control ${shouldShowFieldFeedback('unitDescription') ? 'is-invalid' : ''}`}
              value={advertisementForm.unitDescription}
              onChange={(e) => {
                setAdvertisementForm((prev) => ({ ...prev, unitDescription: e.target.value }));
                validateField('unitDescription');
                updateValidationStatus();
              }}
              onFocus={() => onFieldFocus('unitDescription')}
              onBlur={() => onFieldBlur('unitDescription')}
              rows={4}
              placeholder="أدخل شروط الوحدة"
            />
            {shouldShowFieldFeedback('unitDescription') && (
              <div className="text-danger small mt-1">{getFieldError('unitDescription')}</div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Step9.displayName = 'Step9';

export default Step9;


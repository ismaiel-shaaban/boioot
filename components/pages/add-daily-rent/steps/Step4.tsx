'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { AdvertisementDetails, AdvertisementFormState } from '@/lib/core/models/advertisement.models';
import { dailyRentService } from '@/lib/services/daily-rent';
import { useDailyRentState } from '@/lib/contexts/DailyRentContext';
import { showToast } from '@/lib/utils/toast';
import styles from '../AddDailyRentClient.module.css';

interface Step4Props {
  isSubmitting: boolean;
  advertisementFormState: AdvertisementFormState;
  onStepCompleted: (data: { advertisementData: AdvertisementDetails }) => void;
  onValidationStatusChanged: (data: { isValid: boolean; errors: string[] }) => void;
}

export interface Step4Handle {
  saveStep: () => Promise<{ advertisementData: AdvertisementDetails }>;
  checkIfInputsAreValid: () => boolean;
}

const Step4 = forwardRef<Step4Handle, Step4Props>(
  ({ isSubmitting, advertisementFormState, onStepCompleted, onValidationStatusChanged }, ref) => {
    const [advertisementForm, setAdvertisementForm] = useState<AdvertisementDetails>({
      area: null,
      rent: null,
      hasCommission: false,
      commissionAmount: null,
      rentalDuration: 0,
      paymentType: 0,
      isUsd: false,
    });

    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [fieldInteractionStates, setFieldInteractionStates] = useState<{ [key: string]: boolean }>({});
    const { dailyRentId } = useDailyRentState();

    useEffect(() => {
      updateValidationStatus();
    }, []);

    useEffect(() => {
      if (advertisementFormState?.step4) {
        populateFormWithSavedData(advertisementFormState.step4);
      }
    }, [advertisementFormState?.step4]);

    const populateFormWithSavedData = (savedData: any) => {
      if (savedData) {
        setAdvertisementForm((prev) => ({
          ...prev,
          ...savedData,
          isUsd: savedData.isUsd !== undefined ? savedData.isUsd : false,
        }));
        updateValidationStatus();
      }
    };

    const selectCommissionOption = (option: boolean) => {
      setAdvertisementForm((prev) => ({ ...prev, hasCommission: option }));
      validateField('hasCommission');
      updateValidationStatus();
    };

    const onFieldFocus = (fieldName: string) => {
      setFieldInteractionStates((prev) => ({ ...prev, [fieldName]: true }));
    };

    const onFieldBlur = (fieldName: string) => {
      validateField(fieldName);
      updateValidationStatus();
    };

    const shouldShowFieldFeedback = (fieldName: string): boolean => {
      return fieldInteractionStates[fieldName] && !!fieldErrors[fieldName];
    };

    const getFieldError = (fieldName: string): string => {
      return fieldErrors[fieldName] || '';
    };

    const validateEnglishNumber = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const englishNumberRegex = /[0-9.]/;
      if (!englishNumberRegex.test(event.key)) {
        event.preventDefault();
      }
    };

    const validateField = (fieldName: string) => {
      let error = '';

      switch (fieldName) {
        case 'area':
          if (!advertisementForm.area || advertisementForm.area <= 0) {
            error = 'المساحة مطلوبة ويجب أن تكون أكبر من صفر';
          }
          break;

        case 'rent':
          if (!advertisementForm.rent || advertisementForm.rent <= 0) {
            error = 'القيمة مطلوبة ويجب أن تكون أكبر من صفر';
          }
          break;

        case 'commissionAmount':
          if (advertisementForm.hasCommission === true && (!advertisementForm.commissionAmount || advertisementForm.commissionAmount === 0)) {
            error = 'مبلغ العمولة مطلوب';
          }
          break;
      }

      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });
    };

    const updateValidationStatus = () => {
      const fieldsToValidate = ['area', 'rent', 'hasCommission'];
      fieldsToValidate.forEach((field) => validateField(field));

      if (advertisementForm.hasCommission === true) {
        validateField('commissionAmount');
      }

      const isValid = Object.keys(fieldErrors).length === 0;
      const errors = Object.values(fieldErrors);
      onValidationStatusChanged({ isValid, errors });
    };

    const saveStep = async (): Promise<{ advertisementData: AdvertisementDetails }> => {
      const fieldsToValidate = ['area', 'rent', 'hasCommission'];
      fieldsToValidate.forEach((field) => validateField(field));

      if (advertisementForm.hasCommission === true) {
        validateField('commissionAmount');
      }

      if (Object.keys(fieldErrors).length > 0) {
        throw new Error('الرجاء تصحيح الأخطاء قبل المتابعة');
      }

      if (!dailyRentId) {
        throw new Error('لم يتم العثور على معرف الإعلان اليومي');
      }

      try {
        const response = await dailyRentService.updateUnitDetails({
          Unit: {
            Id: dailyRentId,
            Step: 4,
            Area: advertisementForm.area,
            RentPrice: advertisementForm.rent,
            HasCommission: advertisementForm.hasCommission,
            CommissionAmount: advertisementForm.commissionAmount,
            IsUsd: advertisementForm.isUsd,
          },
        });

        if (response.IsSuccess) {
          onStepCompleted({ advertisementData: advertisementForm });
          showToast('تم حفظ تفاصيل الوحدة بنجاح', 'success');
          return { advertisementData: advertisementForm };
        } else {
          showToast(response.Error || 'فشل في حفظ تفاصيل الوحدة', 'error');
          throw new Error(response.Error || 'فشل في حفظ تفاصيل الوحدة');
        }
      } catch (error: any) {
        console.error('Unit Details API Error:', error);
        showToast(error.message || 'فشل في حفظ تفاصيل الوحدة', 'error');
        throw error;
      }
    };

    const checkIfInputsAreValid = (): boolean => {
      const fieldsToValidate = ['area', 'rent', 'hasCommission'];
      fieldsToValidate.forEach((field) => validateField(field));

      if (advertisementForm.hasCommission === true) {
        validateField('commissionAmount');
      }

      return Object.keys(fieldErrors).length === 0;
    };

    useImperativeHandle(ref, () => ({
      saveStep,
      checkIfInputsAreValid,
    }));

    return (
      <div className={styles.stepContent}>
        <h3 className="mb-4">معلومات العقار</h3>

        <div className="row">
          <div className="col-lg-6">
            <div className="form-floating mb-4">
              <input
                type="number"
                className={`form-control ${shouldShowFieldFeedback('area') ? 'is-invalid' : ''}`}
                value={advertisementForm.area || ''}
                onChange={(e) => setAdvertisementForm((prev) => ({ ...prev, area: parseFloat(e.target.value) || 0 }))}
                onFocus={() => onFieldFocus('area')}
                onBlur={() => onFieldBlur('area')}
                onKeyPress={validateEnglishNumber}
                placeholder="المساحة (بالمتر المربع)"
              />
              <label>المساحة (بالمتر المربع)</label>
              {shouldShowFieldFeedback('area') && (
                <div className="text-danger small mt-1">{getFieldError('area')}</div>
              )}
            </div>
          </div>

          <div className="col-lg-6 mt-1">
            <div className="form-floating mb-4">
              <input
                type="number"
                className={`form-control ${shouldShowFieldFeedback('rent') ? 'is-invalid' : ''}`}
                value={advertisementForm.rent || ''}
                onChange={(e) => setAdvertisementForm((prev) => ({ ...prev, rent: parseFloat(e.target.value) || 0 }))}
                onFocus={() => onFieldFocus('rent')}
                onBlur={() => onFieldBlur('rent')}
                onKeyPress={validateEnglishNumber}
                placeholder="القيمة"
              />
              <label>القيمة</label>
              {shouldShowFieldFeedback('rent') && (
                <div className="text-danger small mt-1">{getFieldError('rent')}</div>
              )}
            </div>

            <div className="currency-selection mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isUsdCheckbox"
                  checked={advertisementForm.isUsd || false}
                  onChange={(e) => setAdvertisementForm((prev) => ({ ...prev, isUsd: e.target.checked }))}
                />
                <label className="form-check-label" htmlFor="isUsdCheckbox">
                  عرض السعر بالدولار الأمريكي
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-2">
          <div className="col-lg-6">
            <div className="form-group mb-4">
              <label className="form-label">هل يوجد عمولة؟</label>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className={`btn ${advertisementForm.hasCommission === true ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => selectCommissionOption(true)}
                >
                  نعم
                </button>
                <button
                  type="button"
                  className={`btn ${advertisementForm.hasCommission === false ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => selectCommissionOption(false)}
                >
                  لا
                </button>
              </div>
              {shouldShowFieldFeedback('hasCommission') && (
                <div className="text-danger small mt-1">{getFieldError('hasCommission')}</div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            {advertisementForm.hasCommission === true && (
              <div className="form-floating mb-4">
                <input
                  type="number"
                  className={`form-control ${shouldShowFieldFeedback('commissionAmount') ? 'is-invalid' : ''}`}
                  value={advertisementForm.commissionAmount || ''}
                  onChange={(e) =>
                    setAdvertisementForm((prev) => ({ ...prev, commissionAmount: parseFloat(e.target.value) || 0 }))
                  }
                  onFocus={() => onFieldFocus('commissionAmount')}
                  onBlur={() => onFieldBlur('commissionAmount')}
                  onKeyPress={validateEnglishNumber}
                  placeholder="مبلغ العمولة"
                />
                <label>مبلغ العمولة</label>
                {shouldShowFieldFeedback('commissionAmount') && (
                  <div className="text-danger small mt-1">{getFieldError('commissionAmount')}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Step4.displayName = 'Step4';

export default Step4;


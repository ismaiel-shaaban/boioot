'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { AdvertisementSpecifications, AdvertisementFormState } from '@/lib/core/models/advertisement.models';
import { specialOrderService } from '@/lib/services/special-order';
import { useSpecialOrderState } from '@/lib/contexts/SpecialOrderContext';
import { showToast } from '@/lib/utils/toast';
import styles from '../AddSpecialOrderClient.module.css';

interface Step7Props {
  isSubmitting: boolean;
  advertisementFormState: AdvertisementFormState;
  onStepCompleted: (data: { advertisementData: AdvertisementSpecifications }) => void;
  onValidationStatusChanged: (data: { isValid: boolean; errors: string[] }) => void;
}

export interface Step7Handle {
  saveStep: () => Promise<{ advertisementData: AdvertisementSpecifications }>;
  checkIfInputsAreValid: () => boolean;
}

const roomOptions = [1, 2, 3, 4, 5];
const categoryOptions = [
  { id: 0, label: 'عوائل' },
  { id: 1, label: 'عزاب' },
  { id: 2, label: 'الكل' },
];
const hallOptions = [1, 2, 3, 4, 5];
const bathroomOptions = [1, 2, 3, 4, 5];
const propertyAgeOptions = [
  { id: 0, label: 'جديد' },
  { id: 1, label: '1-5 سنوات' },
  { id: 2, label: '6-10 سنوات' },
  { id: 3, label: 'أكثر من 10 سنوات' },
];

const Step7 = forwardRef<Step7Handle, Step7Props>(
  ({ isSubmitting, advertisementFormState, onStepCompleted, onValidationStatusChanged }, ref) => {
    const [detailsForm, setDetailsForm] = useState({
      numberOfRooms: 1,
      category: 0,
      numberOfHalls: 1,
      numberOfBathrooms: 1,
      floor: 1,
      propertyAge: 0,
    });

    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [fieldInteractionStates, setFieldInteractionStates] = useState<{ [key: string]: boolean }>({});
    const { specialOrderId: advertisementId } = useSpecialOrderState();

    useEffect(() => {
      updateValidationStatus();
    }, []);

    useEffect(() => {
      if (advertisementFormState?.step7) {
        populateFormWithSavedData(advertisementFormState.step7);
      }
    }, [advertisementFormState?.step7]);

    const populateFormWithSavedData = (savedData: any) => {
      if (savedData) {
        setDetailsForm({
          numberOfRooms: savedData.numberOfRooms || 1,
          category: parseInt(savedData.category) || 0,
          numberOfHalls: savedData.numberOfHalls || 1,
          numberOfBathrooms: savedData.numberOfBathrooms || 1,
          floor: savedData.floor || 1,
          propertyAge: parseInt(savedData.propertyAge) || 0,
        });
        updateValidationStatus();
      }
    };

    const onFieldFocus = (fieldName: string) => {
      setFieldInteractionStates((prev) => ({ ...prev, [fieldName]: true }));
    };

    const onFieldBlur = (fieldName: string) => {
      validateField(fieldName);
      updateValidationStatus();
    };

    const onFieldChange = (fieldName: string) => {
      // Validate in real-time as user types
      validateField(fieldName);
      updateValidationStatus();
    };

    const shouldShowFieldFeedback = (fieldName: string): boolean => {
      return fieldInteractionStates[fieldName] && !!fieldErrors[fieldName];
    };

    const getFieldError = (fieldName: string): string => {
      return fieldErrors[fieldName] || '';
    };

    const onSelectionChange = (fieldName: string) => {
      validateField(fieldName);
      updateValidationStatus();
    };

    const validateEnglishNumber = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const englishNumberRegex = /[0-9.]/;
      if (!englishNumberRegex.test(event.key)) {
        event.preventDefault();
      }
    };

    const validateField = (fieldName: string) => {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        newErrors[fieldName] = '';

        switch (fieldName) {
          case 'numberOfRooms':
            if (detailsForm.numberOfRooms === 0) {
              newErrors[fieldName] = 'يجب اختيار عدد الغرف';
            }
            break;

          case 'numberOfHalls':
            if (detailsForm.numberOfHalls === 0) {
              newErrors[fieldName] = 'يجب اختيار عدد الصالات';
            }
            break;

          case 'numberOfBathrooms':
            if (detailsForm.numberOfBathrooms === 0) {
              newErrors[fieldName] = 'يجب اختيار عدد دورات المياه';
            }
            break;

          case 'floor':
            if (!detailsForm.floor) {
              newErrors[fieldName] = 'يجب اختيار الدور';
            } else if (detailsForm.floor < 0) {
              newErrors[fieldName] = 'رقم الدور لا يمكن أن يكون أقل من 0';
            }
            break;
        }

        return newErrors;
      });
    };

    const updateValidationStatus = () => {
      const isValid = Object.keys(fieldErrors).every((key) => !fieldErrors[key]);
      const errors = Object.values(fieldErrors).filter((error) => error);
      onValidationStatusChanged({ isValid, errors });
    };

    const saveStep = async (): Promise<{ advertisementData: AdvertisementSpecifications }> => {
      ['numberOfRooms', 'category', 'numberOfHalls', 'numberOfBathrooms', 'floor', 'propertyAge'].forEach((field) => {
        validateField(field);
        setFieldInteractionStates((prev) => ({ ...prev, [field]: true }));
      });

      updateValidationStatus();

      const isValid = Object.keys(fieldErrors).every((key) => !fieldErrors[key]);

      if (!isValid) {
        throw new Error('الرجاء تصحيح الأخطاء قبل المتابعة');
      }

      if (!advertisementId) {
        throw new Error('لم يتم العثور على معرف الطلب الخاص');
      }

      try {
        const unitData = {
          Id: advertisementId,
          Rooms: detailsForm.numberOfRooms,
          Halls: detailsForm.numberOfHalls,
          Bathrooms: detailsForm.numberOfBathrooms,
          Audience: detailsForm.category,
          Floor: detailsForm.floor,
          PropertyAge: parseInt(detailsForm.propertyAge.toString()),
          Step: 7,
        };

        const response = await specialOrderService.updateUnitInfoDetails({ Order: unitData });

        if (response.IsSuccess) {
          showToast('تم حفظ تفاصيل الطلب الخاص بنجاح', 'success');
          const specificationsData: AdvertisementSpecifications = {
            numberOfRooms: detailsForm.numberOfRooms,
            category: categoryOptions.find((cat) => cat.id === detailsForm.category)?.id || 0,
            numberOfHalls: detailsForm.numberOfHalls,
            numberOfBathrooms: detailsForm.numberOfBathrooms,
            propertyAge: propertyAgeOptions.find((age) => age.id === detailsForm.propertyAge)?.label || '',
            floor: detailsForm.floor.toString(),
          };

          onStepCompleted({ advertisementData: specificationsData });
          return { advertisementData: specificationsData };
        } else {
          showToast(response.Error || 'فشل في حفظ تفاصيل الطلب الخاص', 'error');
          throw new Error(response.Error || 'فشل في حفظ تفاصيل الطلب الخاص');
        }
      } catch (error: any) {
        showToast(error.message || 'فشل في حفظ تفاصيل الطلب الخاص', 'error');
        throw error;
      }
    };

    const checkIfInputsAreValid = (): boolean => {
      return (
        detailsForm.numberOfRooms > 0 &&
        detailsForm.numberOfHalls > 0 &&
        detailsForm.numberOfBathrooms > 0 &&
        !!detailsForm.floor
      );
    };

    useImperativeHandle(ref, () => ({
      saveStep,
      checkIfInputsAreValid,
    }));

    return (
      <div className={styles.stepContent}>
        <h3 className="mb-4">مواصفات الطلب الخاص</h3>

        <div className="form-group mb-4">
          <label className="form-label">عدد الغرف</label>
          <div className={styles.numberSelector}>
            <div className={styles.numberOptions}>
              {roomOptions.map((option) => (
                <div
                  key={option}
                  className={`${styles.optionItem} ${detailsForm.numberOfRooms === option ? styles.active : ''}`}
                  onClick={() => {
                    setDetailsForm((prev) => ({ ...prev, numberOfRooms: option }));
                    onSelectionChange('numberOfRooms');
                  }}
                >
                  {option === 5 ? '+5' : option}
                </div>
              ))}
            </div>
          </div>
          {shouldShowFieldFeedback('numberOfRooms') && (
            <div className="invalid-feedback">{getFieldError('numberOfRooms')}</div>
          )}
        </div>

        <div className="form-group mb-4">
          <label className="form-label">الفئة</label>
          <div className={styles.numberSelector}>
            <div className={styles.numberOptions}>
              {categoryOptions.map((option) => (
                <div
                  key={option.id}
                  className={`${styles.optionItem} ${detailsForm.category == option.id ? styles.active : ''}`}
                  onClick={() => {
                    setDetailsForm((prev) => ({ ...prev, category: option.id }));
                    onSelectionChange('category');
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>
          {shouldShowFieldFeedback('category') && (
            <div className="invalid-feedback">{getFieldError('category')}</div>
          )}
        </div>

        <div className="form-group mb-4">
          <label className="form-label">عدد الصالات</label>
          <div className={styles.numberSelector}>
            <div className={styles.numberOptions}>
              {hallOptions.map((option) => (
                <div
                  key={option}
                  className={`${styles.optionItem} ${detailsForm.numberOfHalls === option ? styles.active : ''}`}
                  onClick={() => {
                    setDetailsForm((prev) => ({ ...prev, numberOfHalls: option }));
                    onSelectionChange('numberOfHalls');
                  }}
                >
                  {option === 5 ? '+5' : option}
                </div>
              ))}
            </div>
          </div>
          {shouldShowFieldFeedback('numberOfHalls') && (
            <div className="invalid-feedback">{getFieldError('numberOfHalls')}</div>
          )}
        </div>

        <div className="form-group mb-4">
          <label className="form-label">عدد دورات المياه</label>
          <div className={styles.numberSelector}>
            <div className={styles.numberOptions}>
              {bathroomOptions.map((option) => (
                <div
                  key={option}
                  className={`${styles.optionItem} ${detailsForm.numberOfBathrooms === option ? styles.active : ''}`}
                  onClick={() => {
                    setDetailsForm((prev) => ({ ...prev, numberOfBathrooms: option }));
                    onSelectionChange('numberOfBathrooms');
                  }}
                >
                  {option === 5 ? '+5' : option}
                </div>
              ))}
            </div>
          </div>
          {shouldShowFieldFeedback('numberOfBathrooms') && (
            <div className="invalid-feedback">{getFieldError('numberOfBathrooms')}</div>
          )}
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-floating mb-4">
              <input
                type="number"
                className={`form-control ${shouldShowFieldFeedback('floor') ? 'is-invalid' : ''}`}
                value={detailsForm.floor}
                onChange={(e) => {
                  setDetailsForm((prev) => ({ ...prev, floor: parseInt(e.target.value) || 0 }));
                  onFieldChange('floor');
                }}
                onFocus={() => onFieldFocus('floor')}
                onBlur={() => onFieldBlur('floor')}
                onKeyPress={validateEnglishNumber}
                min="0"
                placeholder="ادخل رقم الدور"
              />
              <label>ادخل رقم الدور</label>
              {shouldShowFieldFeedback('floor') && (
                <div className="text-danger small mt-1">{getFieldError('floor')}</div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-floating mb-4">
              <div className="div" style={{ position: 'relative' }}>
                <span className={styles.downArrow}>
                  <i className="fa-solid fa-arrow-down"></i>
                </span>
              </div>
              <select
                className="form-control"
                value={detailsForm.propertyAge}
                onChange={(e) => {
                  setDetailsForm((prev) => ({ ...prev, propertyAge: parseInt(e.target.value) }));
                  onSelectionChange('propertyAge');
                }}
                onFocus={() => onFieldFocus('propertyAge')}
                onBlur={() => onFieldBlur('propertyAge')}
                disabled={isSubmitting}
              >
                {propertyAgeOptions.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
              <label>عمر العقار</label>
              {shouldShowFieldFeedback('propertyAge') && (
                <div className="invalid-feedback">{getFieldError('propertyAge')}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Step7.displayName = 'Step7';

export default Step7;


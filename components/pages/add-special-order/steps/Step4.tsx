'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { AdvertisementDetails, AdvertisementFormState } from '@/lib/core/models/advertisement.models';
import { specialOrderService } from '@/lib/services/special-order';
import { useSpecialOrderState } from '@/lib/contexts/SpecialOrderContext';
import { showToast } from '@/lib/utils/toast';
import { validateEnglishNumber } from '@/lib/utils/validation';
import styles from '../AddSpecialOrderClient.module.css';

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

    const rentalDurations = [
      { label: 'شهري', value: 1 },
      { label: 'سنوي', value: 3 },
    ];

    const paymentTypes = [
      { label: 'دفعة واحدة', value: 1 },
      { label: 'أكثر من دفعة', value: 2 },
    ];
    const { specialOrderId: advertisementId } = useSpecialOrderState();

    useEffect(() => {
      updateValidationStatus();
    }, []);

    useEffect(() => {
      if (advertisementFormState?.step4) {
        populateFormWithSavedData(advertisementFormState.step4);
      }
    }, [advertisementFormState]);

    const populateFormWithSavedData = (savedData: any) => {
      if (savedData) {
        // Map API response fields to form fields
        setAdvertisementForm((prev) => ({
          ...prev,
          area: savedData.Area || savedData.area || null,
          rent: savedData.RentPrice || savedData.rent || null,
          hasCommission: savedData.HasCommission || savedData.hasCommission || false,
          commissionAmount: savedData.CommissionAmount || savedData.commissionAmount || null,
          rentalDuration: savedData.ContractDuration || savedData.rentalDuration || 0,
          paymentType: savedData.PaymentFrequency || savedData.paymentType || 0,
          isUsd: savedData.IsUsd !== undefined ? savedData.IsUsd : (savedData.isUsd !== undefined ? savedData.isUsd : false),
        }));
        updateValidationStatus();
      }
    };

    const selectCommissionOption = (option: boolean) => {
      setAdvertisementForm((prev) => ({ ...prev, hasCommission: option }));
      validateField('hasCommission');
      updateValidationStatus();
    };

    const selectRentalDuration = (duration: number) => {
      setAdvertisementForm((prev) => ({ ...prev, rentalDuration: duration }));
      validateField('rentalDuration');
      updateValidationStatus();
    };

    const selectPaymentType = (type: number) => {
      setAdvertisementForm((prev) => ({ ...prev, paymentType: type }));
      validateField('paymentType');
      updateValidationStatus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setAdvertisementForm((prev) => ({
        ...prev,
        [name]:
          type === 'checkbox'
            ? checked
            : name === 'area' || name === 'rent' || name === 'commissionAmount'
              ? value === ''
                ? null
                : parseFloat(value)
              : value,
      }));
      validateField(name);
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

    const validateField = (fieldName: string): void => {
      let error = '';
      switch (fieldName) {
        case 'area':
          if (advertisementForm.area === null || advertisementForm.area <= 0) {
            error = 'المساحة مطلوبة ويجب أن تكون أكبر من صفر';
          }
          break;
        case 'rent':
          if (advertisementForm.rent === null || advertisementForm.rent <= 0) {
            error = 'القيمة مطلوبة ويجب أن تكون أكبر من صفر';
          }
          break;
        case 'hasCommission':
          break;
        case 'commissionAmount':
          if (
            advertisementForm.hasCommission === true &&
            (advertisementForm.commissionAmount === null || advertisementForm.commissionAmount <= 0)
          ) {
            error = 'مبلغ العمولة مطلوب ويجب أن يكون أكبر من صفر';
          }
          break;
        case 'rentalDuration':
          if (advertisementForm.rentalDuration === 0) {
            error = 'مدة عقد القيمة مطلوبة';
          }
          break;
        case 'paymentType':
          if (advertisementForm.paymentType === 0) {
            error = 'عدد الدفعات مطلوب';
          }
          break;
      }
      setFieldErrors((prev) => ({ ...prev, [fieldName]: error }));
    };

    const updateValidationStatus = () => {
      const fieldsToValidate = ['area', 'rent', 'hasCommission', 'rentalDuration', 'paymentType'];
      const currentErrors: { [key: string]: string } = {};
      fieldsToValidate.forEach((field) => {
        let error = '';
        switch (field) {
          case 'area':
            if (advertisementForm.area === null || advertisementForm.area <= 0) {
              error = 'المساحة مطلوبة ويجب أن تكون أكبر من صفر';
            }
            break;
          case 'rent':
            if (advertisementForm.rent === null || advertisementForm.rent <= 0) {
              error = 'القيمة مطلوبة ويجب أن تكون أكبر من صفر';
            }
            break;
          case 'rentalDuration':
            if (advertisementForm.rentalDuration === 0) {
              error = 'مدة عقد القيمة مطلوبة';
            }
            break;
          case 'paymentType':
            if (advertisementForm.paymentType === 0) {
              error = 'عدد الدفعات مطلوب';
            }
            break;
        }
        if (error) currentErrors[field] = error;
      });

      if (advertisementForm.hasCommission === true) {
        if (advertisementForm.commissionAmount === null || advertisementForm.commissionAmount <= 0) {
          currentErrors['commissionAmount'] = 'مبلغ العمولة مطلوب ويجب أن يكون أكبر من صفر';
        }
      } else {
        delete currentErrors['commissionAmount'];
      }

      setFieldErrors(currentErrors);
      const isValid = Object.keys(currentErrors).length === 0;
      const errors = Object.values(currentErrors);
      onValidationStatusChanged({ isValid, errors });
    };

    const checkIfInputsAreValid = (): boolean => {
      const fieldsToValidate = ['area', 'rent', 'hasCommission', 'rentalDuration', 'paymentType'];
      const currentErrors: { [key: string]: string } = {};
      fieldsToValidate.forEach((field) => {
        let error = '';
        switch (field) {
          case 'area':
            if (advertisementForm.area === null || advertisementForm.area <= 0) {
              error = 'المساحة مطلوبة ويجب أن تكون أكبر من صفر';
            }
            break;
          case 'rent':
            if (advertisementForm.rent === null || advertisementForm.rent <= 0) {
              error = 'القيمة مطلوبة ويجب أن تكون أكبر من صفر';
            }
            break;
          case 'rentalDuration':
            if (advertisementForm.rentalDuration === 0) {
              error = 'مدة عقد القيمة مطلوبة';
            }
            break;
          case 'paymentType':
            if (advertisementForm.paymentType === 0) {
              error = 'عدد الدفعات مطلوب';
            }
            break;
        }
        if (error) currentErrors[field] = error;
      });

      if (advertisementForm.hasCommission === true) {
        if (advertisementForm.commissionAmount === null || advertisementForm.commissionAmount <= 0) {
          currentErrors['commissionAmount'] = 'مبلغ العمولة مطلوب ويجب أن يكون أكبر من صفر';
        }
      } else {
        delete currentErrors['commissionAmount'];
      }

      setFieldErrors(currentErrors);
      return Object.keys(currentErrors).length === 0;
    };

    const getValidationErrors = (): string[] => {
      return Object.values(fieldErrors);
    };

    useImperativeHandle(ref, () => ({
      checkIfInputsAreValid,
      saveStep,
      getValidationErrors,
    }));

    const saveStep = async (): Promise<{ advertisementData: AdvertisementDetails }> => {
      if (!checkIfInputsAreValid()) {
        throw new Error('الرجاء تصحيح الأخطاء قبل المتابعة');
      }

      if (!advertisementId) {
        throw new Error('لم يتم العثور على معرف الطلب الخاص');
      }

      try {
        const response = await specialOrderService.updateUnitDetails({
          Order: {
            Id: advertisementId,
            Step: 4,
            Area: advertisementForm.area,
            ContractDuration: advertisementForm.rentalDuration,
            PaymentFrequency: advertisementForm.paymentType,
            RentPrice: advertisementForm.rent,
            HasCommission: advertisementForm.hasCommission,
            CommissionAmount: advertisementForm.commissionAmount || null,
            IsUsd: advertisementForm.isUsd || false,
          },
        });

        if (response.IsSuccess) {
          onStepCompleted({ advertisementData: advertisementForm });
          showToast('تم حفظ تفاصيل الوحدة بنجاح', 'success');
          return { advertisementData: advertisementForm };
        } else {
          throw new Error(response.Error || 'فشل في حفظ تفاصيل الوحدة');
        }
      } catch (error: any) {
        console.error('Error saving step 4:', error);
        showToast(error.message || 'فشل في حفظ تفاصيل الوحدة', 'error');
        throw error;
      }
    };

    return (
      <div className={styles.stepContent}>
        <h3 className="mb-4">معلومات العقار</h3>

        <div className="row">
          <div className="col-lg-6">
            <div className="mb-3">
              <label htmlFor="area" className="form-label">
                المساحة (بالمتر المربع) *
              </label>
              <input
                type="number"
                id="area"
                name="area"
                className={`form-control ${shouldShowFieldFeedback('area') ? 'is-invalid' : ''}`}
                value={advertisementForm.area ?? ''}
                onChange={handleInputChange}
                onFocus={() => onFieldFocus('area')}
                onBlur={() => onFieldBlur('area')}
                onKeyPress={validateEnglishNumber}
                placeholder="أدخل المساحة"
                disabled={isSubmitting}
              />
              {shouldShowFieldFeedback('area') && (
                <div className="text-danger small mt-1">{getFieldError('area')}</div>
              )}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="mb-3">
              <label htmlFor="rent" className="form-label">
                القيمة *
              </label>
              <input
                type="number"
                id="rent"
                name="rent"
                className={`form-control ${shouldShowFieldFeedback('rent') ? 'is-invalid' : ''}`}
                value={advertisementForm.rent ?? ''}
                onChange={handleInputChange}
                onFocus={() => onFieldFocus('rent')}
                onBlur={() => onFieldBlur('rent')}
                onKeyPress={validateEnglishNumber}
                placeholder="أدخل القيمة"
                disabled={isSubmitting}
              />
              {shouldShowFieldFeedback('rent') && (
                <div className="text-danger small mt-1">{getFieldError('rent')}</div>
              )}
            </div>

            <div className={`${styles.currencySelection} form-check mb-3`}>
              <input
                className="form-check-input"
                type="checkbox"
                id="isUsdCheckbox"
                name="isUsd"
                checked={advertisementForm.isUsd}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              <label className="form-check-label" htmlFor="isUsdCheckbox">
                عرض السعر بالدولار الأمريكي
              </label>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">مدة عقد القيمة *</label>
          <div className={styles.optionsGroup}>
            {rentalDurations.map((duration) => (
              <button
                key={duration.value}
                type="button"
                className={`btn ${advertisementForm.rentalDuration === duration.value ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => selectRentalDuration(duration.value)}
                disabled={isSubmitting}
              >
                {duration.label}
              </button>
            ))}
          </div>
          {shouldShowFieldFeedback('rentalDuration') && (
            <div className="text-danger small mt-1">{getFieldError('rentalDuration')}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">عدد الدفعات *</label>
          <div className={styles.optionsGroup}>
            {paymentTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`btn ${advertisementForm.paymentType === type.value ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => selectPaymentType(type.value)}
                disabled={isSubmitting}
              >
                {type.label}
              </button>
            ))}
          </div>
          {shouldShowFieldFeedback('paymentType') && (
            <div className="text-danger small mt-1">{getFieldError('paymentType')}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">هل يوجد عمولة؟ *</label>
          <div className={styles.optionsGroup}>
            <button
              type="button"
              className={`btn ${advertisementForm.hasCommission === true ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => selectCommissionOption(true)}
              disabled={isSubmitting}
            >
              نعم
            </button>
            <button
              type="button"
              className={`btn ${advertisementForm.hasCommission === false ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => selectCommissionOption(false)}
              disabled={isSubmitting}
            >
              لا
            </button>
          </div>
        </div>

        {advertisementForm.hasCommission === true && (
          <div className="mb-3">
            <label htmlFor="commissionAmount" className="form-label">
              مبلغ العمولة *
            </label>
            <input
              type="number"
              id="commissionAmount"
              name="commissionAmount"
              className={`form-control ${shouldShowFieldFeedback('commissionAmount') ? 'is-invalid' : ''}`}
              value={advertisementForm.commissionAmount ?? ''}
              onChange={handleInputChange}
              onFocus={() => onFieldFocus('commissionAmount')}
              onBlur={() => onFieldBlur('commissionAmount')}
              onKeyPress={validateEnglishNumber}
              placeholder="أدخل مبلغ العمولة"
              disabled={isSubmitting}
            />
            {shouldShowFieldFeedback('commissionAmount') && (
              <div className="text-danger small mt-1">{getFieldError('commissionAmount')}</div>
            )}
          </div>
        )}
      </div>
    );
  }
);

Step4.displayName = 'Step4';

export default Step4;


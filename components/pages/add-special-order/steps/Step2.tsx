'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { AdvertisementOwnerInfo, AdvertisementFormState } from '@/lib/core/models/advertisement.models';
import { specialOrderService } from '@/lib/services/special-order';
import { useSpecialOrderState } from '@/lib/contexts/SpecialOrderContext';
import { showToast } from '@/lib/utils/toast';
import styles from '../AddSpecialOrderClient.module.css';

interface Step2Props {
  isSubmitting: boolean;
  advertisementFormState: AdvertisementFormState;
  onStepCompleted: (data: { advertisementData: AdvertisementOwnerInfo }) => void;
  onValidationStatusChanged: (data: { isValid: boolean; errors: string[] }) => void;
}

export interface Step2Handle {
  saveStep: () => Promise<{ advertisementData: AdvertisementOwnerInfo }>;
  checkIfInputsAreValid: () => boolean;
}

const Step2 = forwardRef<Step2Handle, Step2Props>(
  ({ isSubmitting, advertisementFormState, onStepCompleted, onValidationStatusChanged }, ref) => {
    const [advertisementForm, setAdvertisementForm] = useState<AdvertisementOwnerInfo>({
      ownerType: '0',
      idNumber: '',
      birthDate: '',
      contactNumber: '',
    });

    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [fieldInteractionStates, setFieldInteractionStates] = useState<{ [key: string]: boolean }>({});

    const ownerTypes = [
      { value: '0', label: 'فرد' },
      { value: '1', label: 'شركة' },
      { value: '2', label: 'متعدد المالك' },
    ];
    const { specialOrderId } = useSpecialOrderState();

    useEffect(() => {
      updateValidationStatus();
      if (!specialOrderId) {
        showToast('يرجى إكمال الخطوة الأولى أولاً', 'error');
      }
    }, []);

    useEffect(() => {
      if (advertisementFormState?.step2) {
        populateFormWithSavedData(advertisementFormState.step2);
      }
    }, [advertisementFormState?.step2]);

    const populateFormWithSavedData = (savedData: any) => {
      if (savedData) {
        setAdvertisementForm((prev) => ({
          ...prev,
          ...savedData,
        }));
        updateValidationStatus();
      }
    };

    const selectOwnerType = (type: string) => {
      setAdvertisementForm((prev) => ({ ...prev, ownerType: type }));
      validateField('ownerType');
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

    const validateField = (fieldName: string) => {
      let error = '';

      switch (fieldName) {
        case 'ownerType':
          if (!advertisementForm.ownerType) {
            error = 'نوع المالك مطلوب';
          }
          break;

        case 'idNumber':
          if (
            advertisementForm.idNumber &&
            advertisementForm.idNumber.trim().length > 0 &&
            advertisementForm.idNumber.trim().length < 10
          ) {
            error = 'رقم الهوية يجب أن يكون 10 أرقام على الأقل';
          }
          break;

        case 'birthDate':
          break;

        case 'contactNumber':
          if (
            advertisementForm.contactNumber &&
            advertisementForm.contactNumber.trim().length > 0 &&
            advertisementForm.contactNumber.trim().length < 10
          ) {
            error = 'رقم الصك يجب أن يكون 10 أرقام على الأقل';
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
      const fieldsToValidate = ['ownerType', 'idNumber', 'contactNumber'];
      fieldsToValidate.forEach((field) => validateField(field));

      const isValid = Object.keys(fieldErrors).length === 0;
      const errors = Object.values(fieldErrors);
      onValidationStatusChanged({ isValid, errors });
    };

    const saveStep = async (): Promise<{ advertisementData: AdvertisementOwnerInfo }> => {
      const fieldsToValidate = ['ownerType', 'idNumber', 'contactNumber'];
      fieldsToValidate.forEach((field) => validateField(field));

      if (Object.keys(fieldErrors).length > 0) {
        throw new Error('الرجاء تصحيح الأخطاء قبل المتابعة');
      }

      if (!specialOrderId) {
        throw new Error('لم يتم العثور على معرف الطلب الخاص');
      }

      try {
        const response = await specialOrderService.updateOwnerInfo({
          AdUnitUpdate: {
            Id: specialOrderId,
            Step: 2,
            OwnerType: parseInt(advertisementForm.ownerType),
            TitleDeedNumber: advertisementForm.idNumber,
            CompanyLicenseNumber: advertisementForm.contactNumber,
            CompanyEstablishedAt: advertisementForm.birthDate?.trim() || null,
          },
        });

        if (response.IsSuccess) {
          onStepCompleted({ advertisementData: advertisementForm });
          showToast('تم حفظ بيانات المالك بنجاح', 'success');
          return { advertisementData: advertisementForm };
        } else {
          showToast(response.Error || 'فشل في حفظ بيانات المالك', 'error');
          throw new Error(response.Error || 'فشل في حفظ بيانات المالك');
        }
      } catch (error: any) {
        console.error('Owner API Error:', error);
        showToast(error.message || 'فشل في حفظ بيانات المالك', 'error');
        throw error;
      }
    };

    const checkIfInputsAreValid = (): boolean => {
      const fieldsToValidate = ['ownerType', 'idNumber', 'birthDate', 'contactNumber'];
      fieldsToValidate.forEach((field) => validateField(field));
      return Object.keys(fieldErrors).length === 0;
    };

    useImperativeHandle(ref, () => ({
      saveStep,
      checkIfInputsAreValid,
    }));

    return (
      <div className={styles.stepContent}>
        <h3 className="mb-4">معلومات المالك</h3>

        <div className="mb-3">
          <label className="form-label">نوع المالك *</label>
          <div className="d-flex gap-2 flex-wrap">
            {ownerTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`btn ${advertisementForm.ownerType === type.value ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => selectOwnerType(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
          {shouldShowFieldFeedback('ownerType') && (
            <div className="text-danger small mt-1">{getFieldError('ownerType')}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">رقم الهوية *</label>
          <input
            type="text"
            className={`form-control ${shouldShowFieldFeedback('idNumber') ? 'is-invalid' : ''}`}
            value={advertisementForm.idNumber}
            onChange={(e) => setAdvertisementForm((prev) => ({ ...prev, idNumber: e.target.value }))}
            onFocus={() => onFieldFocus('idNumber')}
            onBlur={() => onFieldBlur('idNumber')}
            placeholder="أدخل رقم الهوية"
          />
          {shouldShowFieldFeedback('idNumber') && (
            <div className="text-danger small mt-1">{getFieldError('idNumber')}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">تاريخ الميلاد</label>
          <input
            type="date"
            className="form-control"
            value={advertisementForm.birthDate}
            onChange={(e) => setAdvertisementForm((prev) => ({ ...prev, birthDate: e.target.value }))}
            onFocus={() => onFieldFocus('birthDate')}
            onBlur={() => onFieldBlur('birthDate')}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">رقم الصك *</label>
          <input
            type="text"
            className={`form-control ${shouldShowFieldFeedback('contactNumber') ? 'is-invalid' : ''}`}
            value={advertisementForm.contactNumber}
            onChange={(e) => setAdvertisementForm((prev) => ({ ...prev, contactNumber: e.target.value }))}
            onFocus={() => onFieldFocus('contactNumber')}
            onBlur={() => onFieldBlur('contactNumber')}
            placeholder="أدخل رقم الصك"
          />
          {shouldShowFieldFeedback('contactNumber') && (
            <div className="text-danger small mt-1">{getFieldError('contactNumber')}</div>
          )}
        </div>
      </div>
    );
  }
);

Step2.displayName = 'Step2';

export default Step2;


'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { AdvertisementCategory, AdvertisementFormState } from '@/lib/core/models/advertisement.models';
import { specialOrderService } from '@/lib/services/special-order';
import { unitTypesService } from '@/lib/services/unit-types';
import { useSpecialOrderState } from '@/lib/contexts/SpecialOrderContext';
import { showToast } from '@/lib/utils/toast';
import styles from '../AddSpecialOrderClient.module.css';

interface Step3Props {
  isSubmitting: boolean;
  advertisementFormState: AdvertisementFormState;
  onStepCompleted: (data: { advertisementData: AdvertisementCategory }) => void;
  onValidationStatusChanged: (data: { isValid: boolean; errors: string[] }) => void;
}

export interface Step3Handle {
  saveStep: () => Promise<{ advertisementData: AdvertisementCategory }>;
  checkIfInputsAreValid: () => boolean;
}

const Step3 = forwardRef<Step3Handle, Step3Props>(
  ({ isSubmitting, advertisementFormState, onStepCompleted, onValidationStatusChanged }, ref) => {
    const [advertisementForm, setAdvertisementForm] = useState<AdvertisementCategory>({
      propertyType: 0,
    });

    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [fieldInteractionStates, setFieldInteractionStates] = useState<{ [key: string]: boolean }>({});

    const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
    const [isLoadingPropertyTypes, setIsLoadingPropertyTypes] = useState(false);
    const { specialOrderId } = useSpecialOrderState();

    useEffect(() => {
      loadPropertyTypes();
      updateValidationStatus();
    }, []);

    useEffect(() => {
      if (advertisementFormState?.step3) {
        populateFormWithSavedData(advertisementFormState.step3);
      }
    }, [advertisementFormState?.step3]);

    const populateFormWithSavedData = (savedData: any) => {
      if (savedData) {
        setAdvertisementForm((prev) => ({
          ...prev,
          ...savedData,
        }));
        updateValidationStatus();
      }
    };

    const loadPropertyTypes = async () => {
      setIsLoadingPropertyTypes(true);
      try {
        const propertyTypesData = await unitTypesService.getPropertyTypes();
        // For special orders, filter only special order types
        const filteredTypes = propertyTypesData.filter((pt: any) =>
          pt.label.includes('طلب خاص') || pt.label.includes('تسويق')
        );
        setPropertyTypes(filteredTypes);
      } catch (error: any) {
        console.error('Error loading property types:', error);
        showToast('فشل في تحميل أنواع العقارات', 'error');
      } finally {
        setIsLoadingPropertyTypes(false);
      }
    };

    const selectPropertyType = (value: number) => {
      setAdvertisementForm((prev) => ({ ...prev, propertyType: value }));
      validateField('propertyType');
      updateValidationStatus();
    };

    const validateField = (fieldName: string) => {
      let error = '';

      switch (fieldName) {
        case 'propertyType':
          if (advertisementForm.propertyType === undefined || advertisementForm.propertyType === null || advertisementForm.propertyType < 0) {
            error = 'نوع العقار مطلوب';
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
      const fieldsToValidate = ['propertyType'];
      fieldsToValidate.forEach((field) => validateField(field));

      const isValid = Object.keys(fieldErrors).length === 0;
      const errors = Object.values(fieldErrors);
      onValidationStatusChanged({ isValid, errors });
    };

    const saveStep = async (): Promise<{ advertisementData: AdvertisementCategory }> => {
      const fieldsToValidate = ['propertyType'];
      fieldsToValidate.forEach((field) => validateField(field));

      if (Object.keys(fieldErrors).length > 0) {
        throw new Error('الرجاء تصحيح الأخطاء قبل المتابعة');
      }

      if (!specialOrderId) {
        throw new Error('لم يتم العثور على معرف الطلب الخاص');
      }

      try {
        const response = await specialOrderService.updateUnitType({
          AdUnitUpdate: {
            Id: specialOrderId,
            Step: 3,
            UnitType: advertisementForm.propertyType,
          },
        });

        if (response.IsSuccess) {
          onStepCompleted({ advertisementData: advertisementForm });
          showToast('تم حفظ بيانات الوحدة بنجاح', 'success');
          return { advertisementData: advertisementForm };
        } else {
          showToast(response.Error || 'فشل في حفظ بيانات الوحدة', 'error');
          throw new Error(response.Error || 'فشل في حفظ بيانات الوحدة');
        }
      } catch (error: any) {
        console.error('Unit API Error:', error);
        showToast(error.message || 'فشل في حفظ بيانات الوحدة', 'error');
        throw error;
      }
    };

    const checkIfInputsAreValid = (): boolean => {
      const fieldsToValidate = ['propertyType'];
      fieldsToValidate.forEach((field) => validateField(field));
      return Object.keys(fieldErrors).length === 0;
    };

    useImperativeHandle(ref, () => ({
      saveStep,
      checkIfInputsAreValid,
    }));

    if (isLoadingPropertyTypes) {
      return (
        <div className={styles.stepContent}>
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">جاري التحميل...</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.stepContent}>
        <h3 className="mb-4">قسم العقار</h3>

        <div className="mb-3">
          <label className="form-label">نوع العقار *</label>
          <div className="d-flex gap-2 flex-wrap">
            {propertyTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`btn ${advertisementForm.propertyType === type.value ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => selectPropertyType(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
          {fieldErrors['propertyType'] && (
            <div className="text-danger small mt-1">{fieldErrors['propertyType']}</div>
          )}
        </div>
      </div>
    );
  }
);

Step3.displayName = 'Step3';

export default Step3;


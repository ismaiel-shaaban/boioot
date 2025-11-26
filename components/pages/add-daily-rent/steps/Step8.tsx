'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { AdvertisementFeatures, AdvertisementFormState } from '@/lib/core/models/advertisement.models';
import { dailyRentService } from '@/lib/services/daily-rent';
import { projectsService } from '@/lib/services/projects';
import { useDailyRentState } from '@/lib/contexts/DailyRentContext';
import { showToast } from '@/lib/utils/toast';
import styles from '../AddDailyRentClient.module.css';

interface Step8Props {
  isSubmitting: boolean;
  advertisementFormState: AdvertisementFormState;
  onStepCompleted: (data: { advertisementData: any }) => void;
  onValidationStatusChanged: (data: { isValid: boolean; errors: string[] }) => void;
}

export interface Step8Handle {
  saveStep: () => Promise<{ advertisementData: any }>;
  checkIfInputsAreValid: () => boolean;
}

const Step8 = forwardRef<Step8Handle, Step8Props>(
  ({ isSubmitting, advertisementFormState, onStepCompleted, onValidationStatusChanged }, ref) => {
    const [featuresForm, setFeaturesForm] = useState({
      selectedFeatures: [] as string[],
    });

    const [features, setFeatures] = useState<any[]>([]);
    const [newFeatureForm, setNewFeatureForm] = useState({ name: '' });
    const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
    const [isAddingFeature, setIsAddingFeature] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [fieldInteractionStates, setFieldInteractionStates] = useState<{ [key: string]: boolean }>({});

    const { dailyRentId: advertisementId } = useDailyRentState();

    useEffect(() => {
      updateValidationStatus();
      getFeatures();
    }, []);

    useEffect(() => {
      if (advertisementFormState?.step8) {
        populateFormWithSavedData(advertisementFormState.step8);
      }
    }, [advertisementFormState?.step8]);

    useEffect(() => {
      if (features.length > 0 && advertisementFormState?.step8?.features) {
        mapFeatureNamesToIds();
      }
    }, [features, advertisementFormState?.step8]);

    const getFeatures = async () => {
      try {
        const response = await projectsService.getFeaturesUnits();
        if (response.IsSuccess) {
          let featuresData: any[] = [];
          
          if (Array.isArray(response.Data)) {
            featuresData = response.Data;
          } else if (response.Data && Array.isArray((response.Data as any).Items)) {
            featuresData = (response.Data as any).Items;
          }
          
          setFeatures(featuresData);
        } else {
          showToast(response.Error || 'فشل في جلب المميزات', 'error');
        }
      } catch (error: any) {
        showToast(error.error?.Error || 'فشل في جلب المميزات', 'error');
      }
    };

    const mapFeatureNamesToIds = () => {
      if (advertisementFormState?.step8?.features && features.length > 0) {
        const featureNames = advertisementFormState.step8.features;
        const featureIds: string[] = [];

        featureNames.forEach((featureName: string) => {
          const feature = features.find((f) => f.Name === featureName);
          if (feature) {
            featureIds.push(feature.Id);
          }
        });

        setFeaturesForm((prev) => ({ ...prev, selectedFeatures: featureIds }));
        updateValidationStatus();
      }
    };

    const populateFormWithSavedData = (savedData: any) => {
      if (savedData) {
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

    const isFeatureSelected = (feature: any): boolean => {
      return featuresForm.selectedFeatures.includes(feature?.Id);
    };

    const toggleFeature = (feature: any) => {
      setFeaturesForm((prev) => {
        const index = prev.selectedFeatures.indexOf(feature?.Id);
        const newSelected = [...prev.selectedFeatures];

        if (index > -1) {
          newSelected.splice(index, 1);
        } else {
          newSelected.push(feature?.Id);
        }

        return { ...prev, selectedFeatures: newSelected };
      });
      validateField('selectedFeatures');
      updateValidationStatus();
    };

    const openAddFeatureModal = () => {
      setShowAddFeatureModal(true);
      setNewFeatureForm({ name: '' });
    };

    const closeAddFeatureModal = () => {
      setShowAddFeatureModal(false);
      setNewFeatureForm({ name: '' });
    };

    const addNewFeature = async () => {
      if (!newFeatureForm.name.trim()) {
        showToast('يجب إدخال اسم الميزة', 'error');
        return;
      }

      setIsAddingFeature(true);
      try {
        const featureData = {
          featureName: newFeatureForm.name.trim(),
        };

        const response = await projectsService.addNewUnitFeature(featureData);
        if (response.IsSuccess) {
          showToast('تم إضافة الميزة بنجاح', 'success');
          closeAddFeatureModal();
          await getFeatures();
        } else {
          showToast(response.Error || 'فشل في إضافة الميزة', 'error');
        }
      } catch (error: any) {
        showToast(error.error?.Error || 'فشل في إضافة الميزة', 'error');
      } finally {
        setIsAddingFeature(false);
      }
    };

    const validateField = (fieldName: string) => {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        newErrors[fieldName] = '';

        switch (fieldName) {
          case 'selectedFeatures':
            if (featuresForm.selectedFeatures.length === 0) {
              newErrors[fieldName] = 'يجب اختيار ميزة واحدة على الأقل';
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

    const saveStep = async (): Promise<{ advertisementData: any }> => {
      ['selectedFeatures'].forEach((field) => {
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
        const featuresData = {
          features: featuresForm.selectedFeatures,
          Id: advertisementId,
          Step: 8,
        };

        const response = await dailyRentService.updateAdvertisementFeatures({ Unit: featuresData });

        if (response.IsSuccess) {
          showToast('تم حفظ مميزات الإعلان اليومي بنجاح', 'success');
          onStepCompleted({ advertisementData: advertisementFormState });
          return { advertisementData: advertisementFormState };
        } else {
          showToast(response.Error || 'فشل في حفظ مميزات الإعلان اليومي', 'error');
          throw new Error(response.Error || 'فشل في حفظ مميزات الإعلان اليومي');
        }
      } catch (error: any) {
        showToast(error.message || 'فشل في حفظ مميزات الإعلان اليومي', 'error');
        throw error;
      }
    };

    const checkIfInputsAreValid = (): boolean => {
      return featuresForm.selectedFeatures.length > 0;
    };

    useImperativeHandle(ref, () => ({
      saveStep,
      checkIfInputsAreValid,
    }));

    return (
      <div className={styles.stepContent}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <p className="mb-0">اختر المميزات المتوفرة في الإعلان اليومي</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={openAddFeatureModal}>
            <i className="fa-solid fa-plus me-2"></i>
            إضافة ميزة جديدة
          </button>
        </div>

        <div className="d-flex flex-wrap gap-2 mb-3">
          {features.map((feature) => (
            <button
              key={feature.Id}
              type="button"
              className={`btn ${isFeatureSelected(feature) ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => toggleFeature(feature)}
            >
              {feature?.Name}
            </button>
          ))}
        </div>

        {fieldErrors['selectedFeatures'] && (
          <div className="alert alert-warning mt-3">
            <i className="fa-solid fa-exclamation-triangle me-2"></i>
            {fieldErrors['selectedFeatures']}
          </div>
        )}

        {showAddFeatureModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">إضافة ميزة جديدة</h5>
                  <button type="button" className="btn-close" onClick={closeAddFeatureModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="featureName" className="form-label">
                      اسم الميزة *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="featureName"
                      value={newFeatureForm.name}
                      onChange={(e) => setNewFeatureForm({ name: e.target.value })}
                      placeholder="أدخل اسم الميزة"
                      disabled={isAddingFeature}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeAddFeatureModal}
                    disabled={isAddingFeature}
                  >
                    إلغاء
                  </button>
                  <button type="button" className="btn btn-primary" onClick={addNewFeature} disabled={isAddingFeature}>
                    {isAddingFeature && <span className="spinner-border spinner-border-sm me-2" role="status"></span>}
                    {isAddingFeature ? 'جاري الإضافة...' : 'إضافة الميزة'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddFeatureModal && <div className="modal-backdrop fade show"></div>}
      </div>
    );
  }
);

Step8.displayName = 'Step8';

export default Step8;


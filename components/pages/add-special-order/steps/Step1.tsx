'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useParams } from 'next/navigation';
import { AdvertisementBasicInfo, AdvertisementFormState } from '@/lib/core/models/advertisement.models';
import { licensesService } from '@/lib/services/licenses';
import { specialOrderService } from '@/lib/services/special-order';
import { useSpecialOrderState } from '@/lib/contexts/SpecialOrderContext';
import { showToast } from '@/lib/utils/toast';
import { environment } from '@/lib/config/environment';
import styles from '../AddSpecialOrderClient.module.css';

interface Step1Props {
  isSubmitting: boolean;
  advertisementFormState: AdvertisementFormState;
  onStepCompleted: (data: { advertisementData: AdvertisementBasicInfo }) => void;
  onValidationStatusChanged: (data: { isValid: boolean; errors: string[] }) => void;
}

export interface Step1Ref {
  checkIfInputsAreValid: () => boolean;
  saveStep: () => Promise<{ advertisementData: AdvertisementBasicInfo }>;
  getValidationErrors: () => string[];
}

const Step1 = forwardRef<Step1Ref, Step1Props>(
  ({ isSubmitting, advertisementFormState, onStepCompleted, onValidationStatusChanged }, ref) => {
    const params = useParams();
    const { setSpecialOrderId } = useSpecialOrderState();
    const [advertisementForm, setAdvertisementForm] = useState<AdvertisementBasicInfo>({
      propertyLicense: null,
      licenseId: '',
      adTitle: '',
      adDescription: '',
    });
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [fieldInteractionStates, setFieldInteractionStates] = useState<{ [key: string]: boolean }>({});
    const [showLicenseModal, setShowLicenseModal] = useState(false);
    const [uploadedLicense, setUploadedLicense] = useState<File | null>(null);
    const [licenses, setLicenses] = useState<any[]>([]);
    const baseUrl = environment.baseApiUrl;

    useEffect(() => {
      const id = params?.id as string;
      if (id) {
        setAdvertisementForm((prev) => ({ ...prev, adId: id }));
      }
      updateValidationStatus();
      getLicenses();
    }, []);

    useEffect(() => {
      if (advertisementFormState?.step1) {
        populateFormWithSavedData(advertisementFormState.step1);
      }
    }, [advertisementFormState?.step1]);

    const populateFormWithSavedData = (savedData: any) => {
      if (savedData) {
        setAdvertisementForm((prev) => ({
          ...prev,
          ...savedData,
        }));
        updateValidationStatus();
      }
    };

    const getLicenses = async () => {
      try {
        const res = await licensesService.getLicenses();
        if (res?.IsSuccess) {
          const licensesData = Array.isArray(res?.Data) ? res.Data : [];
          setLicenses(licensesData);
        } else {
          showToast(res?.Error || 'فشل في تحميل الرخص', 'error');
        }
      } catch (error: any) {
        console.error('Error fetching licenses:', error);
        showToast(error?.message || 'حدث خطأ', 'error');
      }
    };

    const openLicenseModal = () => {
      setShowLicenseModal(true);
    };

    const closeLicenseModal = () => {
      setShowLicenseModal(false);
    };

    const selectLicense = (license: any) => {
      setAdvertisementForm((prev) => ({ ...prev, licenseId: license.Id }));
      setShowLicenseModal(false);
      showToast('تم اختيار الرخصة بنجاح', 'success');
      validateField('licenseId');
      updateValidationStatus();
    };

    const removeLicense = () => {
      setAdvertisementForm((prev) => ({ ...prev, licenseId: '', propertyLicense: null }));
      validateField('licenseId');
      updateValidationStatus();
    };

    const onLicenseUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        setUploadedLicense(files[0]);
        await addNewLicense(files[0]);
      }
    };

    const addNewLicense = async (file: File) => {
      if (!file) {
        showToast('يرجى اختيار ملف', 'error');
        return;
      }

      try {
        const uploadResponse = await licensesService.uploadUserLicense(file);
        if (uploadResponse?.IsSuccess) {
          const url = uploadResponse.Data;
          await getLicenses();
          const license = licenses.find((l) => l.AttachmentUrl === url);
          if (license) {
            setAdvertisementForm((prev) => ({ ...prev, licenseId: license.Id }));
            showToast('تم إضافة الرخصة بنجاح', 'success');
            setUploadedLicense(null);
            validateField('propertyLicense');
            updateValidationStatus();
          } else {
            showToast('تم رفع الملف ولكن لم يتم العثور على الرخصة', 'warning');
          }
        } else {
          showToast('فشل في إضافة الرخصة', 'error');
        }
      } catch (error: any) {
        console.error('Error adding license:', error);
        showToast(error?.message || 'حدث خطأ', 'error');
      }
    };

    const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        setAdvertisementForm((prev) => ({ ...prev, propertyLicense: files[0] }));
        validateField('propertyLicense');
        updateValidationStatus();
      }
    };

    const removeFile = () => {
      setAdvertisementForm((prev) => ({ ...prev, propertyLicense: null }));
      validateField('propertyLicense');
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
        case 'adTitle':
          if (!advertisementForm.adTitle || advertisementForm.adTitle.trim().length < 3) {
            error = 'عنوان الإعلان مطلوب ويجب أن يكون 3 أحرف على الأقل';
          }
          break;

        case 'adDescription':
          if (!advertisementForm.adDescription || advertisementForm.adDescription.trim().length < 10) {
            error = 'وصف الإعلان مطلوب ويجب أن يكون 10 أحرف على الأقل';
          }
          break;

        case 'licenseId':
          // License is optional for special orders
          break;

        case 'propertyLicense':
          // Property license is optional
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
      const fieldsToValidate = ['adTitle', 'adDescription'];
      fieldsToValidate.forEach((field) => validateField(field));

      const isValid = Object.keys(fieldErrors).length === 0;
      const errors = Object.values(fieldErrors);
      onValidationStatusChanged({ isValid, errors });
    };

    const saveStep = async (): Promise<{ advertisementData: AdvertisementBasicInfo }> => {
      const fieldsToValidate = ['adTitle', 'adDescription'];
      fieldsToValidate.forEach((field) => validateField(field));

      if (Object.keys(fieldErrors).length > 0) {
        throw new Error('الرجاء تصحيح الأخطاء قبل المتابعة');
      }

      try {
        let response;
        if (advertisementForm.adId) {
          // Edit mode - update existing
          response = await specialOrderService.updateAdvertisementBasicInfo({
            AdUpdate: {
              Id: advertisementForm.adId,
              Title: advertisementForm.adTitle,
              Description: advertisementForm.adDescription,
              LicenceId: advertisementForm.licenseId || null,
            },
          });
        } else {
          // Create mode - create new
          response = await specialOrderService.createAdvertisementBasicInfo({
            SpecialOrder: {
              Title: advertisementForm.adTitle,
              Description: advertisementForm.adDescription,
              LicenceId: advertisementForm.licenseId || null,
            },
          });

          if (response?.IsSuccess && response?.Data) {
            const data = response.Data as any;
            if (data?.Id) {
              setSpecialOrderId(data.Id);
              if (typeof window !== 'undefined') {
                localStorage.setItem('currentSpecialOrderId', data.Id);
              }
              setAdvertisementForm((prev) => ({ ...prev, adId: data.Id }));
            }
          }
        }

        if (response?.IsSuccess) {
          onStepCompleted({ advertisementData: advertisementForm });
          showToast('تم حفظ بيانات الإعلان بنجاح', 'success');
          return { advertisementData: advertisementForm };
        } else {
          showToast(response?.Error || 'فشل في حفظ بيانات الإعلان', 'error');
          throw new Error(response?.Error || 'فشل في حفظ بيانات الإعلان');
        }
      } catch (error: any) {
        console.error('Basic Info API Error:', error);
        showToast(error?.message || 'فشل في حفظ بيانات الإعلان', 'error');
        throw error;
      }
    };

    const checkIfInputsAreValid = (): boolean => {
      const fieldsToValidate = ['adTitle', 'adDescription'];
      fieldsToValidate.forEach((field) => validateField(field));
      return Object.keys(fieldErrors).length === 0;
    };

    const getValidationErrors = (): string[] => {
      return Object.values(fieldErrors);
    };

    useImperativeHandle(ref, () => ({
      saveStep,
      checkIfInputsAreValid,
      getValidationErrors,
    }));

    const selectedLicense = licenses.find((l) => l.Id === advertisementForm.licenseId);

    return (
      <div className={styles.stepContent}>
        <h3 className="mb-4">بيانات الإعلان</h3>

        <div className="mb-3">
          <label className="form-label">عنوان الإعلان *</label>
          <input
            type="text"
            className={`form-control ${shouldShowFieldFeedback('adTitle') ? 'is-invalid' : ''}`}
            value={advertisementForm.adTitle}
            onChange={(e) => setAdvertisementForm((prev) => ({ ...prev, adTitle: e.target.value }))}
            onFocus={() => onFieldFocus('adTitle')}
            onBlur={() => onFieldBlur('adTitle')}
            placeholder="أدخل عنوان الإعلان"
          />
          {shouldShowFieldFeedback('adTitle') && (
            <div className="text-danger small mt-1">{getFieldError('adTitle')}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">وصف الإعلان *</label>
          <textarea
            className={`form-control ${shouldShowFieldFeedback('adDescription') ? 'is-invalid' : ''}`}
            value={advertisementForm.adDescription}
            onChange={(e) => setAdvertisementForm((prev) => ({ ...prev, adDescription: e.target.value }))}
            onFocus={() => onFieldFocus('adDescription')}
            onBlur={() => onFieldBlur('adDescription')}
            rows={5}
            placeholder="أدخل وصف الإعلان"
          />
          {shouldShowFieldFeedback('adDescription') && (
            <div className="text-danger small mt-1">{getFieldError('adDescription')}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">الرخصة (اختياري)</label>
          <div className="d-flex gap-2 align-items-center">
            {selectedLicense ? (
              <>
                <span className="text-success">{selectedLicense.Name || 'رخصة محددة'}</span>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={removeLicense}>
                  <i className="fa fa-times"></i>
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-outline-primary" onClick={openLicenseModal}>
                  <i className="fa fa-list me-2"></i>
                  اختر رخصة موجودة
                </button>
                <input
                  type="file"
                  className="d-none"
                  id="license-upload"
                  accept="image/*,.pdf"
                  onChange={onLicenseUpload}
                />
                <label htmlFor="license-upload" className="btn btn-outline-success">
                  <i className="fa fa-upload me-2"></i>
                  رفع رخصة جديدة
                </label>
              </>
            )}
          </div>
        </div>

        {advertisementForm.propertyLicense && (
          <div className="mb-3">
            <div className="alert alert-info d-flex justify-content-between align-items-center">
              <span>
                <i className="fa fa-file me-2"></i>
                {advertisementForm.propertyLicense.name}
              </span>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={removeFile}>
                <i className="fa fa-times"></i>
              </button>
            </div>
          </div>
        )}

        {showLicenseModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">اختر الرخصة</h5>
                  <button type="button" className="btn-close" onClick={closeLicenseModal}></button>
                </div>
                <div className="modal-body">
                  {licenses.length > 0 ? (
                    <div className="list-group">
                      {licenses.map((license) => (
                        <button
                          key={license.Id}
                          type="button"
                          className={`list-group-item list-group-item-action ${
                            license.Id === advertisementForm.licenseId ? 'active' : ''
                          }`}
                          onClick={() => selectLicense(license)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{license.Name || 'رخصة بدون اسم'}</h6>
                              {license.AttachmentUrl && (
                                <small className="text-muted">
                                  <a
                                    href={`${baseUrl}/${license.AttachmentUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    عرض الرخصة
                                  </a>
                                </small>
                              )}
                            </div>
                            {license.Id === advertisementForm.licenseId && (
                              <i className="fa fa-check text-success"></i>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-info">لا توجد رخص متاحة</div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeLicenseModal}>
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showLicenseModal && <div className="modal-backdrop fade show"></div>}
      </div>
    );
  }
);

Step1.displayName = 'Step1';

export default Step1;


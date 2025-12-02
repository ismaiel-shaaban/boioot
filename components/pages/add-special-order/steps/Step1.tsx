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
import licenseStyles from '../../add-advertisement/AddAdvertisementClient.module.css';

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
            Order: {
              Id: advertisementForm.adId,
              Step: 1,
              LicenceId: advertisementForm.licenseId || null,
              Title: advertisementForm.adTitle,
              Description: advertisementForm.adDescription,
            },
          });
        } else {
          // Create mode - create new
          response = await specialOrderService.createAdvertisementBasicInfo({
            Order: {
              UnitType: 0,
              ContactInfo: '',
              City: '',
              District: '',
              LicenceId: advertisementForm.licenseId || null,
              Title: advertisementForm.adTitle,
              Description: advertisementForm.adDescription,
            },
          });

          if (response?.IsSuccess && response?.Data) {
            const adId = typeof response.Data === 'string' ? response.Data : String(response.Data);
            setSpecialOrderId(adId);
            if (typeof window !== 'undefined') {
              localStorage.setItem('currentSpecialOrderId', adId);
            }
            setAdvertisementForm((prev) => ({ ...prev, adId }));
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

        {/* License Section - At top like Angular */}
        <div className="form-group mb-4">
          <div className={licenseStyles.licenseUploadArea}>
            <div className={licenseStyles.uploadPlaceholder}>
              <label className="form-label">(اختياري) إضافة رخصة العقار</label>

              {/* Show different content based on license status */}
              {!advertisementForm.licenseId ? (
                <div className={licenseStyles.previousLicense} onClick={openLicenseModal} aria-label="اختر رخصة أضفتها سابقاً">
                  <i className="fa-solid fa-folder-open me-2"></i>
                  اختر رخصة أضفتها سابقاً
                </div>
              ) : (
                <div className={licenseStyles.licenseAdded}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <i className="fa-solid fa-check-circle me-2"></i>
                      تمت الإضافة
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-danger remove-license-btn" onClick={removeLicense} aria-label="إزالة الرخصة">
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>
                </div>
              )}

              <input
                type="file"
                id="license-upload"
                className={licenseStyles.fileInput}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={onLicenseUpload}
                onFocus={() => onFieldFocus('propertyLicense')}
                onBlur={() => onFieldBlur('propertyLicense')}
                aria-label="رفع رخصة العقار"
              />
              <label htmlFor="license-upload" className={licenseStyles.uploadBtn}>
                <span>إضافة رخصة</span>
              </label>
            </div>
            {shouldShowFieldFeedback('propertyLicense') && (
              <div className="invalid-feedback">{getFieldError('propertyLicense')}</div>
            )}
          </div>
        </div>

        <div className="form-floating mb-4">
          <input
            type="text"
            className={`form-control ${shouldShowFieldFeedback('adTitle') ? 'is-invalid' : ''}`}
            value={advertisementForm.adTitle}
            onChange={(e) => {
              setAdvertisementForm((prev) => ({ ...prev, adTitle: e.target.value }));
              onFieldChange('adTitle');
            }}
            onFocus={() => onFieldFocus('adTitle')}
            onBlur={() => onFieldBlur('adTitle')}
            placeholder="اسم الإعلان"
          />
          <label htmlFor="add-address">اسم الإعلان</label>
          {shouldShowFieldFeedback('adTitle') && (
            <div className="error-message">{getFieldError('adTitle')}</div>
          )}
        </div>

        <div className="form-floating mb-4">
          <textarea
            className={`form-control ${shouldShowFieldFeedback('adDescription') ? 'is-invalid' : ''}`}
            value={advertisementForm.adDescription}
            onChange={(e) => {
              setAdvertisementForm((prev) => ({ ...prev, adDescription: e.target.value }));
              onFieldChange('adDescription');
            }}
            onFocus={() => onFieldFocus('adDescription')}
            onBlur={() => onFieldBlur('adDescription')}
            rows={4}
            placeholder="وصف الإعلان"
          />
          <label htmlFor="add-description">وصف الإعلان</label>
          {shouldShowFieldFeedback('adDescription') && (
            <div className="error-message">{getFieldError('adDescription')}</div>
          )}
        </div>

        {/* License Modal - Matching Angular design */}
        {showLicenseModal && (
          <div className={licenseStyles.modalOverlay} onClick={closeLicenseModal}>
            <div className={licenseStyles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={licenseStyles.modalHeader}>
                <h3 className={licenseStyles.modalTitle}>الرخص السابقة</h3>
                <button type="button" className={licenseStyles.modalClose} onClick={closeLicenseModal}>
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              <div className={licenseStyles.modalBody}>
                {licenses && licenses.length > 0 ? (
                  <div className="row">
                    {licenses.map((license) => (
                      <div key={license.Id} className="col-lg-6 mb-4">
                        <div className={licenseStyles.licenseItem}>
                          {/* Checkbox for selection */}
                          <div className={licenseStyles.licenseCheckboxContainer}>
                            <input
                              type="checkbox"
                              id={`license-${license.Id}`}
                              checked={advertisementForm.licenseId === license.Id}
                              onChange={() => selectLicense(license)}
                              className={licenseStyles.licenseCheckbox}
                            />
                            <label htmlFor={`license-${license.Id}`} className={licenseStyles.licenseCheckboxLabel}>
                              <i className="fa-solid fa-check"></i>
                            </label>
                          </div>

                          {license?.AttachmentUrl && (
                            <div className={licenseStyles.licensePreview}>
                              {/* Preview Link - Opens in new tab */}
                              <a
                                href={license.AttachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={licenseStyles.previewLink}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {license.AttachmentUrl?.toLowerCase().endsWith('.pdf') ? (
                                  <div className={licenseStyles.pdfPreview}>
                                    <img
                                      src="/assets/images/pdf.png"
                                      alt="License Preview"
                                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                      loading="lazy"
                                    />
                                  </div>
                                ) : (
                                  <img
                                    src={license.AttachmentUrl}
                                    alt="License Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
                                    loading="lazy"
                                  />
                                )}
                              </a>

                              {/* File Type Badge */}
                              {license.AttachmentUrl?.toLowerCase().endsWith('.pdf') && (
                                <div className={`${licenseStyles.fileType} ${licenseStyles.pdf}`}>PDF</div>
                              )}
                              {(license.AttachmentUrl?.toLowerCase().endsWith('.jpg') ||
                                license.AttachmentUrl?.toLowerCase().endsWith('.jpeg')) && (
                                <div className={`${licenseStyles.fileType} ${licenseStyles.jpg}`}>JPG</div>
                              )}
                              {license.AttachmentUrl?.toLowerCase().endsWith('.png') && (
                                <div className={`${licenseStyles.fileType} ${licenseStyles.png}`}>PNG</div>
                              )}

                              {/* Selected Indicator */}
                              {advertisementForm.licenseId === license.Id && (
                                <div className={licenseStyles.selectedIndicator}>
                                  <i className="fa-solid fa-check"></i>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-12">
                      <div className="alert alert-info text-center" role="alert">
                        لايوجد الترخيصات
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Step1.displayName = 'Step1';

export default Step1;


'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useParams } from 'next/navigation';
import { AdvertisementBasicInfo, AdvertisementFormState } from '@/lib/core/models/advertisement.models';
import { licensesService } from '@/lib/services/licenses';
import { advertisementService } from '@/lib/services/advertisement';
import { useAdvertisementState } from '@/lib/contexts/AdvertisementContext';
import { showToast } from '@/lib/utils/toast';
import { environment } from '@/lib/config/environment';
import styles from '../AddAdvertisementClient.module.css';

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
    const { setAdvertisementId } = useAdvertisementState();
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
    }, [advertisementFormState]);

    const populateFormWithSavedData = (savedData: any) => {
      if (savedData) {
        setAdvertisementForm((prev) => ({
          ...prev,
          ...savedData,
        }));
        updateValidationStatus();
      }
    };

    const getLicenses = async (): Promise<any[]> => {
      try {
        const res = await licensesService.getLicenses();
        if (res?.IsSuccess) {
          const data = ((res?.Data as any) || []) as any[];
          setLicenses(data);
          return data;
        } else {
          showToast(res?.Error || 'فشل في تحميل الرخص', 'error');
          return [];
        }
      } catch (error: any) {
        console.error('Error fetching licenses:', error);
        showToast(error?.message || 'حدث خطأ', 'error');
        return [];
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
      setAdvertisementForm((prev) => ({
        ...prev,
        licenseId: '',
        propertyLicense: null,
      }));
      validateField('licenseId');
      updateValidationStatus();
    };

    const formatDate = (value?: string) => {
      if (!value) return '';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const onLicenseUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        setUploadedLicense(files[0]);
        addNewLicense();
      }
    };

    const addNewLicense = async () => {
      if (!uploadedLicense) {
        showToast('يرجى اختيار ملف', 'error');
        return;
      }

      try {
        const uploadResponse = await licensesService.uploadUserLicense(uploadedLicense);
        if (uploadResponse?.IsSuccess) {
          const url = uploadResponse.Data;
          const latestLicenses = await getLicenses();
          const license = latestLicenses.find((l) => l.AttachmentUrl === url);
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
        case 'propertyLicense':
          if (advertisementForm.propertyLicense) {
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(advertisementForm.propertyLicense.type)) {
              error = 'يجب أن يكون الملف من نوع PDF أو صورة';
            } else if (advertisementForm.propertyLicense.size > 5 * 1024 * 1024) {
              error = 'حجم الملف يجب أن يكون أقل من 5 ميجابايت';
            }
          }
          break;

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
      }

      setFieldErrors((prev) => {
        if (error) {
          return { ...prev, [fieldName]: error };
        } else {
          const { [fieldName]: _, ...rest } = prev;
          return rest;
        }
      });
    };

    const updateValidationStatus = () => {
      const fieldsToValidate = ['propertyLicense', 'licenseId', 'adTitle', 'adDescription'];
      fieldsToValidate.forEach((field) => validateField(field));

      const isValid = Object.keys(fieldErrors).length === 0;
      const errors = Object.values(fieldErrors);

      onValidationStatusChanged({ isValid, errors });
    };

    const saveStep = async (): Promise<{ advertisementData: AdvertisementBasicInfo }> => {
      const fieldsToValidate = ['propertyLicense', 'licenseId', 'adTitle', 'adDescription'];
      fieldsToValidate.forEach((field) => validateField(field));

      if (Object.keys(fieldErrors).length > 0) {
        throw new Error('الرجاء تصحيح الأخطاء قبل المتابعة');
      }

      const adData = {
        LicenceId: advertisementForm.licenseId || null,
        Title: advertisementForm.adTitle,
        Description: advertisementForm.adDescription,
        MediaFileIds: [],
      };

      if (advertisementForm.adId) {
        const updateData = {
          AdUnitUpdate: {
            Id: advertisementForm.adId,
            Step: 1,
            LicenceId: adData.LicenceId,
            Title: adData.Title,
            Description: adData.Description,
          },
        };

        try {
          const response = await advertisementService.updateAdvertisementBasicInfo(updateData);
          if (response?.IsSuccess) {
            onStepCompleted({ advertisementData: advertisementForm });
            showToast('تم تحديث الإعلان بنجاح', 'success');
            return { advertisementData: advertisementForm };
          } else {
            showToast(response?.Error || 'فشل في تحديث الإعلان', 'error');
            throw new Error(response?.Error || 'فشل في تحديث الإعلان');
          }
        } catch (error: any) {
          console.error('Advertisement API Error:', error);
          showToast(error?.message || 'فشل في تحديث الإعلان', 'error');
          throw error;
        }
      } else {
        try {
          const response = await advertisementService.createAdvertisementBasicInfo({ Ad: adData });
          if (response?.IsSuccess) {
            const adId = response.Data as string;
            setAdvertisementId(adId);
            setAdvertisementForm((prev) => ({ ...prev, adId }));
            onStepCompleted({ advertisementData: { ...advertisementForm, adId } });
            showToast('تم حفظ الإعلان بنجاح', 'success');
            return { advertisementData: { ...advertisementForm, adId } };
          } else {
            showToast(response?.Error || 'فشل في حفظ الإعلان', 'error');
            throw new Error(response?.Error || 'فشل في حفظ الإعلان');
          }
        } catch (error: any) {
          console.error('Advertisement API Error:', error);
          showToast(error?.message || 'فشل في حفظ الإعلان', 'error');
          throw error;
        }
      }
    };

    const checkIfInputsAreValid = (): boolean => {
      const fieldsToValidate = ['propertyLicense', 'licenseId', 'adTitle', 'adDescription'];
      fieldsToValidate.forEach((field) => validateField(field));
      return Object.keys(fieldErrors).length === 0;
    };

    const getValidationErrors = (): string[] => {
      return Object.values(fieldErrors);
    };

    useImperativeHandle(ref, () => ({
      checkIfInputsAreValid,
      saveStep,
      getValidationErrors,
    }));

    return (
      <div className={styles.stepContent}>
        <div className="form-group mb-4">
          <div className={styles.licenseUploadArea}>
            <div className={styles.uploadPlaceholder}>
              <label className={styles.formLabel}>(اختياري) إضافة رخصة العقار</label>

              {!advertisementForm?.licenseId && (
                <div className={styles.previousLicense} onClick={openLicenseModal}>
                  <i className="fa-solid fa-folder-open me-2"></i>
                  اختر رخصة أضفتها سابقاً
                </div>
              )}

              {advertisementForm?.licenseId && (
                <div className={styles.licenseAdded}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <i className="fa-solid fa-check-circle me-2"></i>
                      تمت الإضافة
                    </div>
                    <button
                      type="button"
                      className={`btn btn-sm btn-outline-danger ${styles.removeLicenseBtn}`}
                      onClick={removeLicense}
                      aria-label="إزالة الرخصة"
                    >
                      <i className="fa-solid fa-times"></i>
                    </button>
                  </div>
                </div>
              )}

              <input
                type="file"
                id="license-upload"
                className={styles.fileInput}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={onLicenseUpload}
                onFocus={() => onFieldFocus('propertyLicense')}
                onBlur={() => onFieldBlur('propertyLicense')}
                aria-label="رفع رخصة العقار"
              />
              <label htmlFor="license-upload" className={styles.uploadBtn} style={{ padding: '12px 35px', backgroundColor: '#2d7c18', color: 'white' }} aria-label="زر رفع الرخصة">
                <span>إضافة رخصة</span>
              </label>
            </div>
            {shouldShowFieldFeedback('propertyLicense') && (
              <div className={styles.invalidFeedback}>{getFieldError('propertyLicense')}</div>
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
              validateField('adTitle');
              updateValidationStatus();
            }}
            onFocus={() => onFieldFocus('adTitle')}
            onBlur={() => onFieldBlur('adTitle')}
            placeholder="عنوان الإعلان"
          />
          <label htmlFor="add-address">عنوان الإعلان</label>
          {shouldShowFieldFeedback('adTitle') && <div className={styles.errorMessage}>{getFieldError('adTitle')}</div>}
        </div>

        <div className="form-floating mb-4">
          <textarea
            className={`form-control ${shouldShowFieldFeedback('adDescription') ? 'is-invalid' : ''}`}
            rows={4}
            value={advertisementForm.adDescription}
            onChange={(e) => {
              setAdvertisementForm((prev) => ({ ...prev, adDescription: e.target.value }));
              validateField('adDescription');
              updateValidationStatus();
            }}
            onFocus={() => onFieldFocus('adDescription')}
            onBlur={() => onFieldBlur('adDescription')}
            placeholder="وصف الإعلان"
          />
          <label htmlFor="add-description">وصف الإعلان</label>
          {shouldShowFieldFeedback('adDescription') && <div className={styles.errorMessage}>{getFieldError('adDescription')}</div>}
        </div>

        {/* License Modal */}
        {showLicenseModal && (
          <div className={styles.modalOverlay} onClick={closeLicenseModal}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>الرخص السابقة</h3>
                <button type="button" className={styles.modalClose} onClick={closeLicenseModal} aria-label="إغلاق نافذة الرخص السابقة">
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              <div className={styles.modalBody}>
                {licenses && licenses.length > 0 ? (
                  <div className="row">
                    {licenses.map((license) => {
                      const isSelected = advertisementForm.licenseId === license.Id;
                      return (
                        <div key={license.Id} className="col-lg-6 mb-4">
                          <div
                            className={`${styles.licenseItem} ${isSelected ? styles.licenseItemActive : ''}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => selectLicense(license)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                selectLicense(license);
                              }
                            }}
                          >
                            <div className={styles.licenseCheckboxContainer}>
                              <input
                                type="checkbox"
                                id={`license-${license.Id}`}
                                checked={isSelected}
                                onChange={() => selectLicense(license)}
                                className={styles.licenseCheckbox}
                              />
                              <label htmlFor={`license-${license.Id}`} className={styles.licenseCheckboxLabel}>
                                <i className="fa-solid fa-check"></i>
                              </label>
                            </div>

                            {license?.AttachmentUrl && (
                              <div className={styles.licensePreview}>
                                <a
                                  href={license?.AttachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.previewLink}
                                  onClick={(e) => e.stopPropagation()}
                                  aria-label="معاينة الرخصة"
                                >
                                  {license?.AttachmentUrl?.toLowerCase().endsWith('.pdf') ? (
                                    <div className={styles.pdfPreview}>
                                      <img
                                        src="/assets/images/pdf.png"
                                        alt="License Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        loading="lazy"
                                      />
                                    </div>
                                  ) : (
                                    <img
                                      src={license?.AttachmentUrl}
                                      alt="License Preview"
                                      style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
                                      loading="lazy"
                                    />
                                  )}
                                </a>

                                {license?.AttachmentUrl?.toLowerCase().endsWith('.pdf') && (
                                  <div className={`${styles.fileType} ${styles.pdf}`}>PDF</div>
                                )}
                                {(license?.AttachmentUrl?.toLowerCase().endsWith('.jpg') ||
                                  license?.AttachmentUrl?.toLowerCase().endsWith('.jpeg')) && (
                                  <div className={`${styles.fileType} ${styles.jpg}`}>JPG</div>
                                )}
                                {license?.AttachmentUrl?.toLowerCase().endsWith('.png') && (
                                  <div className={`${styles.fileType} ${styles.png}`}>PNG</div>
                                )}

                                {isSelected && (
                                  <div className={styles.selectedIndicator}>
                                    <i className="fa-solid fa-check"></i>
                                  </div>
                                )}

                                {!isSelected && (
                                  <button
                                    type="button"
                                    className={styles.licenseSelectBtnCentered}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      selectLicense(license);
                                    }}
                                  >
                                    استخدام هذه الرخصة
                                  </button>
                                )}
                              </div>
                            )}

                            <div className={styles.licenseInfo}>
                              <div className={styles.licenseDetails}>
                                <span className={styles.licenseName}>{license?.LicenseNumber || 'رخصة بدون رقم'}</span>
                                <div className={styles.licenseMeta}>
                                  {license?.IssuedDate && <span>الإصدار: {formatDate(license.IssuedDate)}</span>}
                                  {license?.ExpiryDate && <span>الانتهاء: {formatDate(license.ExpiryDate)}</span>}
                                  {license?.IsActive !== undefined && (
                                    <span>الحالة: {license.IsActive ? 'نشطة' : 'متوقفة'}</span>
                                  )}
                                </div>
                              </div>
                              <div className={styles.licenseActions}>
                                <button
                                  type="button"
                                  className={`btn ${styles.licenseSelectBtn}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    selectLicense(license);
                                  }}
                                >
                                  {isSelected ? 'تم الاختيار' : 'استخدام الرخصة'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-12">
                      <div className="alert alert-danger text-center" role="alert">
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


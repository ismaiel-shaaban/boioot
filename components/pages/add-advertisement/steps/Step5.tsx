'use client';

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { AdvertisementMedia, AdvertisementFormState } from '@/lib/core/models/advertisement.models';
import { advertisementService } from '@/lib/services/advertisement';
import { projectsService } from '@/lib/services/projects';
import { useAdvertisementState } from '@/lib/contexts/AdvertisementContext';
import { showToast } from '@/lib/utils/toast';
import styles from '../AddAdvertisementClient.module.css';

interface Step5Props {
  isSubmitting: boolean;
  advertisementFormState: AdvertisementFormState;
  onStepCompleted: (data: { advertisementData: AdvertisementMedia }) => void;
  onValidationStatusChanged: (data: { isValid: boolean; errors: string[] }) => void;
}

export interface Step5Handle {
  saveStep: () => Promise<{ advertisementData: AdvertisementMedia }>;
  checkIfInputsAreValid: () => boolean;
}

const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/webm', 'video/mkv'];

const Step5 = forwardRef<Step5Handle, Step5Props>(
  ({ isSubmitting, advertisementFormState, onStepCompleted, onValidationStatusChanged }, ref) => {
    const [advertisementForm, setAdvertisementForm] = useState<AdvertisementMedia>({
      images: [],
      videos: [],
    });

    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [fieldInteractionStates, setFieldInteractionStates] = useState<{ [key: string]: boolean }>({});

    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [uploadedVideos, setUploadedVideos] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [videoUrls, setVideoUrls] = useState<string[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [existingVideoUrls, setExistingVideoUrls] = useState<string[]>([]);
    const [isSavingStep, setIsSavingStep] = useState(false);

    const { advertisementId } = useAdvertisementState();

    useEffect(() => {
      updateValidationStatus();
    }, []);

    useEffect(() => {
      if (advertisementFormState?.step5) {
        populateFormWithSavedData(advertisementFormState.step5);
      }
    }, [advertisementFormState?.step5]);

    const populateFormWithSavedData = (savedData: any) => {
      if (savedData) {
        setExistingImageUrls([]);
        setExistingVideoUrls([]);

        if (savedData.images && Array.isArray(savedData.images)) {
          const existing = savedData.images.filter((url: string) => url && url.startsWith('http'));
          setExistingImageUrls(existing);
          const existingBlobs = imageUrls.filter((url: string) => url.startsWith('blob:'));
          setImageUrls([...existing, ...existingBlobs]);
          setAdvertisementForm((prev) => ({ ...prev, images: savedData.images }));
        }

        if (savedData.videos && Array.isArray(savedData.videos)) {
          const existing = savedData.videos.filter((url: string) => url && url.startsWith('http'));
          setExistingVideoUrls(existing);
          const existingBlobs = videoUrls.filter((url: string) => url.startsWith('blob:'));
          setVideoUrls([...existing, ...existingBlobs]);
          setAdvertisementForm((prev) => ({ ...prev, videos: savedData.videos }));
        }

        updateValidationStatus();
      }
    };

    const onImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      files.forEach((file: File) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          showToast(`نوع الملف غير مسموح به`, 'error');
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          showToast(`حجم الملف يجب أن يكون أقل من 50 ميجابايت`, 'error');
          return;
        }

        if (uploadedImages.length >= MAX_IMAGES) {
          showToast(`يمكن رفع ${MAX_IMAGES} صور كحد أقصى`, 'error');
          return;
        }

        setUploadedImages((prev) => [...prev, file]);
        const url = URL.createObjectURL(file);
        setImageUrls((prev) => [...prev, url]);
        showToast('تم إضافة الصورة بنجاح', 'success');
      });

      event.target.value = '';
      updateValidationStatus();
    };

    const onVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        showToast('يجب أن يكون الملف من نوع فيديو (MP4, MOV, WEBM, MKV)', 'error');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        showToast(`حجم الملف يجب أن يكون أقل من 50 ميجابايت`, 'error');
        return;
      }

      if (uploadedVideos.length > 0) {
        showToast('يمكن رفع فيديو واحد فقط', 'error');
        return;
      }

      setUploadedVideos([file]);
      const url = URL.createObjectURL(file);
      setVideoUrls([url]);
      showToast('تم إضافة الفيديو بنجاح', 'success');
      updateValidationStatus();

      event.target.value = '';
    };

    const removeImage = (index: number) => {
      const urlToRemove = imageUrls[index];

      if (urlToRemove.startsWith('blob:')) {
        URL.revokeObjectURL(urlToRemove);
        const localIndex = imageUrls.slice(0, index + 1).filter((url) => url.startsWith('blob:')).length - 1;
        setUploadedImages((prev) => prev.filter((_, i) => i !== localIndex));
      } else {
        const existingIndex = existingImageUrls.indexOf(urlToRemove);
        if (existingIndex > -1) {
          setExistingImageUrls((prev) => prev.filter((_, i) => i !== existingIndex));
        }
      }

      setImageUrls((prev) => prev.filter((_, i) => i !== index));
      validateField('media');
      updateValidationStatus();
    };

    const removeVideo = (index: number) => {
      if (index >= 0 && index < videoUrls.length) {
        const urlToRemove = videoUrls[index];

        if (urlToRemove.startsWith('blob:')) {
          URL.revokeObjectURL(urlToRemove);
          const localIndex = videoUrls.slice(0, index + 1).filter((url) => url.startsWith('blob:')).length - 1;
          setUploadedVideos((prev) => prev.filter((_, i) => i !== localIndex));
        } else {
          const existingIndex = existingVideoUrls.indexOf(urlToRemove);
          if (existingIndex > -1) {
            setExistingVideoUrls((prev) => prev.filter((_, i) => i !== existingIndex));
          }
        }

        setVideoUrls((prev) => prev.filter((_, i) => i !== index));
        updateValidationStatus();
      }
    };

    const hasVideoUploaded = (): boolean => {
      return uploadedVideos.length > 0 || existingVideoUrls.length > 0 || videoUrls.length > 0;
    };

    const getVideoFileName = (): string => {
      if (uploadedVideos.length > 0) {
        return uploadedVideos[0].name;
      } else if (existingVideoUrls.length > 0) {
        const url = existingVideoUrls[0];
        return url.substring(url.lastIndexOf('/') + 1) || 'فيديو موجود';
      }
      return '';
    };

    const validateField = (fieldName: string) => {
      let error = '';

      switch (fieldName) {
        case 'media':
          const hasImages = uploadedImages.length > 0 || existingImageUrls.length > 0;
          if (!hasImages) {
            error = 'يجب رفع صورة واحدة على الأقل';
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
      const fieldsToValidate = ['media'];
      fieldsToValidate.forEach((field) => validateField(field));

      const isValid = Object.keys(fieldErrors).length === 0;
      const errors = Object.values(fieldErrors);
      onValidationStatusChanged({ isValid, errors });
    };

    const uploadFile = async (file: File): Promise<string> => {
      if (!advertisementId) {
        throw new Error('Ad ID not available');
      }

      const response = await projectsService.uploadMedia(advertisementId, file);
      if (response.IsSuccess && response.Data) {
        const data = response.Data as any;
        return data?.Id as string;
      } else {
        throw new Error(response.Error || 'Failed to upload file');
      }
    };

    const saveStep = async (): Promise<{ advertisementData: AdvertisementMedia }> => {
      setIsSavingStep(true);

      ['media'].forEach((field) => {
        validateField(field);
        setFieldInteractionStates((prev) => ({ ...prev, [field]: true }));
      });

      updateValidationStatus();

      const isValid = Object.keys(fieldErrors).every((key) => !fieldErrors[key]);

      if (!isValid) {
        setIsSavingStep(false);
        throw new Error('Validation failed');
      }

      if (!advertisementId) {
        setIsSavingStep(false);
        throw new Error('Ad ID not available');
      }

      try {
        const allMediaIds: string[] = [];

        // Upload new images
        for (const file of uploadedImages) {
          try {
            const mediaId = await uploadFile(file);
            allMediaIds.push(mediaId);
          } catch (error) {
            console.error('Error uploading image:', error);
          }
        }

        // Upload new videos
        for (const file of uploadedVideos) {
          try {
            const mediaId = await uploadFile(file);
            allMediaIds.push(mediaId);
          } catch (error) {
            console.error('Error uploading video:', error);
          }
        }

        const finalImages = [...existingImageUrls, ...imageUrls.filter((url) => url.startsWith('blob:')).map(() => '')];
        const finalVideos = [...existingVideoUrls, ...videoUrls.filter((url) => url.startsWith('blob:')).map(() => '')];

        const finalForm: AdvertisementMedia = {
          images: finalImages.filter((img) => img),
          videos: finalVideos.filter((vid) => vid),
        };

        onStepCompleted({ advertisementData: finalForm });
        showToast('تم حفظ الوسائط بنجاح', 'success');
        setIsSavingStep(false);
        return { advertisementData: finalForm };
      } catch (error: any) {
        console.error('Media upload error:', error);
        showToast(error.message || 'فشل في حفظ الوسائط', 'error');
        setIsSavingStep(false);
        throw error;
      }
    };

    const checkIfInputsAreValid = (): boolean => {
      const fieldsToValidate = ['media'];
      fieldsToValidate.forEach((field) => validateField(field));
      return Object.keys(fieldErrors).length === 0;
    };

    useImperativeHandle(ref, () => ({
      saveStep,
      checkIfInputsAreValid,
    }));

    return (
      <div className={styles.stepContent}>
        {isSavingStep && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(255,255,255,0.9)', zIndex: 9999 }}>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">جاري الحفظ...</span>
              </div>
              <p className="mt-2">جاري حفظ وسائط الإعلان...</p>
            </div>
          </div>
        )}

        <h4 className="mb-3">صور وفيديوهات الإعلان</h4>

        <div className="mb-4">
          <div className="mb-2">
            <h6><i className="fa-solid fa-image"></i> أنواع الصور المسموحة:</h6>
            <span className="text-muted">JPG, JPEG, PNG, GIF, BMP, WebP, TIFF, SVG</span>
          </div>
          <div className="mb-2">
            <h6><i className="fa-solid fa-info-circle"></i> الحد الأقصى:</h6>
            <span className="text-muted">{MAX_IMAGES} صور، حجم الملف: 50 ميجابايت</span>
          </div>
        </div>

        <div className="mb-3">
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="d-none"
            id="single-media-upload"
            disabled={isSavingStep || uploadedImages.length >= MAX_IMAGES}
            multiple
          />
          <label htmlFor="single-media-upload" className="btn btn-primary">
            <i className="fa-solid fa-download me-2"></i>
            اختر لرفع الصور
          </label>
        </div>

        {imageUrls.length > 0 && (
          <div className="row mb-4">
            {imageUrls.map((imageUrl, i) => (
              <div key={i} className="col-md-3 mb-3">
                <div className="position-relative">
                  <img src={imageUrl} alt="Uploaded Media" className="img-fluid rounded" style={{ height: '200px', width: '100%', objectFit: 'cover' }} />
                  {!imageUrl.startsWith('blob:') && (
                    <span className="badge bg-primary position-absolute top-0 start-0 m-2">موجود</span>
                  )}
                  {imageUrl.startsWith('blob:') && (
                    <span className="badge bg-success position-absolute top-0 start-0 m-2">جديد</span>
                  )}
                  <button
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                    onClick={() => removeImage(i)}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <hr className="my-4" />

        <div className="mb-4">
          <div className="mb-2">
            <h6><i className="fa-solid fa-video"></i> أنواع الفيديو المسموحة:</h6>
            <span className="text-muted">MP4, MOV, WEBM, MKV</span>
          </div>
          <div className="mb-2">
            <h6><i className="fa-solid fa-info-circle"></i> الحد الأقصى:</h6>
            <span className="text-muted">فيديو واحد، حجم الملف: 50 ميجابايت</span>
          </div>
        </div>

        {!hasVideoUploaded() ? (
          <div className="mb-3">
            <input
              type="file"
              accept="video/*"
              onChange={onVideoUpload}
              className="d-none"
              id="video-upload"
              disabled={isSavingStep}
            />
            <label htmlFor="video-upload" className="btn btn-primary">
              <i className="fa-solid fa-download me-2"></i>
              اختر لرفع فيديو
            </label>
          </div>
        ) : (
          <div className="mb-3">
            <div className="border rounded p-3 d-flex justify-content-between align-items-center">
              <div>
                <i className="fa-solid fa-video me-2"></i>
                <span>{getVideoFileName()}</span>
                <span className="badge bg-success ms-2">تم إضافة الفيديو</span>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => removeVideo(0)}>
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        )}

        {fieldErrors['media'] && (
          <div className="alert alert-warning mt-3">
            <i className="fa-solid fa-exclamation-triangle me-2"></i>
            {fieldErrors['media']}
          </div>
        )}
      </div>
    );
  }
);

Step5.displayName = 'Step5';

export default Step5;


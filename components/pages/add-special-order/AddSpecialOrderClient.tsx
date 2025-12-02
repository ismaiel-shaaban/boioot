'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Stepper, { Step } from '@/components/shared/stepper/Stepper';
import { useSpecialOrderState } from '@/lib/contexts/SpecialOrderContext';
import { specialOrderService } from '@/lib/services/special-order';
import { showToast } from '@/lib/utils/toast';
import { AdvertisementFormState } from '@/lib/core/models/advertisement.models';
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import Step5 from './steps/Step5';
import Step6 from './steps/Step6';
import Step7 from './steps/Step7';
import Step8 from './steps/Step8';
import styles from '../add-advertisement/AddAdvertisementClient.module.css'; // Reuse styles

interface AddSpecialOrderClientProps {
  specialOrderId?: string;
}

export default function AddSpecialOrderClient({ specialOrderId: propId }: AddSpecialOrderClientProps) {
  const router = useRouter();
  const params = useParams();
  const { specialOrderId: stateId, setSpecialOrderId, clearSpecialOrderId } = useSpecialOrderState();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [specialOrderId, setOrderId] = useState<string | null>(null);

  const step1Ref = useRef<any>(null);
  const step2Ref = useRef<any>(null);
  const step3Ref = useRef<any>(null);
  const step4Ref = useRef<any>(null);
  const step5Ref = useRef<any>(null);
  const step6Ref = useRef<any>(null);
  const step7Ref = useRef<any>(null);
  const step8Ref = useRef<any>(null);

  const [steps, setSteps] = useState<Step[]>([
    { id: 1, title: 'بيانات الاعلان', completed: false, active: true },
    { id: 2, title: 'بيانات المالك', completed: false, active: false },
    { id: 3, title: 'القسم', completed: false, active: false },
    { id: 4, title: 'معلومات العقار', completed: false, active: false },
    { id: 5, title: 'الصور و فيديوهات', completed: false, active: false },
    { id: 6, title: 'الموقع', completed: false, active: false },
    { id: 7, title: 'التفاصيل', completed: false, active: false },
    { id: 8, title: 'المزايا', completed: false, active: false },
  ]);

  const [advertisementFormState, setAdvertisementFormState] = useState<AdvertisementFormState>({
    step1: {
      propertyLicense: null,
      licenseId: '',
      adTitle: '',
      adDescription: '',
    },
    step2: {
      ownerType: 'فرد',
      idNumber: '',
      birthDate: '',
      contactNumber: '',
    },
    step3: {
      propertyType: 0,
    },
    step4: {
      area: 0,
      rent: 0,
      hasCommission: false,
      commissionAmount: 0,
      rentalDuration: 0,
      paymentType: 0,
    },
    step5: {
      images: [],
      videos: [],
    },
    step6: {
      id: '',
      city: '',
      district: '',
      latitude: 0,
      longitude: 0,
      step: 6,
    },
    step7: {
      numberOfRooms: 2,
      category: 0,
      numberOfHalls: 3,
      numberOfBathrooms: 2,
      propertyAge: '',
      floor: '',
    },
    step8: {
      features: [],
    },
  });

  const [stepValidationStatus, setStepValidationStatus] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    initializeComponent();
  }, []);

  const initializeComponent = async () => {
    let orderId: string | null = null;

    // Priority: propId > params.id > stateId > localStorage
    if (propId) {
      orderId = propId;
    } else if (params?.id) {
      orderId = params.id as string;
    } else if (stateId) {
      orderId = stateId;
    } else if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('currentSpecialOrderId');
      if (storedId) {
        orderId = storedId;
      }
    }

    if (orderId) {
      setOrderId(orderId);
      setIsEditMode(true);
      setSpecialOrderId(orderId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentSpecialOrderId', orderId);
      }

      // Update URL if needed
      if (!propId && !params?.id && typeof window !== 'undefined') {
        router.replace(`/add-special-order/${orderId}`);
      }

      // Load existing special order data
      await loadSpecialOrderData(orderId);
    } else {
      initializeStepValidation();
      updateStepsStatus();
    }
  };

  const initializeStepValidation = () => {
    const status: { [key: number]: boolean } = {};
    steps.forEach((step) => {
      status[step.id] = false;
    });
    setStepValidationStatus(status);
  };

  const getNumericValue = (value: any): number | null => {
    if (value === null || value === undefined || value === 0 || value === '') {
      return null;
    }
    const numValue = Number(value);
    return isNaN(numValue) || numValue === 0 ? null : numValue;
  };

  const loadSpecialOrderData = async (orderId: string) => {
    setIsSubmitting(true);
    try {
      const response = await specialOrderService.getAdvertisementById(orderId);
      if (response?.IsSuccess && response?.Data) {
        const adData = response.Data;
        populateFormState(adData);
        markCompletedSteps(adData);
        initializeStepValidation();
        updateStepsStatus();
        navigateToFirstIncompleteStep();
        showToast('تم تحميل بيانات الطلب الخاص بنجاح', 'success');
      } else {
        showToast('فشل في تحميل بيانات الطلب الخاص أو الطلب غير موجود', 'error');
        clearSpecialOrderId();
        router.push('/add-special-order');
      }
    } catch (error: any) {
      console.error('Error loading special order:', error);
      showToast('فشل في تحميل بيانات الطلب الخاص', 'error');
      clearSpecialOrderId();
      router.push('/add-special-order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const populateFormState = (adData: any) => {
    setAdvertisementFormState({
      step1: {
        propertyLicense: null,
        licenseId: adData.TitleDeedNumber || adData.CompanyLicenseNumber || '',
        adTitle: adData.Title || '',
        adDescription: adData.Description || '',
        adId: adData.Id || specialOrderId || undefined,
      },
      step2: {
        ownerType: adData.OwnerType?.toString() || '',
        idNumber: adData.TitleDeedNumber || '',
        birthDate: adData.CompanyEstablishedAt
          ? new Date(adData.CompanyEstablishedAt).toISOString().split('T')[0]
          : '',
        contactNumber: adData.UserPhoneNumber || '',
      },
      step3: {
        propertyType: adData.UnitType || 0,
      },
      step4: {
        area: adData.Area || 0,
        rent: adData.RentPrice || 0,
        hasCommission: adData.HasCommission || false,
        commissionAmount: adData.CommissionAmount || 0,
        rentalDuration: adData.ContractDuration || 0,
        paymentType: adData.PaymentFrequency || 0,
        isUsd: adData.IsUsd || false,
      },
      step5: {
        images: (() => {
          const images: string[] = [];
          if (adData.MediaUrls && adData.MediaUrls.length > 0) {
            adData.MediaUrls.forEach((url: string) => {
              const cleanUrl = url.trim();
              if (
                !cleanUrl.includes('.mp4') &&
                !cleanUrl.includes('.avi') &&
                !cleanUrl.includes('.mov') &&
                !cleanUrl.includes('.mkv') &&
                !cleanUrl.includes('.webm')
              ) {
                images.push(cleanUrl);
              }
            });
          }
          if (adData.CoverImageUrl && !images.includes(adData.CoverImageUrl.trim())) {
            images.unshift(adData.CoverImageUrl.trim());
          }
          return images;
        })(),
        videos: (() => {
          const videos: string[] = [];
          if (adData.MediaUrls && adData.MediaUrls.length > 0) {
            adData.MediaUrls.forEach((url: string) => {
              const cleanUrl = url.trim();
              if (
                cleanUrl.includes('.mp4') ||
                cleanUrl.includes('.avi') ||
                cleanUrl.includes('.mov') ||
                cleanUrl.includes('.mkv') ||
                cleanUrl.includes('.webm')
              ) {
                videos.push(cleanUrl);
              }
            });
          }
          return videos;
        })(),
      },
      step6: {
        id: adData.Id || specialOrderId || '',
        city: adData.City || '',
        district: adData.District || '',
        latitude: adData.Latitude || 0,
        longitude: adData.Longitude || 0,
        step: 6,
      },
      step7: {
        numberOfRooms: adData.Rooms || 2,
        category: adData.Audience || 0,
        numberOfHalls: adData.Halls || 3,
        numberOfBathrooms: adData.Bathrooms || 2,
        propertyAge: adData.PropertyAge?.toString() || '',
        floor: adData.Floor?.toString() || '',
      },
      step8: {
        features: adData.FeatureNames || [],
      },
    });
  };

  const markCompletedSteps = (adData: any) => {
    const status: { [key: number]: boolean } = {};
    if (adData.Title && adData.Description) {
      status[1] = true;
      setSteps((prev) => prev.map((s) => (s.id === 1 ? { ...s, completed: true } : s)));
    }
    if (adData.OwnerType !== undefined && adData.OwnerType !== null) {
      status[2] = true;
      setSteps((prev) => prev.map((s) => (s.id === 2 ? { ...s, completed: true } : s)));
    }
    if (adData.UnitType !== undefined && adData.UnitType !== null) {
      status[3] = true;
      setSteps((prev) => prev.map((s) => (s.id === 3 ? { ...s, completed: true } : s)));
    }
    if (adData.RentPrice || adData.Area) {
      status[4] = true;
      setSteps((prev) => prev.map((s) => (s.id === 4 ? { ...s, completed: true } : s)));
    }
    if (adData.MediaUrls && adData.MediaUrls.length > 0) {
      const hasImages = adData.MediaUrls.some(
        (url: string) =>
          !url.includes('.mp4') &&
          !url.includes('.avi') &&
          !url.includes('.mov') &&
          !url.includes('.mkv') &&
          !url.includes('.webm')
      );
      if (hasImages) {
        status[5] = true;
        setSteps((prev) => prev.map((s) => (s.id === 5 ? { ...s, completed: true } : s)));
      }
    }
    if (adData.City && adData.District) {
      status[6] = true;
      setSteps((prev) => prev.map((s) => (s.id === 6 ? { ...s, completed: true } : s)));
    }
    if (adData.Rooms !== undefined && adData.Halls !== undefined) {
      status[7] = true;
      setSteps((prev) => prev.map((s) => (s.id === 7 ? { ...s, completed: true } : s)));
    }
    if (adData.Features && adData.Features.length > 0) {
      status[8] = true;
      setSteps((prev) => prev.map((s) => (s.id === 8 ? { ...s, completed: true } : s)));
    }
    setStepValidationStatus((prev) => ({ ...prev, ...status }));
  };

  const navigateToFirstIncompleteStep = () => {
    if (!isEditMode) return;
    for (let i = 1; i <= steps.length; i++) {
      if (!stepValidationStatus[i]) {
        setCurrentStep(i);
        updateStepsStatus();
        return;
      }
    }
    setCurrentStep(1);
    updateStepsStatus();
  };

  const onStepChange = (stepId: number) => {
    if (canNavigateToStep(stepId)) {
      setCurrentStep(stepId);
      updateStepsStatus();
      if (isEditMode) {
        showToast(`تم الانتقال إلى الخطوة ${stepId}`, 'success');
      }
    } else {
      const message = isEditMode
        ? 'لا يمكن الانتقال إلى هذه الخطوة - يرجى إكمال الخطوات السابقة أولاً'
        : 'لا يمكن الانتقال إلى هذه الخطوة';
      showToast(message, 'warning');
    }
  };

  const canNavigateToStep = (stepNumber: number): boolean => {
    if (isEditMode) {
      if (stepValidationStatus[stepNumber] === true) {
        return true;
      }
      if (stepNumber === currentStep) {
        return true;
      }
      if (stepNumber === currentStep + 1 && stepValidationStatus[currentStep] === true) {
        return true;
      }
      return false;
    }

    if (stepNumber === currentStep) {
      return true;
    }
    if (stepNumber < currentStep) {
      return stepValidationStatus[stepNumber] === true;
    }
    if (stepNumber === currentStep + 1) {
      return stepValidationStatus[currentStep] === true;
    }
    if (stepNumber > currentStep + 1) {
      for (let i = currentStep; i <= stepNumber; i++) {
        if (stepValidationStatus[i] !== true) {
          return false;
        }
      }
      return true;
    }
    return false;
  };

  const onStepCompleted = (stepData: any, stepNumber: number) => {
    const stepKey = `step${stepNumber}` as keyof AdvertisementFormState;
    setAdvertisementFormState((prev) => ({
      ...prev,
      [stepKey]: stepData.advertisementData,
    }));

    setSteps((prev) => prev.map((s) => (s.id === stepNumber ? { ...s, completed: true } : s)));
    setStepValidationStatus((prev) => ({ ...prev, [stepNumber]: true }));
    goToNextStep();
  };

  const onValidationStatusChanged = (validationData: { isValid: boolean; errors: string[] }, stepNumber: number) => {
    setStepValidationStatus((prev) => ({ ...prev, [stepNumber]: validationData.isValid }));
    setSteps((prev) =>
      prev.map((s) => (s.id === stepNumber ? { ...s, completed: validationData.isValid } : s))
    );
  };

  const updateStepsStatus = () => {
    setSteps((prev) =>
      prev.map((step) => ({
        ...step,
        active: step.id === currentStep,
        completed: step.id < currentStep || stepValidationStatus[step.id] === true,
      }))
    );
  };

  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
      updateStepsStatus();
      showToast('تم الانتقال إلى الخطوة التالية', 'success');
    } else {
      showToast('تم إكمال جميع الخطوات بنجاح', 'success');
    }
  };

  const canProceedToNextStep = (): boolean => {
    let isValid = false;
    const currentStepComponent = getCurrentStepComponent();
    if (currentStepComponent && typeof currentStepComponent.checkIfInputsAreValid === 'function') {
      isValid = currentStepComponent.checkIfInputsAreValid();
    }
    return isValid && !isSubmitting;
  };

  const getCurrentStepComponent = (): any => {
    switch (currentStep) {
      case 1:
        return step1Ref.current;
      case 2:
        return step2Ref.current;
      case 3:
        return step3Ref.current;
      case 4:
        return step4Ref.current;
      case 5:
        return step5Ref.current;
      case 6:
        return step6Ref.current;
      case 7:
        return step7Ref.current;
      case 8:
        return step8Ref.current;
      default:
        return null;
    }
  };

  const saveAndContinue = async () => {
    if (!canProceedToNextStep()) {
      showToast('يرجى إكمال جميع الحقول المطلوبة في هذه الخطوة', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const currentStepComponent = getCurrentStepComponent();
      if (currentStepComponent && typeof currentStepComponent.saveStep === 'function') {
        await currentStepComponent.saveStep();
      }
    } catch (error) {
      console.error('Error saving step:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToLastStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      updateStepsStatus();
    }
  };

  const goToHome = async () => {
    if (!canProceedToNextStep()) {
      showToast('يرجى إكمال جميع الحقول المطلوبة في هذه الخطوة', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const currentStepComponent = getCurrentStepComponent();
      if (currentStepComponent && typeof currentStepComponent.saveStep === 'function') {
        await currentStepComponent.saveStep();
        router.push('/');
        showToast('تم الانتقال إلى الصفحة الرئيسية', 'success');
      }
    } catch (error) {
      console.error('Error saving step:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToCreateMode = () => {
    clearSpecialOrderId();
    setOrderId(null);
    setIsEditMode(false);
    setCurrentStep(1);
    setStepValidationStatus({});
    setAdvertisementFormState({
      step1: {
        propertyLicense: null,
        licenseId: '',
        adTitle: '',
        adDescription: '',
      },
      step2: {
        ownerType: 'فرد',
        idNumber: '',
        birthDate: '',
        contactNumber: '',
      },
      step3: {
        propertyType: 0,
      },
      step4: {
        area: 0,
        rent: 0,
        hasCommission: false,
        commissionAmount: 0,
        rentalDuration: 0,
        paymentType: 0,
      },
      step5: {
        images: [],
        videos: [],
      },
      step6: {
        id: '',
        city: '',
        district: '',
        latitude: 0,
        longitude: 0,
        step: 6,
      },
      step7: {
        numberOfRooms: 2,
        category: 0,
        numberOfHalls: 3,
        numberOfBathrooms: 2,
        propertyAge: '',
        floor: '',
      },
      step8: {
        features: [],
      },
    });
    router.push('/add-special-order');
    showToast('تم الانتقال إلى وضع إنشاء طلب خاص جديد', 'success');
  };

  useEffect(() => {
    updateStepsStatus();
  }, [currentStep, stepValidationStatus]);

  return (
    <div className={styles.marketingRequestPage}>
      <div className="container">
        <div className={`row ${styles.contentContainer}`}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{isEditMode ? 'تعديل طلب التسويق' : 'إضافة طلب تسويق'}</h1>
            {isEditMode && (
              <div className={styles.editModeIndicator}>
                <span className="badge bg-warning">وضع التعديل</span>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm ms-2"
                  onClick={switchToCreateMode}
                  title="إنشاء طلب تسويق جديد"
                >
                  <i className="fas fa-plus"></i> طلب تسويق جديد
                </button>
              </div>
            )}
          </div>

          {/* Stepper Sidebar */}
          <div className="col-lg-3 order-lg-1 order-1 mb-4">
            <Stepper steps={steps} onStepChange={onStepChange} />
          </div>

          {/* Main Content Area */}
          <div className="col-lg-9 order-lg-2 order-2">
            <div className={styles.contentArea}>
              {/* Loading Overlay for Edit Mode */}
              {isSubmitting && isEditMode && (
                <div className={styles.loadingOverlay}>
                  <div className={styles.loadingSpinner}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">جاري التحميل...</span>
                    </div>
                    <p className="mt-2">جاري تحميل بيانات طلب التسويق...</p>
                  </div>
                </div>
              )}

              {/* Step Components */}
              {currentStep === 1 && (
                <Step1
                  ref={step1Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data) => onStepCompleted(data, 1)}
                  onValidationStatusChanged={(data) => onValidationStatusChanged(data, 1)}
                />
              )}

              {currentStep === 2 && (
                <Step2
                  ref={step2Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data) => onStepCompleted(data, 2)}
                  onValidationStatusChanged={(data) => onValidationStatusChanged(data, 2)}
                />
              )}

              {currentStep === 3 && (
                <Step3
                  ref={step3Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data) => onStepCompleted(data, 3)}
                  onValidationStatusChanged={(data) => onValidationStatusChanged(data, 3)}
                />
              )}

              {currentStep === 4 && (
                <Step4
                  ref={step4Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data) => onStepCompleted(data, 4)}
                  onValidationStatusChanged={(data) => onValidationStatusChanged(data, 4)}
                />
              )}

              {currentStep === 5 && (
                <Step5
                  ref={step5Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data) => onStepCompleted(data, 5)}
                  onValidationStatusChanged={(data) => onValidationStatusChanged(data, 5)}
                />
              )}

              {currentStep === 6 && (
                <Step6
                  ref={step6Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data) => onStepCompleted(data, 6)}
                  onValidationStatusChanged={(data) => onValidationStatusChanged(data, 6)}
                />
              )}

              {currentStep === 7 && (
                <Step7
                  ref={step7Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data) => onStepCompleted(data, 7)}
                  onValidationStatusChanged={(data) => onValidationStatusChanged(data, 7)}
                />
              )}

              {currentStep === 8 && (
                <Step8
                  ref={step8Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data) => onStepCompleted(data, 8)}
                  onValidationStatusChanged={(data) => onValidationStatusChanged(data, 8)}
                />
              )}

              {/* Navigation Buttons */}
              <div className={`${styles.stepNavigation} d-flex flex-column flex-lg-row align-items-stretch w-100`}>
                {currentStep !== 1 && (
                  <button
                    type="button"
                    className="btn btn-success ml-2 mr-2"
                    style={{ minWidth: '180px' }}
                    onClick={goToLastStep}
                    disabled={isSubmitting}
                  >
                    رجوع
                  </button>
                )}

                <button
                  type="button"
                  className={`btn btn-success ${styles.saveBtn}`}
                  onClick={saveAndContinue}
                  disabled={!canProceedToNextStep() || isSubmitting}
                >
                  <span>
                    {isSubmitting
                      ? 'جاري الحفظ...'
                      : currentStep === steps.length
                        ? 'حفظ و اضافه طلب جديد'
                        : 'حفظ ومتابعة'}
                  </span>
                </button>

                <button
                  type="button"
                  className={`btn btn-success ${styles.saveBtn} mr-3 ml-3`}
                  onClick={goToHome}
                  disabled={!canProceedToNextStep() || isSubmitting}
                >
                  <span>{isSubmitting ? 'جاري الحفظ...' : 'العوده الى الرئيسيه'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


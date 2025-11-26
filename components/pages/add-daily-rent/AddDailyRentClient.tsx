'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Stepper, { Step } from '@/components/shared/stepper/Stepper';
import { useDailyRentState } from '@/lib/contexts/DailyRentContext';
import { dailyRentService } from '@/lib/services/daily-rent';
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
import Step9 from './steps/Step9';
import styles from './AddDailyRentClient.module.css';

interface AddDailyRentClientProps {
  dailyRentId?: string;
}

export default function AddDailyRentClient({ dailyRentId: propId }: AddDailyRentClientProps) {
  const router = useRouter();
  const params = useParams();
  const { dailyRentId: stateId, setDailyRentId, clearDailyRentId } = useDailyRentState();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dailyRentId, setDailyRentIdState] = useState<string | null>(null);

  const step1Ref = useRef<any>(null);
  const step2Ref = useRef<any>(null);
  const step3Ref = useRef<any>(null);
  const step4Ref = useRef<any>(null);
  const step5Ref = useRef<any>(null);
  const step6Ref = useRef<any>(null);
  const step7Ref = useRef<any>(null);
  const step8Ref = useRef<any>(null);
  const step9Ref = useRef<any>(null);

const LOCAL_STORAGE_KEY = 'dailyRentProgress';

const getDefaultFormState = (): AdvertisementFormState => ({
  step1: {
    propertyLicense: null,
    licenseId: '',
    adTitle: '',
    adDescription: '',
  },
  step2: {
    ownerType: '0',
    idNumber: '',
    birthDate: '',
    contactNumber: '',
  },
  step3: {
    propertyType: 0,
  },
  step4: {
    area: null,
    rent: null,
    hasCommission: false,
    commissionAmount: null,
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
    latitude: null,
    longitude: null,
    step: 6,
  },
  step7: {
    numberOfRooms: null,
    category: 0,
    numberOfHalls: null,
    numberOfBathrooms: null,
    propertyAge: '',
    floor: null,
  },
  step8: {
    features: [],
  },
  step9: {
    arriveTime: '',
    leaveTime: '',
    minDuration: null,
    cancelReservation: false,
    unitDescription: '',
    availableFrom: '',
    availableTo: '',
  },
});

const [steps, setSteps] = useState<Step[]>([
    { id: 1, title: 'بيانات الاعلان', completed: false, active: true },
    { id: 2, title: 'بيانات المالك', completed: false, active: false },
    { id: 3, title: 'القسم', completed: false, active: false },
    { id: 4, title: 'معلومات العقار', completed: false, active: false },
    { id: 5, title: 'الصور و فيديوهات', completed: false, active: false },
    { id: 6, title: 'الموقع', completed: false, active: false },
    { id: 7, title: 'التفاصيل', completed: false, active: false },
    { id: 8, title: 'المزايا', completed: false, active: false },
    { id: 9, title: 'قوانين وشروط', completed: false, active: false },
  ]);

const [advertisementFormState, setAdvertisementFormState] = useState<AdvertisementFormState>(getDefaultFormState());

  const [stepValidationStatus, setStepValidationStatus] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    initializeComponent();
  }, []);

  const saveProgressToLocalStorage = useCallback(
    (data?: {
      formState?: AdvertisementFormState;
      current?: number;
      stepStatus?: { [key: number]: boolean };
      editMode?: boolean;
      id?: string | null;
    }) => {
      if (typeof window === 'undefined') return;
      const payload = {
        advertisementFormState: data?.formState || advertisementFormState,
        currentStep: data?.current || currentStep,
        stepValidationStatus: data?.stepStatus || stepValidationStatus,
        isEditMode: data?.editMode ?? isEditMode,
        dailyRentId: data?.id ?? dailyRentId,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    },
    [advertisementFormState, currentStep, stepValidationStatus, isEditMode, dailyRentId]
  );

  const loadProgressFromLocalStorage = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }, []);

  const clearProgressFromLocalStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const initializeComponent = async () => {
    let rentId: string | null = null;

    if (propId) {
      rentId = propId;
    } else if (params?.id) {
      rentId = params.id as string;
    } else if (stateId) {
      rentId = stateId;
    } else if (typeof window !== 'undefined') {
      const storedRentId = localStorage.getItem('currentDailyRentId');
      if (storedRentId) {
        rentId = storedRentId;
      }
    }

    const savedProgress = loadProgressFromLocalStorage();

    if (!rentId && savedProgress) {
      const savedState = savedProgress.advertisementFormState as AdvertisementFormState | undefined;
      if (savedState) {
        setAdvertisementFormState(savedState);
      }
      if (savedProgress.stepValidationStatus) {
        setStepValidationStatus(savedProgress.stepValidationStatus);
      } else {
        initializeStepValidation();
      }
      setCurrentStep(savedProgress.currentStep || 1);
      setIsEditMode(!!savedProgress.isEditMode);
      if (savedProgress.dailyRentId) {
        setDailyRentIdState(savedProgress.dailyRentId);
        setDailyRentId(savedProgress.dailyRentId);
      }
      updateStepsStatus();
      return;
    }

    if (rentId) {
      setDailyRentIdState(rentId);
      setIsEditMode(true);
      setDailyRentId(rentId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentDailyRentId', rentId);
      }

      if (!propId && !params?.id && typeof window !== 'undefined') {
        router.replace(`/add-daily-rent/${rentId}`);
      }

      await loadDailyRentData(rentId);
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

  const loadDailyRentData = async (rentId: string) => {
    setIsSubmitting(true);
    try {
      const response = await dailyRentService.getAdvertisementById(rentId);
      if (response?.IsSuccess && response?.Data) {
        const adData = response.Data;
        populateFormState(adData);
        markCompletedSteps(adData);
        initializeStepValidation();
        updateStepsStatus();
        navigateToFirstIncompleteStep();
        showToast('تم تحميل بيانات الإعلان بنجاح', 'success');
      } else {
        showToast('فشل في تحميل بيانات الإعلان أو الإعلان غير موجود', 'error');
        clearDailyRentId();
        router.push('/add-daily-rent');
      }
    } catch (error: any) {
      console.error('Error loading daily rent:', error);
      showToast('فشل في تحميل بيانات الإعلان', 'error');
      clearDailyRentId();
      router.push('/add-daily-rent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const populateFormState = (adData: any) => {
    setAdvertisementFormState({
      step1: {
        propertyLicense: null,
        licenseId: adData.LicenceId || '',
        adTitle: adData.Title || '',
        adDescription: adData.Description || '',
        adId: adData.Id || dailyRentId || undefined,
      },
      step2: {
        ownerType: adData.OwnerType?.toString() || '0',
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
        area: getNumericValue(adData.Area),
        rent: getNumericValue(adData.RentPrice),
        hasCommission: adData.HasCommission || false,
        commissionAmount: getNumericValue(adData.CommissionAmount),
        rentalDuration: 0,
        paymentType: 0,
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
        id: adData.Id || dailyRentId || '',
        city: adData.City || '',
        district: adData.District || '',
        latitude: getNumericValue(adData.Latitude),
        longitude: getNumericValue(adData.Longitude),
        step: 6,
      },
      step7: {
        numberOfRooms: getNumericValue(adData.Rooms),
        category: adData.Audience || 0,
        numberOfHalls: getNumericValue(adData.Halls),
        numberOfBathrooms: getNumericValue(adData.Bathrooms),
        propertyAge: adData.PropertyAge?.toString() || '0',
        floor: adData.Floor?.toString() || null,
      },
      step8: {
        features: adData.FeatureNames || [],
      },
      step9: {
        arriveTime: adData.CheckInTime || '',
        leaveTime: adData.CheckOutTime || '',
        minDuration: adData.MinimumStayDays || null,
        cancelReservation: adData.IsCancellationAllowed || false,
        unitDescription: adData.Policies || '',
        availableFrom: adData.AvailableFrom
          ? new Date(adData.AvailableFrom).toISOString().split('T')[0]
          : '',
        availableTo: adData.AvailableTo
          ? new Date(adData.AvailableTo).toISOString().split('T')[0]
          : '',
      },
    });
  };

  const markCompletedSteps = (adData: any) => {
    const status: { [key: number]: boolean } = {};
    if (adData.Title || adData.Description) {
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
    if (adData.City || adData.District) {
      status[6] = true;
      setSteps((prev) => prev.map((s) => (s.id === 6 ? { ...s, completed: true } : s)));
    }
    if (adData.Rooms || adData.Halls || adData.Bathrooms) {
      status[7] = true;
      setSteps((prev) => prev.map((s) => (s.id === 7 ? { ...s, completed: true } : s)));
    }
    if (adData.Features && adData.Features.length > 0) {
      status[8] = true;
      setSteps((prev) => prev.map((s) => (s.id === 8 ? { ...s, completed: true } : s)));
    }
    if (adData.CheckInTime || adData.CheckOutTime || adData.MinimumStayDays) {
      status[9] = true;
      setSteps((prev) => prev.map((s) => (s.id === 9 ? { ...s, completed: true } : s)));
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
    saveProgressToLocalStorage({
      formState: {
        ...advertisementFormState,
        [stepKey]: stepData.advertisementData,
      },
      current: currentStep + 1,
      stepStatus: { ...stepValidationStatus, [stepNumber]: true },
    });
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
      case 9:
        return step9Ref.current;
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
        if (currentStep === steps.length) {
          clearProgressFromLocalStorage();
        }
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
        router.push('/home');
        showToast('تم الانتقال إلى الصفحة الرئيسية', 'success');
        clearProgressFromLocalStorage();
      }
    } catch (error) {
      console.error('Error saving step:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToCreateMode = () => {
    clearDailyRentId();
    setDailyRentIdState(null);
    setIsEditMode(false);
    setCurrentStep(1);
    setStepValidationStatus({});
    setAdvertisementFormState(getDefaultFormState());
    clearProgressFromLocalStorage();
    router.push('/add-daily-rent');
    showToast('تم الانتقال إلى وضع إنشاء إعلان جديد', 'success');
  };

  useEffect(() => {
    updateStepsStatus();
    saveProgressToLocalStorage();
  }, [currentStep, stepValidationStatus, advertisementFormState, saveProgressToLocalStorage]);

  return (
    <div className={styles.marketingRequestPage}>
      <div className="container">
        <div className={`row ${styles.contentContainer}`}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{isEditMode ? 'تعديل الإعلان اليومي' : 'إضافة إعلان يومي'}</h1>
            {isEditMode && (
              <div className={styles.editModeIndicator}>
                <span className="badge bg-warning">وضع التعديل</span>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm ms-2"
                  onClick={switchToCreateMode}
                  title="إنشاء إعلان جديد"
                >
                  <i className="fas fa-plus"></i> إعلان جديد
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
                    <p className="mt-2">جاري تحميل بيانات الإعلان...</p>
                  </div>
                </div>
              )}

              {/* Step Components */}
              {currentStep === 1 && (
                <Step1
                  ref={step1Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data: any) => onStepCompleted(data, 1)}
                  onValidationStatusChanged={(status: any) => onValidationStatusChanged(status, 1)}
                />
              )}

              {currentStep === 2 && (
                <Step2
                  ref={step2Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data: any) => onStepCompleted(data, 2)}
                  onValidationStatusChanged={(status: any) => onValidationStatusChanged(status, 2)}
                />
              )}

              {currentStep === 3 && (
                <Step3
                  ref={step3Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data: any) => onStepCompleted(data, 3)}
                  onValidationStatusChanged={(status: any) => onValidationStatusChanged(status, 3)}
                />
              )}

              {currentStep === 4 && (
                <Step4
                  ref={step4Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data: any) => onStepCompleted(data, 4)}
                  onValidationStatusChanged={(status: any) => onValidationStatusChanged(status, 4)}
                />
              )}

              {currentStep === 5 && (
                <Step5
                  ref={step5Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data: any) => onStepCompleted(data, 5)}
                  onValidationStatusChanged={(status: any) => onValidationStatusChanged(status, 5)}
                />
              )}

              {currentStep === 6 && (
                <Step6
                  ref={step6Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data: any) => onStepCompleted(data, 6)}
                  onValidationStatusChanged={(status: any) => onValidationStatusChanged(status, 6)}
                />
              )}

              {currentStep === 7 && (
                <Step7
                  ref={step7Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data: any) => onStepCompleted(data, 7)}
                  onValidationStatusChanged={(status: any) => onValidationStatusChanged(status, 7)}
                />
              )}

              {currentStep === 8 && (
                <Step8
                  ref={step8Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data: any) => onStepCompleted(data, 8)}
                  onValidationStatusChanged={(status: any) => onValidationStatusChanged(status, 8)}
                />
              )}

              {currentStep === 9 && (
                <Step9
                  ref={step9Ref}
                  isSubmitting={isSubmitting}
                  advertisementFormState={advertisementFormState}
                  onStepCompleted={(data) => onStepCompleted(data, 9)}
                  onValidationStatusChanged={(data) => onValidationStatusChanged(data, 9)}
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
                    {isSubmitting ? 'جاري الحفظ...' : currentStep === steps.length ? 'حفظ وإنهاء' : 'حفظ ومتابعة'}
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


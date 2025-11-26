export interface Project {
  id: string;
  title: string;
  location: string;
  district: string;
  city: string;
  price: number;
  currency: string;
  imageUrl: string;
  isFeatured: boolean;
  isNew: boolean;
  isFavorite: boolean;
  category: string;
  CreatedAt: any;
}

export interface ProjectCardData {
  Id: string;
  Name: string;
  FullAddress: string;
  CoverImageUrl: string;
  OwnerLogoUrl: string;
  ProjectTypeLabel: string;
  PriceFrom: number;
  UnitsCount: number;
  IsFavorite: boolean;
  ViewCount: number;
  IsUsd?: boolean;
}

export interface ProjectBasicInfo {
  name: string;
  description: string;
  unitsCount: number | null;
  unitType: number;
  unitTypeLabel?: string;
  priceFrom: number | null;
  priceTo: number | null;
  areaFrom: number | null;
  areaTo: number | null;
  licenseId?: string | null;
  status?: number;
  isUsd?: boolean;
}

export interface ProjectLocation {
  id: string;
  city: string;
  district: string;
  street: string;
  latitude: number | null;
  longitude: number | null;
  step: number;
}

export interface ProjectFeatures {
  features: string[];
  selectedFeatures?: string[];
}

export interface ProjectWarranty {
  constructionYears: number | null;
  electricalYears: number | null;
  plumbingYears: number | null;
}

export interface ProjectMedia {
  images: File[];
  videos: File[];
}

export interface UnitBasicInfo {
  Title: string;
  Description: string;
  ProjectId: string;
}

export interface UnitOwnerInfo {
  ownerType: number;
  ownerName: string;
  establishmentDate?: string;
}

export interface UnitDepartment {
  departmentId: number;
}

export interface UnitInformation {
  area: number | null;
  price: number | null;
  commissionAmount?: number | null;
  hasCommission: boolean;
}

export interface UnitDetails {
  numberOfRooms: number | null;
  numberOfHalls: number | null;
  numberOfBathrooms: number | null;
  propertyAge?: number | null;
  floor?: number | null;
  category: number;
}

export interface UnitAmenities {
  amenities: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface StepValidation {
  stepNumber: number;
  stepName: string;
  isValid: boolean;
  errors: string[];
  isCompleted: boolean;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  message: string;
  errors?: string[];
}

export interface ProjectCreationResponse {
  projectId: string;
  message: string;
}

export interface UnitCreationResponse {
  unitId: string;
  message: string;
}

export interface ProjectFormState {
  projectId?: string;
  currentStep: number;
  activeTab: string;
  steps: StepValidation[];
  isSubmitting: boolean;
  lastSavedStep?: number;
  projectData?: ProjectBasicInfo;
  locationData?: ProjectLocation;
  featuresData?: ProjectFeatures;
  warrantyData?: ProjectWarranty;
  mediaData?: { images: string[]; videos: string[] };
  unitsData?: any[];
}

export interface UnitFormState {
  unitId?: string;
  projectId?: string;
  currentStep: number;
  steps: StepValidation[];
  isSubmitting: boolean;
  lastSavedStep?: number;
  unitBasicData?: { title: string; description: string; ProjectId: string };
  unitOwnerData?: any;
  unitDepartmentData?: any;
  unitInfoData?: any;
  unitLocationData?: ProjectLocation;
  unitFeaturesData?: { selectedFeatures: string[] };
  unitWarrantyData?: ProjectWarranty;
  unitMediaData?: { images: string[]; videos: string[] };
  unitDetailsData?: any;
  unitPricingData?: any;
}


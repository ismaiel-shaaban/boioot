export interface AdvertisementFormState {
  step1: AdvertisementBasicInfo;
  step2: AdvertisementOwnerInfo;
  step3: AdvertisementCategory;
  step4: AdvertisementDetails;
  step5: AdvertisementMedia;
  step6: AdvertisementLocation;
  step7: AdvertisementSpecifications;
  step8: AdvertisementFeatures;
  step9?: AdvertisementRules;
}

export interface AdvertisementBasicInfo {
  propertyLicense: File | null;
  licenseId: string;
  adTitle: string;
  adDescription: string;
  adId?: string;
}

export interface AdvertisementOwnerInfo {
  ownerType: string;
  idNumber: string;
  birthDate: string;
  contactNumber: string;
}

export interface AdvertisementCategory {
  propertyType: number;
}

export interface AdvertisementDetails {
  area: number | null;
  rent: number | null;
  hasCommission: boolean;
  commissionAmount: number | null;
  rentalDuration?: number;
  paymentType?: number;
  isUsd?: boolean;
}

export interface AdvertisementMedia {
  images: (File | string)[];
  videos: (File | string)[];
}

export interface AdvertisementLocation {
  id: string;
  city: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
  step: number;
  mapLocation?: {
    lat: number;
    lng: number;
  };
}

export interface AdvertisementSpecifications {
  numberOfRooms: number | null;
  category: number;
  numberOfHalls: number | null;
  numberOfBathrooms: number | null;
  propertyAge: string;
  floor: string | null;
}

export interface AdvertisementFeatures {
  features: string[];
}

export interface AdvertisementRules {
  arriveTime: string;
  leaveTime: string;
  minDuration: number | null;
  cancelReservation: boolean;
  unitDescription: string;
  availableFrom: string;
  availableTo: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}


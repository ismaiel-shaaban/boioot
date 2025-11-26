import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export const dailyRentService = {
  async getAdvertisements(payload: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/daily-rent-search`;
    return apiClient.post(url, payload);
  },

  async getAdvertisementsByUserId(payload: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/user`;
    return apiClient.post(url, payload);
  },

  async getAdvertisementById(advertisementId: string) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/by-id`;
    return apiClient.post(url, { Id: advertisementId });
  },

  async likeAdvertisement(advertisementId: string) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/favorite/toggle`;
    return apiClient.post(url, { DailyRentId: advertisementId });
  },

  async createAdvertisementBasicInfo(advertisementData: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit`;
    return apiClient.post(url, advertisementData);
  },

  async updateAdvertisementBasicInfo(advertisementData: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/wizard/basic-info`;
    return apiClient.put(url, advertisementData);
  },

  async updateOwnerInfo(advertisementData: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/wizard/owner-info`;
    return apiClient.put(url, advertisementData);
  },

  async updateUnitType(ownerData: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/wizard/unit-type`;
    return apiClient.put(url, ownerData);
  },

  async updateAdvertisementLocation(locationData: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/wizard/unit-location`;
    return apiClient.put(url, locationData);
  },

  async updateUnitInfoDetails(detailsData: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/wizard/unit-info-details`;
    return apiClient.put(url, detailsData);
  },

  async updateUnitDetails(detailsData: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/wizard/unit-details`;
    return apiClient.put(url, detailsData);
  },

  async uploadAdvertisementMedia(mediaFiles: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/wizard/unit-media`;
    return apiClient.put(url, mediaFiles);
  },

  async updateAdvertisementFeatures(featuresData: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/wizard/unit-feature`;
    return apiClient.put(url, featuresData);
  },

  async updateAdvertisementPolicies(policiesData: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/wizard/unit-Rules`;
    return apiClient.put(url, policiesData);
  },

  async getSimilar(payload: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/daily-rent-unit/similar`;
    return apiClient.post(url, payload);
  },

  async deleteAdvertisement(advertisementId: string) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/${advertisementId}`;
    return apiClient.delete(url);
  },
};


import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export const specialOrderService = {
  async getAdvertisements(payload: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/special-order-search`;
    return apiClient.post(url, payload);
  },

  async getAdvertisementsByUserId(payload: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/special-order/user`;
    return apiClient.post(url, payload);
  },

  async getAdvertisementById(advertisementId: string) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/by-id`;
    return apiClient.post(url, { Id: advertisementId });
  },

  async likeAdvertisement(advertisementId: string) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/favorite/toggle`;
    return apiClient.post(url, { SpecialOrderId: advertisementId });
  },

  async createAdvertisementBasicInfo(advertisementData: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder`;
    return apiClient.post(url, advertisementData);
  },

  async updateAdvertisementBasicInfo(advertisementData: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/wizard/basic-info`;
    return apiClient.put(url, advertisementData);
  },

  async updateOwnerInfo(advertisementData: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/wizard/owner-info`;
    return apiClient.put(url, advertisementData);
  },

  async updateUnitType(ownerData: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/wizard/unit-type`;
    return apiClient.put(url, ownerData);
  },

  async updateAdvertisementLocation(locationData: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/wizard/unit-location`;
    return apiClient.put(url, locationData);
  },

  async updateUnitInfoDetails(detailsData: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/wizard/unit-info-details`;
    return apiClient.put(url, detailsData);
  },

  async updateUnitDetails(detailsData: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/wizard/unit-details`;
    return apiClient.put(url, detailsData);
  },

  async uploadAdvertisementMedia(mediaFiles: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/wizard/unit-media`;
    return apiClient.put(url, mediaFiles);
  },

  async updateAdvertisementFeatures(featuresData: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/wizard/unit-feature`;
    return apiClient.put(url, featuresData);
  },

  async deleteAdvertisement(advertisementId: string) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/${advertisementId}`;
    return apiClient.delete(url);
  },

  async getSimilar(payload: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/special-order/similar`;
    return apiClient.post(url, payload);
  },
};


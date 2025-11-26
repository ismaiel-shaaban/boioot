import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export const advertisementService = {
  async getAdvertisements(payload: any) {
    const url = `${environment.realestateApiUrl}/Ad/ads-search`;
    return apiClient.post(url, payload);
  },

  async getAdvertisementsByUserId(payload: any) {
    const url = `${environment.realestateApiUrl}/Ad/user-ads/by-id`;
    return apiClient.post(url, payload);
  },

  async getAdvertisementById(advertisementId: string) {
    const url = `${environment.realestateApiUrl}/Ad/by-id`;
    return apiClient.post(url, { Id: advertisementId });
  },

  async likeAdvertisement(advertisementId: string) {
    const url = `${environment.realestateApiUrl}/Ad/favorite/toggle`;
    return apiClient.post(url, { AddId: advertisementId });
  },

  // Advertisement Creation Methods
  async createAdvertisementBasicInfo(advertisementData: any) {
    const url = `${environment.realestateApiUrl}/Ad`;
    return apiClient.post(url, advertisementData);
  },

  async updateAdvertisementBasicInfo(advertisementData: any) {
    const url = `${environment.realestateApiUrl}/Ad/wizard/basic-info`;
    return apiClient.put(url, advertisementData);
  },

  async updateOwnerInfo(advertisementData: any) {
    const url = `${environment.realestateApiUrl}/Ad/wizard/owner-info`;
    return apiClient.put(url, advertisementData);
  },

  async updateUnitType(ownerData: any) {
    const url = `${environment.realestateApiUrl}/Ad/wizard/unit-type`;
    return apiClient.put(url, ownerData);
  },

  async updateAdvertisementLocation(locationData: any) {
    const url = `${environment.realestateApiUrl}/Ad/wizard/unit-location`;
    return apiClient.put(url, locationData);
  },

  async updateUnitInfoDetails(detailsData: any) {
    const url = `${environment.realestateApiUrl}/Ad/wizard/unit-info-details`;
    return apiClient.put(url, detailsData);
  },

  async updateUnitDetails(detailsData: any) {
    const url = `${environment.realestateApiUrl}/Ad/wizard/unit-details`;
    return apiClient.put(url, detailsData);
  },

  async uploadAdvertisementMedia(mediaFiles: any) {
    const url = `${environment.realestateApiUrl}/Ad/wizard/unit-media`;
    return apiClient.put(url, mediaFiles);
  },

  async updateAdvertisementFeatures(featuresData: any) {
    const url = `${environment.realestateApiUrl}/Ad/wizard/unit-feature`;
    return apiClient.put(url, featuresData);
  },

  async deleteAdvertisement(advertisementId: string) {
    const url = `${environment.realestateApiUrl}/Ad/${advertisementId}`;
    return apiClient.delete(url);
  },

  async getSimilar(payload: any) {
    const url = `${environment.realestateApiUrl}/Ad/ads/similar`;
    return apiClient.post(url, payload);
  },

  async shareAdInteraction(AdId: string, UserId: string | null = null, platform: number) {
    const url = `${environment.realestateApiUrl}/dashboard/ads/interactions`;
    const body = {
      Interaction: {
        AdId: AdId,
        Platform: platform,
        InteractionType: 'Share',
        UserId: UserId,
      },
    };
    return apiClient.post(url, body);
  },
};


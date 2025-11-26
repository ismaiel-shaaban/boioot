import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export const favoritesService = {
  async getFavorites(payload: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/favorites/short-list`;
    return apiClient.get(url);
  },

  async getFavourites(payload: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/favorites/short-list`;
    return apiClient.get(url);
  },

  async getSpecialOrder(payload: any) {
    const url = `${environment.realestateApiUrl}/SpecialOrder/favorites`;
    return apiClient.post(url, payload);
  },

  async getAd(payload: any) {
    const url = `${environment.realestateApiUrl}/Ad/favorites/paginated`;
    return apiClient.post(url, payload);
  },

  async getProjects(payload: any) {
    const url = `${environment.realestateApiUrl}/RealEstateProject/favorites/paginated`;
    return apiClient.post(url, payload);
  },

  async getUnits(payload: any) {
    const url = `${environment.realestateApiUrl}/RealEstateProject/favoriteUnits/paginated`;
    return apiClient.post(url, payload);
  },

  async getDailyRentUnit(payload: any) {
    const url = `${environment.realestateApiUrl}/DailyRentUnit/favorites`;
    return apiClient.post(url, payload);
  },
};


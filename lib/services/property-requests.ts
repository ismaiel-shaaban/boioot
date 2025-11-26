import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export interface PropertyRequestDto {
  CustomerName?: string;
  Email?: string;
  Phone?: string;
  Title: string;
  Description: string;
  Category: string;
  Region?: string;
  City: string;
  District?: string | null;
  Type: number;
}

export interface PropertyRequestPayload {
  Dto: PropertyRequestDto;
}

export const propertyRequestsService = {
  async createPropertyRequest(payload: PropertyRequestPayload) {
    const url = `${environment.realestateApiUrl}/PropertyRequests`;
    return apiClient.post(url, payload);
  },

  async getPropertyRequests(page: number = 1, pageSize: number = 10) {
    const url = `${environment.realestateApiUrl}/PropertyRequests?page=${page}&pageSize=${pageSize}`;
    return apiClient.get(url);
  },

  async getPropertyRequestById(id: string) {
    const url = `${environment.realestateApiUrl}/PropertyRequests/${id}`;
    return apiClient.get(url);
  },

  async updatePropertyRequest(id: string, payload: PropertyRequestPayload) {
    const url = `${environment.realestateApiUrl}/PropertyRequests/${id}`;
    return apiClient.put(url, payload);
  },

  async deletePropertyRequest(id: string) {
    const url = `${environment.realestateApiUrl}/PropertyRequests/${id}`;
    return apiClient.delete(url);
  },

  async getUserPropertyRequests(payload: any) {
    const url = `${environment.realestateApiUrl}/PropertyRequests/paginated`;
    return apiClient.post(url, payload);
  },

  async searchPropertyRequests(searchCriteria: any) {
    const url = `${environment.realestateApiUrl}/PropertyRequests/search`;
    return apiClient.post(url, searchCriteria);
  },
};


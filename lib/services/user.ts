import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export const userService = {
  async getUserById(userId: string) {
    const url = `${environment.identityApiUrl}/Users/${userId}`;
    return apiClient.get(url);
  },

  async getUserInfo() {
    // Angular uses /Users endpoint without /current
    const url = `${environment.identityApiUrl}/Users`;
    return apiClient.get(url);
  },

  async uploadUserProfile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${environment.identityApiUrl}/Users/upload-profile-image`;
    return apiClient.post(url, formData);
  },

  async updateUserInfo(data: { Request: { PhoneNumber: string; FullName: string; Email: string } }) {
    // Angular wraps data in Request object
    const url = `${environment.identityApiUrl}/Users`;
    return apiClient.put(url, data);
  },

  async changePassword(oldPassword: string, newPassword: string) {
    const url = `${environment.identityApiUrl}/Users/change-password`;
    return apiClient.post(url, { oldPassword, newPassword });
  },
};


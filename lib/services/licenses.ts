import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export const licensesService = {
  async uploadUserLicense(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${environment.realestateApiUrl}/RealEstateLicenses/upload-user-licenses`;
    return apiClient.post(url, formData);
  },

  async addLicense(LicenseNumber: any, file_url: any) {
    const IssuedDate = new Date();
    const ExpiryDate = new Date();
    const IsActive = true;
    const AttachmentUrls = [file_url];
    const url = `${environment.identityApiUrl}/RealEstateLicenses`;
    return apiClient.post(url, {
      LicenseNumber,
      ExpiryDate,
      IssuedDate,
      IsActive,
      AttachmentUrls,
    });
  },

  async updateLicense(Id: string, file_url: any) {
    const IssuedDate = new Date();
    const ExpiryDate = new Date();
    const IsActive = true;
    const AttachmentUrls: string[] = [];
    if (file_url) {
      AttachmentUrls.push(file_url);
    }

    const url = `${environment.identityApiUrl}/RealEstateLicenses`;
    const body: any = {
      Id,
      ExpiryDate,
      IssuedDate,
      IsActive,
    };

    if (AttachmentUrls.length > 0) {
      body.AttachmentUrls = AttachmentUrls;
    }

    return apiClient.put(url, body);
  },

  async deleteLicense(id: string) {
    const url = `${environment.realestateApiUrl}/RealEstateLicenses/${id}`;
    return apiClient.delete(url);
  },

  async getLicenses() {
    const url = `${environment.realestateApiUrl}/RealEstateLicenses`;
    return apiClient.get(url);
  },
};


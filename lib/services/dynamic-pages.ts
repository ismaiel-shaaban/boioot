import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export interface DynamicPage {
  Id: string;
  ShortCode: number;
  Name: string;
  Content: string;
  Slug: string;
  CreatedAt: string;
}

export interface DynamicPageResponse {
  IsSuccess: boolean;
  Error: any;
  Data: {
    Items: DynamicPage[];
    TotalCount: number;
    PageNumber: number;
    PageSize: number;
    TotalPages: number;
    HasPreviousPage: boolean;
    HasNextPage: boolean;
  };
}

export const dynamicPagesService = {
  async getPageByShortCode(shortCode: number): Promise<DynamicPage | null> {
    const payload = {
      Pagination: {
        PageNumber: 1,
        PageSize: 1,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {
          shortCode: shortCode.toString(),
        },
      },
    };

    const url = `${environment.identityApiUrl}/DynamicPage/paginated`;
    const response = await apiClient.post<DynamicPageResponse>(url, payload, { skipAuth: true });

    if (response.IsSuccess && response.Data) {
      const data = response.Data as any;
      if (data?.Items?.length > 0) {
        return data.Items[0];
      }
    }
    return null;
  },

  async getContactUsPage(): Promise<DynamicPage | null> {
    return this.getPageByShortCode(1001);
  },

  async getPrivacyPolicyPage(): Promise<DynamicPage | null> {
    return this.getPageByShortCode(1002);
  },

  async getTermsAndConditionsPage(): Promise<DynamicPage | null> {
    return this.getPageByShortCode(1003);
  },
};


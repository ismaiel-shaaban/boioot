import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export const membershipService = {
  async getMembershipTypes() {
    const url = `${environment.identityApiUrl}/MembershipType`;
    return apiClient.get(url, { skipAuth: true });
  },
};


import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export const subscribeService = {
  async getSubscribeTypes() {
    const url = `${environment.identityApiUrl}/Subscription/plans`;
    return apiClient.get(url);
  },

  async addSubscribeToUser(id: string) {
    const url = `${environment.identityApiUrl}/Subscription/subscribe`;
    return apiClient.post(url, { SubscriptionId: id });
  },

  async cancelSubscribe(id: string) {
    const url = `${environment.identityApiUrl}/Users/cancel-subscription`;
    return apiClient.post(url, { subscriptionId: id });
  },

  async getUserSubscription(userId?: string) {
    // Match Angular: uses /Users/{userId}/subscription
    // Angular's subscribeService.getUserInfo() returns decoded.sub which is the userId
    // If userId not provided, try to get from token or use /Users/subscription
    if (userId) {
      const url = `${environment.identityApiUrl}/Users/${userId}/subscription`;
      return apiClient.get(url);
    } else {
      // Fallback to current user endpoint if userId not provided
      const url = `${environment.identityApiUrl}/Users/subscription`;
      return apiClient.get(url);
    }
  },

  async checkSubscriptionStatus(): Promise<boolean> {
    try {
      const response = await this.getUserSubscription();
      // If IsSuccess is true and Data is null, user needs subscription
      return response?.IsSuccess === true && response?.Data === null;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  },
};


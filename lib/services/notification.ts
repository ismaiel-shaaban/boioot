import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export const notificationService = {
  async getNotifications(payload: any) {
    const url = `${environment.identityApiUrl}/Notifications/search`;
    return apiClient.post(url, payload);
  },

  async getUnreadNotificationCount() {
    const url = `${environment.identityApiUrl}/Notifications/unread-count`;
    return apiClient.get(url);
  },

  async markAsRead(notificationId: string) {
    const url = `${environment.identityApiUrl}/Notifications/${notificationId}/mark-read`;
    return apiClient.put(url);
  },

  async markAllAsRead() {
    const url = `${environment.identityApiUrl}/Notifications/mark-all-read`;
    return apiClient.put(url);
  },
};


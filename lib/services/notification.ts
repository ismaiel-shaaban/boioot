import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export const notificationService = {
  // Get user notifications with pagination - matching Angular API
  async getNotifications(payload: any) {
    const url = `${environment.realestateApiUrl}/Notification/list`;
    return apiClient.post(url, payload);
  },

  // Get unread notification count - matching Angular API
  async getUnreadNotificationCount() {
    const url = `${environment.realestateApiUrl}/Notification/unread-count`;
    return apiClient.get(url);
  },

  // Mark multiple notifications as read - matching Angular API
  async markMultipleAsRead(notificationIds: string[]) {
    const url = `${environment.realestateApiUrl}/Notification/mark-read`;
    const payload = {
      NotificationIds: notificationIds,
    };
    return apiClient.post(url, payload);
  },

  // Mark single notification as read (convenience method)
  async markAsRead(notificationId: string) {
    return this.markMultipleAsRead([notificationId]);
  },

  // Mark all notifications as read
  async markAllAsRead() {
    const url = `${environment.realestateApiUrl}/Notification/mark-all-read`;
    return apiClient.put(url);
  },
};


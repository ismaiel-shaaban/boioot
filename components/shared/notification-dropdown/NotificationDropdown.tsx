'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notificationService } from '@/lib/services/notification';
import { showToast } from '@/lib/utils/toast';
import styles from './NotificationDropdown.module.css';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const requestPayload = {
        Pagination: {
          PageNumber: 1,
          PageSize: 10,
          SortBy: '',
          IsDescending: true,
          SearchTerm: '',
          Filters: {},
        },
      };
      const response = await notificationService.getNotifications(requestPayload);
      if (response?.IsSuccess) {
        const data = response.Data as any;
        setNotifications(data?.Items || []);
      } else {
        showToast('فشل في جلب الإشعارات', 'error');
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      showToast('حدث خطأ في جلب الإشعارات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationClick = async (notification: any) => {
    if (!notification.IsRead) {
      await markNotificationAsRead(notification.Id);
    }
    onClose();

    if (notification?.Source === 1) {
      router.push(`/ad-details/${notification?.RelatedEntityId}`);
    } else if (notification?.Source === 2) {
      router.push(`/special-order-details/${notification?.RelatedEntityId}`);
    } else if (notification?.Source === 3) {
      router.push(`/daily-rent-details/${notification?.RelatedEntityId}`);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response?.IsSuccess) {
        setNotifications((prev) =>
          prev.map((n) => (n.Id === notificationId ? { ...n, IsRead: true } : n))
        );
      }
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const viewAllNotifications = () => {
    onClose();
    router.push('/notifications');
  };

  const getNotificationType = (notification: any): { text: string; class: string } => {
    if (notification?.Source === 1) {
      return { text: 'إعلان عقار', class: styles.badgeAd };
    } else if (notification?.Source === 2) {
      return { text: 'طلب خاص', class: styles.badgeSpecialOrder };
    } else if (notification?.Source === 3) {
      return { text: 'إيجار يومي', class: styles.badgeDailyRent };
    } else {
      return { text: 'عام', class: styles.badgeGeneral };
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Desktop Notification Dropdown */}
      <div
        className={`${styles.notificationDropdown} d-none d-md-block`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="قائمة الإشعارات"
      >
        <div className={styles.notificationHeader}>
          <h6 className={styles.notificationTitle}>الإشعارات الجديدة</h6>
          <div className={styles.headerActions}>
            <button className={styles.viewAllBtn} onClick={viewAllNotifications} aria-label="عرض جميع الإشعارات">
              الكل
            </button>
            <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق الإشعارات">
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>

        <div className={styles.notificationContent}>
          <div className={styles.notificationList} aria-label="قائمة الإشعارات">
            {isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>جاري التحميل...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="alert alert-info text-center">لا توجد إشعارات</div>
            ) : (
              notifications.map((notification) => {
                const notificationType = getNotificationType(notification);
                return (
                  <div
                    key={notification.Id}
                    className={`${styles.notificationItem} ${!notification.IsRead ? styles.new : ''}`}
                    onClick={() => onNotificationClick(notification)}
                  >
                    <div className={styles.notificationIcon}>
                      <i className="fa-solid fa-bell"></i>
                    </div>
                    <div className={styles.notificationDetails}>
                      <div className={styles.notificationHeader2}>
                        <p className={styles.notificationText}>{notification?.Title}</p>
                        <span className={`${styles.notificationBadge} ${notificationType.class}`}>
                          {notificationType.text}
                        </span>
                      </div>
                      <span className={styles.notificationDate}>{formatDate(notification?.Timestamp)}</span>
                    </div>
                    {!notification?.IsRead && (
                      <div className={styles.notificationIndicator}>
                        <span className={styles.newIndicator}></span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Mobile Notification Modal */}
      <div className={styles.mobileNotificationModal} onClick={onClose} role="dialog" aria-label="الإشعارات على الجوال">
        <div className={styles.mobileModalContent} onClick={(e) => e.stopPropagation()}>
          <div className={styles.mobileModalHeader}>
            <h5>الإشعارات</h5>
            <div className={styles.mobileHeaderActions}>
              <button className={styles.mobileViewAllBtn} onClick={viewAllNotifications}>
                الكل
              </button>
              <button className={styles.mobileCloseBtn} onClick={onClose}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          </div>

          <div className={styles.mobileModalBody}>
            <div className={styles.mobileNotificationList}>
              {isLoading ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>جاري التحميل...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="alert alert-info text-center">لا توجد إشعارات</div>
              ) : (
                notifications.map((notification) => {
                  const notificationType = getNotificationType(notification);
                  return (
                    <div
                      key={notification.Id}
                      className={`${styles.mobileNotificationItem} ${!notification.IsRead ? styles.new : ''}`}
                      onClick={() => onNotificationClick(notification)}
                    >
                      <div className={styles.mobileNotificationContent}>
                        <div className={styles.mobileNotificationIcon}>
                          <i className="fa-solid fa-bell"></i>
                        </div>
                        <div className={styles.mobileNotificationDetails}>
                          <div className={styles.mobileNotificationHeader}>
                            <p className={styles.mobileNotificationText}>{notification?.Title}</p>
                            <span className={`${styles.notificationBadge} ${styles.mobileBadge} ${notificationType.class}`}>
                              {notificationType.text}
                            </span>
                          </div>
                          <span className={styles.mobileNotificationDate}>{formatDate(notification?.Timestamp)}</span>
                        </div>
                        {!notification?.IsRead && (
                          <div className={styles.mobileNotificationIndicator}>
                            <span className={styles.mobileNewIndicator}></span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


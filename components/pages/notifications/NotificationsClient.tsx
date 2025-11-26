'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notificationService } from '@/lib/services/notification';
import { showToast } from '@/lib/utils/toast';

export default function NotificationsClient() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchNotifications();
  }, [currentPage]);

  const fetchNotifications = async () => {
    setIsLoading(true);

    const requestPayload = {
      Pagination: {
        PageNumber: currentPage,
        PageSize: pageSize,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
    };

    try {
      const response = await notificationService.getNotifications(requestPayload);
      if (response.IsSuccess) {
        const data = response.Data as any;
        setNotifications(data?.Items || []);
        setTotalPages(data?.TotalPages || 1);
        setTotalNotifications(data?.TotalCount || 0);

        // Mark unread notifications as read after 2 seconds
        const unreadNotifications = data?.Items?.filter(
          (notification: any) => notification.IsRead === false
        ) || [];
        if (unreadNotifications.length > 0) {
          setTimeout(() => {
            const unreadIds = unreadNotifications.map((n: any) => n.Id);
            markMultipleNotificationsAsRead(unreadIds);
          }, 2000);
        }
      } else {
        showToast('فشل في جلب الإشعارات', 'error');
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error('Error fetching notifications:', error);
      showToast('حدث خطأ في جلب الإشعارات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const markMultipleNotificationsAsRead = async (notificationIds: string[]) => {
    try {
      // Implement mark multiple as read
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (notificationIds.includes(n.Id) ? { ...n, IsRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const onNotificationClick = (notification: any) => {
    if (!notification.IsRead) {
      markMultipleNotificationsAsRead([notification.Id]);
    }

    if (notification?.Source === 1) {
      router.push(`/ad-details/${notification?.RelatedEntityId}`);
    } else if (notification?.Source === 2) {
      router.push(`/special-order-details/${notification?.RelatedEntityId}`);
    } else if (notification?.Source === 3) {
      router.push(`/daily-rent-details/${notification?.RelatedEntityId}`);
    }
  };

  const getNotificationIcon = (notification: any): string => {
    if (notification.Type) {
      switch (notification.Type.toLowerCase()) {
        case 'message':
          return 'fa-solid fa-message';
        case 'alert':
          return 'fa-solid fa-exclamation-triangle';
        case 'info':
          return 'fa-solid fa-info-circle';
        case 'success':
          return 'fa-solid fa-check-circle';
        default:
          return 'fa-solid fa-bell';
      }
    }
    return 'fa-solid fa-bell';
  };

  const getNotificationType = (notification: any): { text: string; class: string } => {
    if (notification?.Source === 1) {
      return { text: 'إعلان عقار', class: 'badge-ad' };
    } else if (notification?.Source === 2) {
      return { text: 'طلب خاص', class: 'badge-special-order' };
    } else if (notification?.Source === 3) {
      return { text: 'إيجار يومي', class: 'badge-daily-rent' };
    } else {
      return { text: 'عام', class: 'badge-general' };
    }
  };

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1>الإشعارات</h1>

      {notifications.length === 0 ? (
        <div className="alert alert-info" role="alert">
          لا توجد إشعارات متاحة
        </div>
      ) : (
        <>
          <div className="list-group">
            {notifications.map((notification) => {
              const typeInfo = getNotificationType(notification);
              return (
                <div
                  key={notification.Id}
                  className={`list-group-item list-group-item-action ${!notification.IsRead ? 'bg-light' : ''}`}
                  onClick={() => onNotificationClick(notification)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex w-100 justify-content-between">
                    <div className="d-flex align-items-start">
                      <i className={`${getNotificationIcon(notification)} me-3 mt-1`}></i>
                      <div>
                        <h5 className="mb-1">{notification.Title}</h5>
                        <p className="mb-1">{notification.Message}</p>
                        <small className="text-muted">
                          {new Date(notification.CreatedAt).toLocaleDateString('ar-SY')}
                        </small>
                      </div>
                    </div>
                    <span className={`badge ${typeInfo.class}`}>{typeInfo.text}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    السابق
                  </button>
                </li>
                {getPageNumbers().map((page) => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setCurrentPage(page)}>
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    التالي
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}


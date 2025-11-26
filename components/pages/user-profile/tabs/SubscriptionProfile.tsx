'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeService } from '@/lib/services/subscribe';
import { showToast } from '@/lib/utils/toast';
import { useAuth } from '@/lib/contexts/AuthContext';
import styles from './SubscriptionProfile.module.css';

interface SubscriptionProfileProps {
  userId?: string;
}

export default function SubscriptionProfile({ userId }: SubscriptionProfileProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [noSubscription, setNoSubscription] = useState(false);
  const [restAd, setRestAd] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user]);

  const getSubscription = async () => {
    setIsLoading(true);
    try {
      // Match Angular: uses userId from getUserInfo() which returns decoded.sub (the 'sub' claim in JWT)
      // Angular's subscribeService.getUserInfo() returns decoded.sub directly
      const userIdToUse = userId || user?.sub || (typeof user === 'string' ? user : user?.Id || user?.id);
      const response = await subscribeService.getUserSubscription(userIdToUse);
      // Match Angular's logic: check IsSuccess first
      if (response?.IsSuccess) {
        if (response?.Data) {
          const data = response.Data as any;
          setSubscriptionData(data);
          // Match Angular: calculate remaining ads
          if (data.MaxAdsCount && data.AdsUsed) {
            const remaining = parseInt(String(data.MaxAdsCount)) - parseInt(String(data.AdsUsed));
            setRestAd(remaining >= 0 ? remaining : 0);
          }
          setNoSubscription(false);
        } else {
          // No subscription data
          setNoSubscription(true);
        }
      } else {
        showToast(response?.Error || 'فشل في تحميل بيانات الاشتراك', 'error');
        setNoSubscription(true);
      }
    } catch (error: any) {
      console.error('Error loading subscription:', error);
      showToast('حدث خطأ أثناء تحميل بيانات الاشتراك', 'error');
      setNoSubscription(true);
    } finally {
      setIsLoading(false);
    }
  };

  const goToSubscribe = () => {
    router.push('/subscribe');
  };

  const toggleCancellationDialog = () => {
    setShowCancellationDialog(!showCancellationDialog);
  };

  const cancelSubscribtion = async () => {
    if (!subscriptionData?.SubscriptionId) return;

    try {
      const response = await subscribeService.cancelSubscribe(subscriptionData.SubscriptionId);
      // Match Angular's logic: check IsSuccess
      if (response?.IsSuccess) {
        showToast('تم الغاء الاشتراك', 'success');
        setShowCancellationDialog(false);
        getSubscription(); // Reload subscription data
      } else {
        showToast(response?.Error || 'فشل في إلغاء الاشتراك', 'error');
        setShowCancellationDialog(false);
      }
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      showToast(error?.message || 'حدث خطأ أثناء إلغاء الاشتراك', 'error');
      setShowCancellationDialog(false);
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Match Angular's date pipe: 'mediumDate' format
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={styles.subscriptionTab}>
      {isLoading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-2">جاري تحميل بيانات الاشتراك...</p>
        </div>
      )}

      {!isLoading && !noSubscription && subscriptionData && (
        <div className={styles.subscriptionInfo} role="region" aria-label="معلومات الاشتراك">
          <div className="row">
            <div className="col-md-6">
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>باقتك الحاليه</div>
                <div className={styles.infoValue}>{subscriptionData.SubscriptionName || 'غير محدد'}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>تاريخ الاشتراك</div>
                <div className={styles.infoValue}>{formatDate(subscriptionData.StartDate)}</div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>تاريخ نهاية الاشتراك</div>
                <div className={styles.infoValue}>{formatDate(subscriptionData.EndDate)}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>عدد الإعلانات المنشورة</div>
                <div className={styles.infoValue}>{subscriptionData.AdsUsed || 0}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>عدد الإعلانات المتبقية</div>
                <div className={styles.infoValue}>{restAd}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLoading && noSubscription && (
        <div className={styles.subscriptionInfo} role="region" aria-label="لا يوجد اشتراك">
          <div className="col-12">
            <div className="alert alert-info text-center" role="alert">
              ليس لديك اشتراك حتى الآن
            </div>
          </div>
        </div>
      )}

      <div className={styles.subscriptionActions} aria-label="إجراءات الاشتراك">
        <div className="row mt-4">
          <div className="col-md-2">
            <button className={`btn ${styles.btnUpgrade}`} onClick={goToSubscribe} aria-label="ترقية الاشتراك">
              ترقية
            </button>
          </div>
          <div className="col-md-3">
            {!noSubscription && (
              <button
                className={`btn ${styles.btnCancelSubscription}`}
                onClick={toggleCancellationDialog}
                aria-label="إلغاء الاشتراك"
              >
                إلغاء الاشتراك
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation Dialog */}
      {showCancellationDialog && (
        <div className={styles.cancellationDialog} role="dialog" aria-label="تأكيد إلغاء الاشتراك">
          <div
            className={styles.dialogOverlay}
            onClick={toggleCancellationDialog}
            aria-label="إغلاق نافذة التأكيد"
          ></div>
          <div className={styles.dialogContent}>
            <h3 className={styles.dialogTitle}>هل أنت متأكد؟</h3>
            <p className={styles.dialogMessage}>
              في حال تم إلغاء تفعيل الباقة لن يتم تعويضك مقابل الإعلانات التي لم يتم استخدمها
            </p>
            <div className={styles.dialogActions}>
              <button
                className={`btn ${styles.btnSuccess}`}
                onClick={cancelSubscribtion}
                aria-label="تأكيد إلغاء الاشتراك"
              >
                إلغاء الاشتراك
              </button>
              <button
                className={`btn ${styles.btnCancel}`}
                onClick={toggleCancellationDialog}
                aria-label="تراجع"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

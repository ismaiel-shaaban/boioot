'use client';

import { showToast } from '@/lib/utils/toast';
import styles from './ShareModal.module.css';

interface ShareModalProps {
  shareUrl: string;
  shareTitle: string;
  adId: string;
  userId: string | null;
  onClose: () => void;
}

export default function ShareModal({ shareUrl, shareTitle, adId, userId, onClose }: ShareModalProps) {
  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    onClose();
  };

  const shareOnX = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
    onClose();
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`;
    window.open(url, '_blank');
    onClose();
  };

  const shareOnTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank');
    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('تم نسخ الرابط بنجاح', 'success');
      onClose();
    }).catch(() => {
      showToast('فشل نسخ الرابط', 'error');
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h5 className={styles.modalTitle}>مشاركة المنشور</h5>
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.shareOptions} aria-label="خيارات المشاركة">
              <button className={`${styles.shareBtn} ${styles.facebook}`} onClick={shareOnFacebook} aria-label="مشاركة على فيسبوك">
                <i className="fab fa-facebook-f"></i>
                <span>فيسبوك</span>
              </button>
              <button className={`${styles.shareBtn} ${styles.x}`} onClick={shareOnX} aria-label="مشاركة على X">
                <i className="fa-brands fa-x-twitter"></i>
                <span>X</span>
              </button>
              <button className={`${styles.shareBtn} ${styles.whatsapp}`} onClick={shareOnWhatsApp} aria-label="مشاركة على واتساب">
                <i className="fab fa-whatsapp"></i>
                <span>واتساب</span>
              </button>
              <button className={`${styles.shareBtn} ${styles.telegram}`} onClick={shareOnTelegram} aria-label="مشاركة على تيليجرام">
                <i className="fab fa-telegram"></i>
                <span>تيليجرام</span>
              </button>
            </div>
            <div className={styles.copyLink} aria-label="نسخ الرابط">
              <div className={styles.inputGroup}>
                <input type="text" className={styles.input} value={shareUrl} readOnly aria-label="رابط المشاركة" />
                <button className={styles.copyBtn} type="button" onClick={copyToClipboard} aria-label="نسخ الرابط إلى الحافظة">
                  <i className="fas fa-copy"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

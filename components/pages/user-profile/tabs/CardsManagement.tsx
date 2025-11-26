'use client';

import { useState, useEffect, useMemo } from 'react';
import { paymentCardsService } from '@/lib/services/payments';
import { showToast } from '@/lib/utils/toast';
import { useAuth } from '@/lib/contexts/AuthContext';
import styles from './CardsManagement.module.css';

interface PaymentCard {
  Id: string;
  MaskedCardNumber: string;
  CardHolderName: string;
  ExpiryYear: number;
  ExpiryMonth: number;
  CardType?: string;
}

interface CardsManagementProps {
  onChangeTab?: (card: any) => void;
  userId?: string;
}

export default function CardsManagement({ onChangeTab, userId }: CardsManagementProps) {
  const { user } = useAuth();
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [cardIdToDelete, setCardIdToDelete] = useState<string | null>(null);

  const resolvedUserId = useMemo(() => {
    if (userId) return userId;
    if (user) {
      return user.Id || user.id || user.UserId || user.userId || user.sub || user.nameid;
    }
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          return parsed?.Id || parsed?.id || parsed?.UserId || parsed?.userId;
        } catch (error) {
          console.warn('Failed to parse stored user', error);
        }
      }
    }
    return undefined;
  }, [userId, user]);

  useEffect(() => {
    if (!resolvedUserId) return;
    getAllCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedUserId]);

  const getAllCards = async () => {
    setIsLoading(true);
    try {
      if (!resolvedUserId) {
        setIsLoading(false);
        showToast('تعذر تحديد حساب المستخدم لتحميل البطاقات', 'error');
        return;
      }
      const response = await paymentCardsService.getPaymentCards(resolvedUserId);
      if (response?.IsSuccess || response?.Success) {
        const data = response?.Data as any;
        const cards = Array.isArray(data) ? data : (data?.Items || []);
        // Assign card type based on index (similar to Angular implementation)
        const cardsWithType = cards.map((card: PaymentCard, index: number) => ({
          ...card,
          CardType: index % 2 === 0 ? 'visa' : 'debit',
        }));
        setPaymentCards(cardsWithType);
      } else {
        showToast(response?.Error || response?.Message || 'فشل في تحميل البطاقات', 'error');
      }
    } catch (error: any) {
      console.error('Error loading payment cards:', error);
      showToast('حدث خطأ أثناء تحميل البطاقات', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const editCard = (card: PaymentCard) => {
    if (onChangeTab) {
      onChangeTab({
        cardId: card.Id,
        cardNumber: card.MaskedCardNumber,
        cardHolderName: card.CardHolderName,
        cardExpireYear: card.ExpiryYear,
        cardExpireMonth: card.ExpiryMonth,
      });
    }
  };

  const openDeleteModal = (cardId: string) => {
    setCardIdToDelete(cardId);
    setShowDeleteDialog(true);
  };

  const toggleDeleteDialog = () => {
    setShowDeleteDialog(!showDeleteDialog);
    if (showDeleteDialog) {
      setCardIdToDelete(null);
    }
  };

  const deleteCard = async () => {
    if (!cardIdToDelete) return;

    try {
      const response = await paymentCardsService.deleteCard(cardIdToDelete);
      if (response?.IsSuccess || response?.Success) {
        showToast('تم الحذف بنجاح', 'success');
        setCardIdToDelete(null);
        toggleDeleteDialog();
        getAllCards();
      } else {
        showToast(response?.Error || response?.Message || 'فشل في حذف البطاقة', 'error');
        toggleDeleteDialog();
      }
    } catch (error: any) {
      console.error('Error deleting card:', error);
      showToast('حدث خطأ أثناء حذف البطاقة', 'error');
      toggleDeleteDialog();
    }
  };

  const formatExpiryMonth = (month: number): string => {
    return month < 10 ? `0${month}` : `${month}`;
  };

  return (
    <div className={styles.cardsList} aria-label="قائمة البطاقات">
      {isLoading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-2">جاري تحميل البطاقات...</p>
        </div>
      )}

      {!isLoading && paymentCards && paymentCards.length > 0 && (
        <div className="row">
          {paymentCards.map((card) => (
            <div key={card.Id} className="col-md-6 mb-4">
              <div className={`${styles.visaCard} ${card.CardType === 'visa' ? styles.visa : styles.debit}`}>
                <div className={`${styles.cardItem} ${card.CardType === 'visa' ? styles.visaCardType : styles.debitCardType}`} role="article" aria-label="بطاقة">
                  <div className={styles.cardLogo} aria-label="شعار البطاقة"></div>
                  <div className={styles.cardNumber} aria-label="رقم البطاقة">
                    {card.MaskedCardNumber}
                  </div>
                  <div className={styles.cardHolder} aria-label="اسم حامل البطاقة">
                    {card.CardHolderName}
                  </div>
                  <div className={styles.cardExpiry} aria-label="تاريخ انتهاء البطاقة">
                    <span className={styles.expiryLabel}>VALID THRU</span>
                    <span className={styles.expiryDate}>
                      {card.ExpiryYear} / {formatExpiryMonth(card.ExpiryMonth)}
                    </span>
                  </div>
                  <div className={styles.cardNetwork} aria-label="شبكة البطاقة"></div>
                </div>
              </div>
              <div className={styles.cardActionsContainer}>
                <button
                  className={`btn ${styles.btnEdit}`}
                  onClick={() => editCard(card)}
                  aria-label="تعديل البطاقة"
                >
                  <i className="fas fa-edit"></i> تعديل
                </button>
                <button
                  className={`btn ${styles.btnDelete}`}
                  onClick={() => openDeleteModal(card.Id)}
                  aria-label="حذف البطاقة"
                >
                  <i className="fas fa-trash"></i> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!paymentCards || paymentCards.length === 0) && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-info text-center" role="alert" aria-label="لا يوجد بطاقات">
              لايوجد بطاقات
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className={styles.cancellationDialog} role="dialog" aria-modal="true" aria-label="تأكيد حذف البطاقة">
          <div
            className={styles.dialogOverlay}
            onClick={toggleDeleteDialog}
            aria-label="إغلاق مربع الحوار"
          ></div>
          <div className={styles.dialogContent}>
            <h3 className={styles.dialogTitle}>تأكيد الحذف</h3>
            <p className={styles.dialogMessage}>
              هل أنت متأكد من حذف هذه البطاقة؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className={styles.dialogActions}>
              <button
                className={`btn ${styles.btnSuccess}`}
                onClick={deleteCard}
                aria-label="تأكيد حذف البطاقة"
              >
                حذف البطاقة؟
              </button>
              <button
                className={`btn ${styles.btnCancel}`}
                onClick={toggleDeleteDialog}
                aria-label="تراجع عن الحذف"
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

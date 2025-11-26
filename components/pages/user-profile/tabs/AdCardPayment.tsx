'use client';

import { useState, useEffect } from 'react';
import { paymentCardsService } from '@/lib/services/payments';
import { showToast } from '@/lib/utils/toast';
import styles from './AdCardPayment.module.css';

export interface Card {
  cardId?: string;
  cardNumber?: string;
  cardHolderName?: string;
  cardExpireYear?: string | number;
  cardExpireMonth?: string | number;
  [key: string]: any;
}

interface AdCardPaymentProps {
  card?: Card | null;
  onChangeTab?: () => void;
}

export default function AdCardPayment({ card, onChangeTab }: AdCardPaymentProps) {
  const [number, setNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [todayDate, setTodayDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cardId, setCardId] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    setTodayDate(`${year}-${month}`);

    if (card) {
      getCardById();
    }
  }, [card]);

  const getCardById = async () => {
    setIsLoading(true);
    try {
      setCardId(card?.cardId || null);
      setNumber(card?.cardNumber || '');
      setHolderName(card?.cardHolderName || '');

      if (card?.cardExpireYear && card?.cardExpireMonth) {
        const month = parseInt(String(card.cardExpireMonth));
        const formattedMonth = month < 10 ? `0${month}` : `${month}`;
        setExpiryDate(`${card.cardExpireYear}-${formattedMonth}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveChange = async () => {
    if (!card) {
      await addNewCard();
    } else {
      await updateCard();
    }
  };

  const addNewCard = async () => {
    if (!number || !holderName || !expiryDate) {
      showToast('يرجى إدخال جميع الحقول المطلوبة', 'error');
      return;
    }

    // Validate card number (16 digits)
    const cardNumberRegex = /^[0-9]{16}$/;
    if (!cardNumberRegex.test(number.replace(/\s/g, ''))) {
      showToast('يجب أن يتكون رقم البطاقة من 16 رقم', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const date = new Date(expiryDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const CardToken = '143456'; // This would typically come from a payment processor
      const IsVirtual = true;
      const CardType = 'MASTER';

      const response = await paymentCardsService.addCard(
        number.replace(/\s/g, ''),
        month,
        year,
        holderName,
        CardToken,
        IsVirtual,
        CardType
      );

      if (response?.IsSuccess || response?.Success) {
        setNumber('');
        setExpiryDate('');
        setHolderName('');
        showToast((response as any)?.Message || 'تم إضافة البطاقة بنجاح', 'success');
        onChangeTab?.();
      } else {
        showToast((response as any)?.Error || 'فشل في إضافة البطاقة', 'error');
      }
    } catch (error) {
      console.error('Error adding card:', error);
      showToast('حدث خطأ أثناء إضافة البطاقة', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCard = async () => {
    if (!number || !holderName || !expiryDate || !cardId) {
      showToast('يرجى إدخال جميع الحقول المطلوبة', 'error');
      return;
    }

    // Validate card number (16 digits)
    const cardNumberRegex = /^[0-9]{16}$/;
    if (!cardNumberRegex.test(number.replace(/\s/g, ''))) {
      showToast('يجب أن يتكون رقم البطاقة من 16 رقم', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const date = new Date(expiryDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const CardToken = '122456'; // This would typically come from a payment processor
      const IsVirtual = true;

      const response = await paymentCardsService.updateCard(
        cardId,
        number.replace(/\s/g, ''),
        month,
        year,
        holderName,
        CardToken,
        IsVirtual
      );

      if (response?.IsSuccess || response?.Success) {
        setNumber('');
        setExpiryDate('');
        setHolderName('');
        setCardId(null);
        showToast(response?.Message || 'تم تحديث البطاقة بنجاح', 'success');
        onChangeTab?.();
      } else {
        showToast((response as any)?.Error || 'فشل في تحديث البطاقة', 'error');
      }
    } catch (error) {
      console.error('Error updating card:', error);
      showToast('حدث خطأ أثناء تحديث البطاقة', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const cancel = () => {
    setNumber('');
    setHolderName('');
    setExpiryDate('');
    setCardId(null);
    onChangeTab?.();
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16) {
      setNumber(formatCardNumber(value));
    }
  };

  const isFormValid = number.replace(/\s/g, '').length === 16 && holderName && expiryDate;

  return (
    <div className={styles.addCardTab}>
      <h3 className={styles.sectionTitle} aria-label={!card ? 'إضافة بطاقة جديدة' : 'تعديل البطاقة'}>
        {!card ? 'إضافة بطاقة جديدة' : 'تعديل البطاقة'}
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveChange();
        }}
        aria-label="نموذج إضافة أو تعديل بطاقة"
      >
        <div className="row">
          <div className="col-lg-6">
            <div className="form-floating mb-3">
              <input
                type="text"
                id="cardHolder"
                className="form-control"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="الاسم كامل"
                required
                pattern="[a-zA-Z\u0600-\u06FF\s]+"
                aria-label="اسم حامل البطاقة"
              />
              <label htmlFor="cardHolder">الاسم كامل</label>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="form-floating mb-3">
              <input
                type="text"
                id="cardNumber"
                className="form-control"
                value={number}
                onChange={handleCardNumberChange}
                placeholder="رقم البطاقة"
                required
                maxLength={19}
                aria-label="رقم البطاقة"
              />
              <label htmlFor="cardNumber">رقم البطاقة</label>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6">
            <div className="mb-3">
              <div className="input-group">
                <div className="form-floating">
                  <input
                    type="month"
                    id="expiryDate"
                    className="form-control"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="YYYY-MM"
                    required
                    min={todayDate}
                    aria-label="تاريخ انتهاء البطاقة"
                  />
                  <label htmlFor="expiryDate">تاريخ إنتهاء صلاحية البطاقة</label>
                </div>
                <span className="input-group-text" aria-label="أيقونة التقويم">
                  <i className="fa-solid fa-calendar-days"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={`btn ${styles.btnSave}`}
            disabled={!isFormValid || isLoading}
            aria-label="حفظ البطاقة"
          >
            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button type="button" className={`btn ${styles.btnCancel}`} onClick={cancel} aria-label="إلغاء">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

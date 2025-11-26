'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { showToast } from '@/lib/utils/toast';
import styles from './AuthModal.module.css';

interface ForgetPasswordModalProps {
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function ForgetPasswordModal({ onClose, onOpenLogin }: ForgetPasswordModalProps) {
  const { forgetPassword } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = () => {
    const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    setIsEmailValid(emailPattern.test(email));
  };

  const handleNextStep = async () => {
    if (currentStep < 2) {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await forgetPassword(email);
        if (response?.IsSuccess) {
          localStorage.setItem('token', response?.Data?.AccessToken);
          showToast('تم ارسال رابط على حسابك', 'success');
          setCurrentStep(2);
        } else {
          showToast(response?.Error || 'حدث خطأ', 'error');
          setErrorMessage(response?.Error || 'حدث خطأ');
        }
      } catch (error: any) {
        setErrorMessage(error?.message || 'حدث خطأ');
        showToast(error?.message || 'حدث خطأ', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <div className={styles.modalBackdrop} onClick={onClose} aria-label="إغلاق النافذة"></div>
      <div className={styles.modalMainContainer} role="dialog" aria-modal="true" aria-label="استعادة كلمة المرور">
        <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>إستعادة كلمة المرور</h5>
              <button type="button" className={styles.btnClose} onClick={onClose} aria-label="إغلاق">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {currentStep === 1 && (
                <div className={styles.stepContent}>
                  <p className={styles.instructionText}>
                    فضلا أدخل البريد الإلكتروني الذي قمت بالتسجيل به، سيتم إرسال رابط لإستعادة كلمة المرور
                  </p>
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateEmail();
                      }}
                      placeholder="البريد الإلكتروني"
                      aria-label="البريد الإلكتروني"
                    />
                    <label htmlFor="email">البريد الإلكتروني</label>
                  </div>
                  <button
                    className="btn btn-success w-100"
                    disabled={!isEmailValid || isLoading}
                    onClick={handleNextStep}
                    aria-label="إرسال رابط الاستعادة"
                  >
                    {isLoading ? 'جاري الإرسال...' : 'إرسال'}
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className={styles.stepContent}>
                  <div className={styles.successContainer}>
                    <div className={styles.successIcon}>
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h4 className={styles.successTitle}>تم إرسال رابط على حسابك</h4>
                  </div>
                  <button className="btn btn-success w-100" onClick={onOpenLogin} aria-label="الذهاب للبريد">
                    الذهاب للبريد
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="text-danger text-center mt-2" aria-label="رسالة خطأ">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { showToast } from '@/lib/utils/toast';
import styles from './AuthModal.module.css';

interface LoginModalProps {
  onClose: () => void;
  onOpenRegister: () => void;
  onOpenForgetPassword: () => void;
}

export default function LoginModal({ onClose, onOpenRegister, onOpenForgetPassword }: LoginModalProps) {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isEmailValid = (): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const isPasswordValid = (): boolean => {
    return password.length >= 8;
  };

  const canSubmit = (): boolean => {
    return isEmailValid() && isPasswordValid();
  };

  const handleSubmit = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!canSubmit()) {
      alert('يرجى تصحيح الحقول قبل المتابعة.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await login(email, password);
      if (response?.IsSuccess || response?.Success) {
        const token = response?.Data?.AccessToken || response?.Data?.token;
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('token', token);
          // Store token in cookie for middleware
          document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
          if (response?.Data?.RefreshToken) {
            localStorage.setItem('refreshToken', response?.Data?.RefreshToken);
          }
          if (response?.Data?.ExpireAt) {
            localStorage.setItem('tokenExpireAt', response?.Data?.ExpireAt);
          }
        }
        showToast('تم تسجيل الدخول بنجاح', 'success');
        onClose();
        
        // Small delay to ensure cookie is set
        setTimeout(() => {
          // Check for redirect parameter
          const redirectPath = searchParams?.get('redirect');
          if (redirectPath) {
            // Navigate to the redirect path
            window.location.href = redirectPath;
          } else {
            window.location.reload();
          }
        }, 100);
      } else {
        setErrorMessage(response?.Error || 'فشل تسجيل الدخول');
        showToast(response?.Error || 'فشل تسجيل الدخول', 'error');
      }
    } catch (error: any) {
      setErrorMessage(error?.message || 'حدث خطأ أثناء تسجيل الدخول');
      showToast(error?.message || 'حدث خطأ أثناء تسجيل الدخول', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className={styles.modalBackdrop} onClick={onClose} aria-label="إغلاق النافذة"></div>
      <div className={styles.modalMainContainer} role="dialog" aria-modal="true" aria-label="تسجيل الدخول">
        <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>تسجيل الدخول</h5>
              <button type="button" className={styles.btnClose} onClick={onClose} aria-label="إغلاق">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.stepContent}>
                {errorMessage && (
                  <div className="alert alert-danger" role="alert" aria-label="رسالة خطأ">
                    {errorMessage}
                  </div>
                )}
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="البريد الإلكتروني"
                    aria-label="البريد الإلكتروني"
                  />
                  <label htmlFor="email">البريد الإلكتروني</label>
                  {emailTouched && !isEmailValid() && (
                    <div className="text-danger" aria-label="البريد الإلكتروني غير صحيح">
                      البريد الإلكتروني غير صحيح
                    </div>
                  )}
                </div>
                <div className="form-floating mb-3">
                  <div className={styles.passwordInputContainer}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setPasswordTouched(true)}
                      placeholder="كلمة السر"
                      aria-label="كلمة السر"
                    />
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={togglePasswordVisibility}
                      aria-label="إظهار/إخفاء كلمة السر"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {passwordTouched && !isPasswordValid() && (
                    <div className="text-danger" aria-label="كلمة السر يجب أن تكون 8 أحرف على الأقل">
                      كلمة السر يجب أن تكون 8 أحرف على الأقل
                    </div>
                  )}
                  <div className={styles.forgotPassword}>
                    <a onClick={onOpenForgetPassword} style={{ cursor: 'pointer' }} aria-label="هل نسيت كلمة المرور؟">
                      هل نسيت كلمة المرور؟
                    </a>
                  </div>
                </div>
                <button
                  className={`btn btn-success w-100 ${styles.submitBtn}`}
                  onClick={handleSubmit}
                  disabled={!canSubmit() || isLoading}
                  aria-label="تسجيل دخول"
                >
                  {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل دخول'}
                </button>
                <div className={styles.registerLink}>
                  لا يوجد لديك حساب؟{' '}
                  <a onClick={onOpenRegister} style={{ cursor: 'pointer' }} aria-label="إنشاء حساب">
                    إنشاء حساب
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


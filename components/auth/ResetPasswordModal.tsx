'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { showToast } from '@/lib/utils/toast';
import styles from './AuthModal.module.css';

interface ResetPasswordModalProps {
  onClose: () => void;
  onOpenLogin: () => void;
  email?: string;
  token?: string;
}

export default function ResetPasswordModal({ onClose, onOpenLogin, email: propEmail = '', token: propToken = '' }: ResetPasswordModalProps) {
  const { resetPassword } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Get email and token from URL if not provided as props
  const [email, setEmail] = useState(propEmail);
  const [token, setToken] = useState(propToken);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (!email) setEmail(urlParams.get('email') || '');
      if (!token) setToken(urlParams.get('token') || '');
    }
  }, []);

  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const passwordRequirements = {
    hasLength: password?.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const passwordStrength = (): number => {
    const metCount = Object.values(passwordRequirements).filter(Boolean).length;
    return Math.min(Math.floor((metCount / 4) * 100), 100);
  };

  const isFormValid = (): boolean => {
    return (
      Object.values(passwordRequirements).every(Boolean) &&
      password === confirmPassword &&
      password.trim() !== ''
    );
  };

  const handleChangePassword = async () => {
    setSubmitted(true);
    setErrorMessage('');

    if (!isFormValid()) {
      setErrorMessage('كلمة السر يجب أن تحتوي على الأقل 8 أحرف، حرف كبير، حرف صغير، رقم');
      return;
    }

    setIsLoading(true);

    try {
      const identifierName = email || propEmail;
      const resetToken = token || propToken;
      const response = await resetPassword(identifierName, resetToken, password);
      if (response?.IsSuccess) {
        showToast('تم تغيير كلمة السر بنجاح!', 'success');
        setCurrentStep(2);
      } else {
        setErrorMessage(response?.Error || 'فشل تغيير كلمة السر');
        showToast(response?.Error || 'فشل تغيير كلمة السر', 'error');
      }
    } catch (error: any) {
      setErrorMessage(error?.message || 'حدث خطأ غير متوقع');
      showToast(error?.message || 'حدث خطأ غير متوقع', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.modalBackdrop} onClick={onClose} aria-label="إغلاق النافذة"></div>
      <div className={styles.modalMainContainer} role="dialog" aria-modal="true" aria-label="تعيين كلمة المرور">
        <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>تعيين كلمة المرور</h5>
              <button type="button" className={styles.btnClose} onClick={onClose} aria-label="إغلاق">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {currentStep === 1 && (
                <div className={styles.stepContent}>
                  <div className="form-floating mb-3">
                    <div className={styles.passwordInputContainer}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="registerPassword"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="كلمة السر"
                        aria-label="كلمة السر"
                      />
                      <button
                        type="button"
                        className={styles.togglePassword}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="إظهار/إخفاء كلمة السر"
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <div className={`${styles.passwordRequirements} text-muted small`}>
                      <div className={styles.passwordStrengthMeter + ' mb-2'}>
                        <div className={styles.strengthBar} style={{ width: `${passwordStrength()}%` }}></div>
                      </div>
                      <ul>
                        <li style={{ color: passwordRequirements.hasLength ? '#28a745' : '#6c757d' }}>
                          8 أحرف على الأقل
                        </li>
                        <li style={{ color: passwordRequirements.hasUpperCase ? '#28a745' : '#6c757d' }}>
                          حرف كبير واحد على الأقل
                        </li>
                        <li style={{ color: passwordRequirements.hasLowerCase ? '#28a745' : '#6c757d' }}>
                          حرف صغير واحد على الأقل
                        </li>
                        <li style={{ color: passwordRequirements.hasNumber ? '#28a745' : '#6c757d' }}>
                          رقم واحد على الأقل
                        </li>
                      </ul>
                    </div>
                    {submitted && !password && <div className="text-danger">كلمة السر مطلوبة</div>}
                  </div>

                  <div className="form-floating mb-3">
                    <div className={styles.passwordInputContainer}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmRegisterPassword"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="تأكيد كلمة السر"
                        aria-label="تأكيد كلمة السر"
                      />
                      <button
                        type="button"
                        className={styles.togglePassword}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="إظهار/إخفاء تأكيد كلمة السر"
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {password !== confirmPassword && <div className="text-danger">تأكيد كلمة السر غير متطابق</div>}
                  </div>

                  {errorMessage && <div className="text-danger text-center mt-2">{errorMessage}</div>}

                  {!errorMessage || errorMessage === '' ? (
                    <div className="d-grid gap-2">
                      <button
                        type="button"
                        className="btn btn-success w-100"
                        disabled={!isFormValid() || isLoading}
                        onClick={handleChangePassword}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            جاري الحفظ...
                          </>
                        ) : (
                          'حفظ'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="d-grid gap-2">
                      <button className="btn btn-success w-100" onClick={onOpenLogin}>
                        الذهاب لتسجيل الدخول
                      </button>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 2 && (
                <div className={styles.stepContent}>
                  <div className={styles.successContainer}>
                    <div className={styles.successIcon}>
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h4 className={styles.successTitle}>تم تعيين كلمة المرور بنجاح</h4>
                  </div>
                  <button className="btn btn-success w-100" onClick={onOpenLogin} aria-label="الذهاب لتسجيل الدخول">
                    الذهاب لتسجيل الدخول
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


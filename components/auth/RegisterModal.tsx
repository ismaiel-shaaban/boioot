'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { membershipService } from '@/lib/services/membership';
import { showToast } from '@/lib/utils/toast';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import styles from './AuthModal.module.css';

interface RegisterModalProps {
  onClose: () => void;
  onOpenLogin: () => void;
}

export default function RegisterModal({ onClose, onOpenLogin }: RegisterModalProps) {
  const { register, sendPhoneVerification, verifyOTP } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberInvalid, setPhoneNumberInvalid] = useState(false);
  const [verificationDigits, setVerificationDigits] = useState<string[]>(Array(6).fill(''));
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [membershipTypes, setMembershipTypes] = useState<any[]>([
    { Name: 'مالك', Id: '0' },
    { Name: 'باحث عقاري', Id: '1' },
    { Name: 'شركة عقارية', Id: '2' },
    { Name: 'مسوق', Id: '3' },
  ]);

  const [accountType, setAccountType] = useState<string>('0');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    getMembershipTypes();
  }, []);

  useEffect(() => {
    if (membershipTypes.length > 0) {
      setAccountType(membershipTypes[0]?.Id);
    }
  }, [membershipTypes]);

  useEffect(() => {
    if (currentStep === 2 && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [currentStep]);

  const getMembershipTypes = async () => {
    try {
      const response = await membershipService.getMembershipTypes();
      if (response?.Success) {
        setMembershipTypes(response?.Data as any[]);
        setAccountType((response?.Data as any[])[0]?.Id);
      }
    } catch (error) {
      console.error('Error fetching membership types:', error);
    }
  };

  const validatePhoneNumber = () => {
    const isValid = isPhoneValid();
    setPhoneNumberInvalid(!!(phoneNumber && !isValid));
    if (phoneNumberInvalid) {
      setErrorMessage('يرجى إدخال رقم الهاتف صحيح');
    } else {
      setErrorMessage('');
    }
  };

  const isPhoneValid = (): boolean => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      return false;
    }
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const saudiRegex = /^966\d{9}$/;
    const egyptianRegex = /^20\d{10}$/;
    const localSaudiRegex = /^\d{9}$/;
    const localEgyptianRegex = /^\d{10}$/;
    const generalRegex = /^\d{9,11}$/;

    return (
      saudiRegex.test(cleanNumber) ||
      egyptianRegex.test(cleanNumber) ||
      localSaudiRegex.test(cleanNumber) ||
      localEgyptianRegex.test(cleanNumber) ||
      generalRegex.test(cleanNumber)
    );
  };

  const isEmailValid = (): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isVerificationCodeValid = (): boolean => {
    return verificationDigits.every((d) => /^\d$/.test(d));
  };

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
      isPhoneValid() &&
      isEmailValid() &&
      Object.values(passwordRequirements).every(Boolean) &&
      password === confirmPassword &&
      fullName.trim() !== '' &&
      email.trim() !== ''
    );
  };

  const handleNextStep = async () => {
    setSubmitted(true);
    setErrorMessage('');

    if (currentStep === 1) {
      if (!isEmailValid()) return;

      setIsLoading(true);
      try {
        const response = await sendPhoneVerification(email);
        if (response?.IsSuccess) {
          setCurrentStep(2);
        } else {
          setCurrentStep(2);
          showToast(response?.Error || 'حدث خطأ', 'error');
        }
      } catch (error: any) {
        setErrorMessage(error?.Error || 'حدث خطأ أثناء إرسال الكود');
      } finally {
        setIsLoading(false);
      }
    } else if (currentStep === 2) {
      if (!isVerificationCodeValid()) return;

      setIsLoading(true);
      try {
        const response = await verifyOTP(email, verificationDigits.join(''));
        if (response?.IsSuccess) {
          setCurrentStep(3);
        } else {
          showToast(response?.Error || 'فشل التحقق من الكود', 'error');
        }
      } catch (error: any) {
        setErrorMessage(error?.Error || 'فشل التحقق من الكود');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setErrorMessage('');

    if (!isFormValid()) {
      setErrorMessage('كلمة السر يجب أن تحتوي على الأقل 8 أحرف، حرف كبير، حرف صغير، رقم');
      return;
    }

    setIsLoading(true);
    try {
      const response = await register(phoneNumber, fullName, email, password, accountType);
      if (response?.IsSuccess) {
        showToast(response?.Message || 'تم إنشاء الحساب بنجاح', 'success');
        setCurrentStep(4);
      } else {
        onClose();
        showToast(response?.Error || 'فشل إنشاء الحساب', 'error');
      }
    } catch (error: any) {
      onClose();
      showToast(error?.message || 'حدث خطأ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInput = (event: any, index: number) => {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 1) {
      const chars = value.split('');
      const newDigits = [...verificationDigits];
      for (let i = 0; i < chars.length && index + i < verificationDigits.length; i++) {
        newDigits[index + i] = chars[i];
        if (inputRefs.current[index + i]) {
          inputRefs.current[index + i]!.value = chars[i];
        }
      }
      setVerificationDigits(newDigits);

      const nextIndex = Math.min(index + chars.length, verificationDigits.length - 1);
      inputRefs.current[nextIndex]?.focus();
    } else if (value) {
      const newDigits = [...verificationDigits];
      newDigits[index] = value;
      setVerificationDigits(newDigits);

      if (index < verificationDigits.length - 1) {
        setTimeout(() => {
          inputRefs.current[index + 1]?.focus();
        });
      }
    } else {
      const newDigits = [...verificationDigits];
      newDigits[index] = '';
      setVerificationDigits(newDigits);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace') {
      const newDigits = [...verificationDigits];
      newDigits[index] = '';
      setVerificationDigits(newDigits);

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <>
      <div className={styles.modalBackdrop} onClick={onClose} aria-label="إغلاق النافذة"></div>
      <div className={styles.modalMainContainer} role="dialog" aria-modal="true" aria-label="تسجيل حساب جديد">
        <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle2}>إنشاء حساب</h5>
              <button type="button" className={styles.btnClose} onClick={onClose} aria-label="إغلاق">
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {currentStep === 1 && (
                <div className={styles.stepContent}>
                  <div className={`${styles.accountTypes} d-flex flex-column gap-3 mb-4`} aria-label="اختيار نوع الحساب">
                    <div className="d-flex justify-content-between gap-3">
                      <div className="row w-100">
                        {membershipTypes.map((membership) => (
                          <div key={membership.Id} className="col-md-6 col-12">
                            <button
                              type="button"
                              className={`${styles.accountTypePill} w-100 mt-3 ${accountType === membership.Id ? styles.active : ''}`}
                              onClick={() => setAccountType(membership.Id)}
                              aria-label="اختيار نوع الحساب"
                            >
                              {membership.Name}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      id="fullName"
                      className="form-control"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="اسم المستخدم"
                      aria-label="اسم المستخدم"
                    />
                    <label htmlFor="fullName">اسم المستخدم</label>
                    {submitted && !fullName && <div className="text-danger">الاسم مطلوب</div>}
                  </div>

                  <div className="form-floating mb-3">
                    <div className="phone-number-input-class width-95">
                      <PhoneInput
                        international
                        defaultCountry="SA"
                        value={phoneNumber}
                        onChange={(value) => {
                          setPhoneNumber(value || '');
                          validatePhoneNumber();
                        }}
                        className={phoneNumberInvalid ? 'is-invalid' : ''}
                      />
                      {phoneNumberInvalid && (
                        <div className="invalid-feedback" role="alert">
                          رقم الهاتف غير صحيح
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      id="registerEmail"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="البريد الإلكتروني"
                      aria-label="البريد الإلكتروني"
                    />
                    <label htmlFor="registerEmail">البريد الإلكتروني</label>
                    {submitted && !email && <div className="text-danger">البريد مطلوب</div>}
                    {submitted && email && !isEmailValid() && <div className="text-danger">البريد غير صحيح</div>}
                  </div>

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
                        <li className={passwordRequirements.hasLength ? 'text-success' : ''}>8 أحرف على الأقل</li>
                        <li className={passwordRequirements.hasUpperCase ? 'text-success' : ''}>
                          حرف كبير واحد على الأقل
                        </li>
                        <li className={passwordRequirements.hasLowerCase ? 'text-success' : ''}>
                          حرف صغير واحد على الأقل
                        </li>
                        <li className={passwordRequirements.hasNumber ? 'text-success' : ''}>رقم واحد على الأقل</li>
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

                  <button
                    className="btn btn-success w-100"
                    onClick={handleSubmit}
                    disabled={!isFormValid() || isLoading}
                    aria-label="إرسال التسجيل"
                  >
                    {isLoading ? 'جاري الإرسال...' : 'إرسال'}
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className={styles.stepContent}>
                  <p className={styles.instructionText}>أدخل رمز التحقق المرسل إلى بريدك الإلكتروني</p>
                  <div className={styles.verificationCodeContainer}>
                    {verificationDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          if (el) {
                            inputRefs.current[index] = el;
                          }
                        }}
                        type="text"
                        className={styles.verificationCodeInput}
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleInput(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        aria-label={`رمز التحقق ${index + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    className="btn btn-success w-100"
                    onClick={handleNextStep}
                    disabled={!isVerificationCodeValid() || isLoading}
                  >
                    {isLoading ? 'جاري التحقق...' : 'تحقق'}
                  </button>
                </div>
              )}

              {currentStep === 3 && (
                <div className={styles.stepContent}>
                  <div className={styles.successContainer}>
                    <div className={styles.successIcon}>
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h4 className={styles.successTitle}>تم التحقق من البريد الإلكتروني</h4>
                    <button className="btn btn-success w-100 mt-3" onClick={handleSubmit} disabled={isLoading}>
                      {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className={styles.stepContent}>
                  <div className={styles.successContainer}>
                    <div className={styles.successIcon}>
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <h4 className={styles.successTitle}>تم انشاء حسابك</h4>
                  </div>
                  <button className="btn btn-success w-100" onClick={onOpenLogin} aria-label="تسجيل الدخول">
                    تسجيل الدخول
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


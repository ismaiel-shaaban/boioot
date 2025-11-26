'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { userService } from '@/lib/services/user';
import { showToast } from '@/lib/utils/toast';
import { useRouter } from 'next/navigation';
import styles from './PasswordChange.module.css';

export default function PasswordChange() {
  const router = useRouter();
  const { logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const passwordRequirements = useMemo(() => ({
    hasLength: newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasLowerCase: /[a-z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
  }), [newPassword]);

  const requirementsMet = useMemo(() => Object.values(passwordRequirements).filter(Boolean).length, [passwordRequirements]);

  useEffect(() => {
    setPasswordStrength((requirementsMet / 4) * 100);
  }, [requirementsMet]);

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setSubmitted(false);
    setPasswordStrength(0);
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);

    if (!oldPassword) {
      showToast('يرجى إدخال كلمة المرور القديمة', 'error');
      return;
    }

    if (!newPassword || !confirmPassword) {
      showToast('يرجى إدخال وتأكيد كلمة المرور الجديدة', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتين', 'error');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      showToast('يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، وحرف كبير واحد، وحرف صغير واحد، ورقم واحد على الأقل', 'error');
      return;
    }

    try {
      const response = await userService.changePassword(oldPassword, newPassword);
      if (response?.IsSuccess) {
        setSubmitted(false);
        resetForm();
        showToast('تم تغيير كلمة المرور بنجاح', 'success');
        
        setTimeout(() => {
          logout();
          router.push('/');
        }, 2000);
      } else {
        showToast(response?.Error || 'فشل في تغيير كلمة المرور', 'error');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      showToast('فشل في تغيير كلمة المرور', 'error');
    }
  };

  const isPasswordValid =
    passwordRequirements.hasLength &&
    passwordRequirements.hasUpperCase &&
    passwordRequirements.hasLowerCase &&
    passwordRequirements.hasNumber;

  const isFormValid =
    oldPassword &&
    newPassword &&
    confirmPassword &&
    newPassword === confirmPassword &&
    isPasswordValid;

  return (
    <div className={styles.passwordChangeTab}>
      <h3 className={styles.sectionTitle}>تغيير كلمة المرور</h3>

      <form onSubmit={changePassword} className={styles.formContainer}>
        <div className={`${styles.formFloating} form-floating mb-3`}>
          <input
            type={showOldPassword ? 'text' : 'password'}
            className="form-control"
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="كلمة المرور القديمة"
            aria-label="كلمة المرور القديمة"
          />
          <label htmlFor="oldPassword">كلمة المرور القديمة</label>
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowOldPassword(!showOldPassword)}
            aria-label="إظهار أو إخفاء كلمة المرور القديمة"
          >
            <i className={`fas ${showOldPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
          {submitted && !oldPassword && (
            <div className="text-danger mt-2">كلمة المرور القديمة مطلوبة</div>
          )}
        </div>

        <div className={`${styles.formFloating} form-floating mb-3`}>
          <input
            type={showNewPassword ? 'text' : 'password'}
            className="form-control"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="كلمة المرور الجديدة"
            aria-label="كلمة المرور الجديدة"
          />
          <label htmlFor="newPassword">كلمة المرور الجديدة</label>
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowNewPassword(!showNewPassword)}
            aria-label="إظهار أو إخفاء كلمة المرور الجديدة"
          >
            <i className={`fas ${showNewPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>

          <div className={styles.passwordRequirements}>
            <div className={styles.passwordStrengthMeter}>
              <div
                className={styles.strengthBar}
                style={{ width: `${passwordStrength}%` }}
              ></div>
            </div>
            <ul>
              <li className={passwordRequirements.hasLength ? styles.met : ''}>
                8 أحرف على الأقل
              </li>
              <li className={passwordRequirements.hasUpperCase ? styles.met : ''}>
                حرف كبير واحد على الأقل
              </li>
              <li className={passwordRequirements.hasLowerCase ? styles.met : ''}>
                حرف صغير واحد على الأقل
              </li>
              <li className={passwordRequirements.hasNumber ? styles.met : ''}>
                رقم واحد على الأقل
              </li>
            </ul>
          </div>

          {submitted && !newPassword && (
            <div className="text-danger mt-2">كلمة المرور الجديدة مطلوبة</div>
          )}
        </div>

        <div className={`${styles.formFloating} form-floating mb-3`}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="تأكيد كلمة المرور الجديدة"
            aria-label="تأكيد كلمة المرور الجديدة"
          />
          <label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</label>
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label="إظهار أو إخفاء تأكيد كلمة المرور"
          >
            <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
          {confirmPassword && newPassword !== confirmPassword && (
            <div className="text-danger mt-2">تأكيد كلمة المرور غير متطابق</div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="submit"
            className={`btn ${styles.btnSave}`}
            disabled={!isFormValid || submitted}
          >
            {submitted ? 'جاري التغيير...' : 'حفظ'}
          </button>
          <button
            type="button"
            className={`btn ${styles.btnCancel}`}
            onClick={resetForm}
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}


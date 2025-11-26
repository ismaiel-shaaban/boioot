'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import styles from './AuthModal.module.css';

interface AuthDropdownProps {
  onClose?: () => void;
}

export default function AuthDropdown({ onClose }: AuthDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, hasRealEstateCompanyRole } = useAuth();
  const [companyRole, setCompanyRole] = useState(false);

  useEffect(() => {
    setCompanyRole(hasRealEstateCompanyRole());
  }, [hasRealEstateCompanyRole]);

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
    router.push('/');
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const goToProfile = () => {
    if (onClose) onClose();
    router.push('/profile');
  };

  const goToCompanyProfile = () => {
    if (onClose) onClose();
    router.push('/company-profile');
  };

  return (
    <div className={styles.authDropdown}>
      {!companyRole && (
        <div className={styles.dropdownItem} onClick={goToProfile}>
          <i className="fas fa-user"></i>
          <span>الملف الشخصي</span>
        </div>
      )}

      {companyRole && (
        <div className={styles.dropdownItem} onClick={goToCompanyProfile}>
          <i className="fas fa-building"></i>
          <span>ملف الشركة</span>
        </div>
      )}

      <div className={styles.dropdownItem} onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i>
        <span>تسجيل الخروج</span>
      </div>
    </div>
  );
}


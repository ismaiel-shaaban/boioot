'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { showToast } from '@/lib/utils/toast';
import { notificationService } from '@/lib/services/notification';
import { favoritesService } from '@/lib/services/favorites';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import ForgetPasswordModal from '@/components/auth/ForgetPasswordModal';
import ResetPasswordModal from '@/components/auth/ResetPasswordModal';
import AuthDropdown from '@/components/auth/AuthDropdown';
import NotificationDropdown from '@/components/shared/notification-dropdown/NotificationDropdown';
import FavoritesDropdown from '@/components/shared/favorites-dropdown/FavoritesDropdown';
import styles from './TopNav.module.css';

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, logout, getUserProfile } = useAuth();
  
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgetPasswordModal, setShowForgetPasswordModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({ email: '', token: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isFavoritesDropdownOpen, setIsFavoritesDropdownOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const favoritesDropdownRef = useRef<HTMLDivElement>(null);
  const authDropdownRef = useRef<HTMLDivElement>(null);

  // Route checks
  const isHomeRoute = pathname === '/' || pathname === '/home' || pathname === '/daily-rent' || pathname === '/special-order';
  const isProjectsRoute = pathname === '/projects';
  const isAddProjectRoute = pathname === '/add-project';
  const isAddRequestRoute = pathname === '/special-request';
  const isAddAdRoute = pathname === '/add-advertistment';
  const isAddRentRoute = pathname === '/add-daily-rent';
  const isAddDetailsRoute = pathname?.includes('/ad-details/');
  const isProfileRoute = pathname === '/profile';
  const isCompanyProfileRoute = pathname === '/company-profile';
  const isCommunityRoute = pathname === '/community';
  const isBlogRoute = pathname === '/blogs';
  const isListBlogRoute = pathname?.includes('/list-blogs/');
  const isBlogDetailsRoute = pathname?.includes('/post-details/');
  const isUserPostsListRoute = pathname?.includes('/user-posts-list/');

  useEffect(() => {
    // Check for reset password query params
    const email = searchParams?.get('email');
    const token = searchParams?.get('token');
    
    if (email && token && pathname?.includes('identity/reset-password')) {
      setResetPasswordData({ email, token });
      setShowResetPasswordModal(true);
    }

    // Check for redirect parameter - if user is authenticated and there's a redirect, navigate to it
    const redirectParam = searchParams?.get('redirect');
    if (redirectParam && isAuthenticated && pathname === '/') {
      // Clear the redirect parameter and navigate
      router.replace(redirectParam);
    } else if (redirectParam && !isAuthenticated && pathname === '/' && !showLoginModal) {
      // Open login modal if not authenticated and there's a redirect parameter
      setShowLoginModal(true);
    }

    // Load user profile
    if (isAuthenticated) {
      loadUserProfile();
      getInitialUnreadCount();
      getInitialFavoritesCount();
    } else {
      setUnreadNotificationCount(0);
      setFavoritesCount(0);
    }
  }, [isAuthenticated, pathname, searchParams]);


  const openLoginModal = () => {
    // Preserve redirect parameter if it exists
    const redirectParam = searchParams?.get('redirect');
    if (redirectParam) {
      router.push(`/?redirect=${encodeURIComponent(redirectParam)}`);
    }
    setShowLoginModal(true);
    setShowRegisterModal(false);
    setShowResetPasswordModal(false);
    setShowForgetPasswordModal(false);
    setIsAuthDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const openRegisterModal = () => {
    setShowRegisterModal(true);
    setShowLoginModal(false);
    setShowResetPasswordModal(false);
    setShowForgetPasswordModal(false);
    setIsAuthDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const openForgetPasswordModal = () => {
    setShowForgetPasswordModal(true);
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowResetPasswordModal(false);
    setIsAuthDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const closeAllModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setShowForgetPasswordModal(false);
    setShowResetPasswordModal(false);
  };

  const loadUserProfile = async () => {
    try {
      const response = await getUserProfile();
      if (response.IsSuccess || response.Success) {
        setProfileImageUrl(response.Data?.profileImageUrl || null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const getInitialUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadNotificationCount();
      if (response?.IsSuccess || response?.Success) {
        const count = typeof response?.Data === 'number' ? response.Data : 0;
        setUnreadNotificationCount(count);
      }
    } catch (error) {
      console.error('Error fetching initial unread count:', error);
    }
  };

  const getInitialFavoritesCount = async () => {
    try {
      const response = await favoritesService.getFavorites({});
      if (response?.IsSuccess || response?.Success) {
        // Count total favorites from all types
        interface FavoritesData {
          Ads?: any[];
          Projects?: any[];
          DailyRentUnits?: any[];
          SpecialOrders?: any[];
          Units?: any[];
        }
        const data = (response?.Data as FavoritesData) || {};
        const totalCount = (data.Ads?.length || 0) + 
                          (data.Projects?.length || 0) + 
                          (data.DailyRentUnits?.length || 0) + 
                          (data.SpecialOrders?.length || 0) + 
                          (data.Units?.length || 0);
        setFavoritesCount(totalCount);
      }
    } catch (error) {
      console.error('Error fetching initial favorites count:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationDropdownOpen(false);
      }
      if (favoritesDropdownRef.current && !favoritesDropdownRef.current.contains(event.target as Node)) {
        setIsFavoritesDropdownOpen(false);
      }
      if (
        authDropdownRef.current &&
        !authDropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(`.${styles.userAvatar}`)
      ) {
        setIsAuthDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsOpen2(false);
      setIsNotificationDropdownOpen(false);
      setIsFavoritesDropdownOpen(false);
      setIsAuthDropdownOpen(false);
    }
  };

  const toggleDropdown2 = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen2(!isOpen2);
    if (!isOpen2) {
      setIsOpen(false);
      setIsNotificationDropdownOpen(false);
      setIsFavoritesDropdownOpen(false);
      setIsAuthDropdownOpen(false);
    }
  };

  const goToAd = () => {
    setIsOpen(false);
    if (isAuthenticated) {
      router.push('/add-advertistment');
    } else {
      setIsOpen(false);
      router.push(`/?redirect=${encodeURIComponent('/add-advertistment')}`);
      setTimeout(() => {
        setShowLoginModal(true);
      }, 100);
    }
  };

  const goToDailyRent = () => {
    setIsOpen(false);
    if (isAuthenticated) {
      router.push('/add-daily-rent');
    } else {
      setIsOpen(false);
      router.push(`/?redirect=${encodeURIComponent('/add-daily-rent')}`);
      setTimeout(() => {
        setShowLoginModal(true);
      }, 100);
    }
  };

  const goToSpecialOrder = () => {
    setIsOpen2(false);
    if (isAuthenticated) {
      router.push('/add-special-order');
    } else {
      setIsOpen2(false);
      router.push(`/?redirect=${encodeURIComponent('/add-special-order')}`);
      setTimeout(() => {
        setShowLoginModal(true);
      }, 100);
    }
  };

  const goToAddRequest = () => {
    setIsOpen2(false);
    if (isAuthenticated) {
      router.push('/add-request');
    } else {
      setIsOpen2(false);
      router.push(`/?redirect=${encodeURIComponent('/add-request')}`);
      setTimeout(() => {
        setShowLoginModal(true);
      }, 100);
    }
  };

  const hasRealEstateCompanyRole = (): boolean => {
    if (!user) return false;
    const role = user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return role === 'RealEstateCompany';
  };

  return (
    <div className={styles.topNavContainer} role="navigation" aria-label="شريط التنقل العلوي">
      <div className="container">
        <div className={styles.topNav}>
          {/* Logo */}
          <div className={styles.logo}>
            <Link href="/" aria-label="الصفحة الرئيسية">
              <img
                src="/assets/images/Boioot-logoo.png"
                alt="Logo"
                className={styles.logoImg}
                loading="eager"
                aria-label="شعار الموقع"
                style={{ display: 'block' }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className={styles.desktopActions}>
            <div className={styles.navLinks}>
              {!isHomeRoute && (
                <Link href="/" className="btn btn-success">
                  الرئيسية
                </Link>
              )}

              {((!isProjectsRoute && !isAddProjectRoute && !isAddDetailsRoute &&
                !isCommunityRoute && !isListBlogRoute && !isBlogDetailsRoute &&
                !isUserPostsListRoute) || isCompanyProfileRoute || isProfileRoute) && (
                <a
                  className="btn btn-success"
                  onClick={toggleDropdown2}
                  style={{ cursor: 'pointer' }}
                >
                  أضف طلب
                </a>
              )}

              {isOpen2 && (
                <div className={styles.dropdownWrapper} onClick={() => setIsOpen2(false)}>
                  <div className={styles.customDropdown} ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
                    <a onClick={goToSpecialOrder} className={`${styles.dropdownItem} ${styles.customCard} ${styles.greenCard} mt-2`} style={{ cursor: 'pointer' }}>
                      <div className={`${styles.iconCircle} ${styles.green}`}>
                        <span className={styles.plusIcon}>+</span>
                      </div>
                      <div className={styles.itemContent}>
                        <span className={`${styles.itemTitle} ${styles.greenTitle}`}>طلب تسويق عقار</span>
                        <span className={styles.itemSubtext}>يتطلب إرفاق رخصة العقار</span>
                      </div>
                    </a>
                    <a onClick={goToAddRequest} className={`${styles.dropdownItem} ${styles.customCard} ${styles.greenCard} mt-2`} style={{ cursor: 'pointer' }}>
                      <div className={`${styles.iconCircle} ${styles.green}`}>
                        <span className={styles.plusIcon}>+</span>
                      </div>
                      <div className={styles.itemContent}>
                        <span className={`${styles.itemTitle} ${styles.greenTitle}`}>طلب عقار</span>
                      </div>
                    </a>
                  </div>
                </div>
              )}

              {!isAddAdRoute && !isAddRentRoute && (
                <a className="btn btn-success" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                  أضف إعلانك
                </a>
              )}

              {isOpen && (
                <div className={styles.dropdownWrapper} onClick={() => setIsOpen(false)}>
                  <div className={styles.customDropdown} ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
                    <a onClick={goToAd} className={`${styles.dropdownItem} ${styles.customCard} ${styles.greenCard} mt-2`} style={{ cursor: 'pointer' }}>
                      <div className={`${styles.iconCircle} ${styles.green}`}>
                        <span className={styles.plusIcon}>+</span>
                      </div>
                      <div className={styles.itemContent}>
                        <span className={`${styles.itemTitle} ${styles.greenTitle}`}>إعلان عن عقار من مالك أو وكيل</span>
                        <span className={styles.itemSubtext}>يتطلب إرفاق رخصة العقار</span>
                      </div>
                    </a>
                    <a onClick={goToDailyRent} className={`${styles.dropdownItem} ${styles.customCard} ${styles.blueCard} mt-2`} style={{ cursor: 'pointer' }}>
                      <div className={`${styles.iconCircle} ${styles.blue}`}>
                        <span className={styles.plusIcon}>+</span>
                      </div>
                      <div className={styles.itemContent}>
                        <span className={`${styles.itemTitle} ${styles.blueTitle}`}>إعلان عن تأجير يومي</span>
                        <span className={styles.itemSubtext}>يتطلب إرفاق رخصة العقار</span>
                      </div>
                    </a>
                  </div>
                </div>
              )}

              {isAuthenticated && isProjectsRoute && !isAddDetailsRoute && !isProfileRoute && !isCompanyProfileRoute && !isCommunityRoute && !isListBlogRoute && hasRealEstateCompanyRole() && (
                <Link href="/add-project" className="btn btn-primary">
                  أضف مشروع
                </Link>
              )}

              {isAuthenticated && !isProjectsRoute && !isAddProjectRoute && !isAddDetailsRoute && !isProfileRoute && !isCompanyProfileRoute && !isHomeRoute && (
                <Link href="/profile?tab=add-post" className="btn btn-primary">
                  أضف مشاركة
                </Link>
              )}

              {isAuthenticated && !isProjectsRoute && !isAddProjectRoute && !isAddDetailsRoute && !isProfileRoute && !isCompanyProfileRoute && !isCommunityRoute && !isListBlogRoute && !isBlogDetailsRoute && !isUserPostsListRoute && (
                <Link href="/projects" className="btn btn-primary">
                  المشاريع العقارية
                </Link>
              )}
            </div>

            <div className={styles.navIcons}>
              {isAuthenticated && (
                <>
                  <div className={styles.notificationContainer}>
                    <button
                      className={styles.notificationBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
                        setIsOpen(false);
                        setIsOpen2(false);
                        setIsAuthDropdownOpen(false);
                        setIsFavoritesDropdownOpen(false);
                      }}
                      aria-label="عرض الإشعارات"
                    >
                      <i className="fa-solid fa-bell"></i>
                    </button>
                    {unreadNotificationCount > 0 && (
                      <div className={styles.notificationBadge}>{unreadNotificationCount}</div>
                    )}
                    <div ref={notificationDropdownRef}>
                      <NotificationDropdown
                        isOpen={isNotificationDropdownOpen}
                        onClose={() => {
                          setIsNotificationDropdownOpen(false);
                          getInitialUnreadCount();
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.favoritesContainer}>
                    <button
                      className={styles.favoriteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFavoritesDropdownOpen(!isFavoritesDropdownOpen);
                        setIsNotificationDropdownOpen(false);
                        setIsAuthDropdownOpen(false);
                      }}
                      aria-label="عرض المفضلة"
                    >
                      {favoritesCount > 0 && (
                        <div className={styles.favoritesBadge}>{favoritesCount}</div>
                      )}
                      <i className="fa-solid fa-heart"></i>
                    </button>
                    <div ref={favoritesDropdownRef}>
                      <FavoritesDropdown
                        isOpen={isFavoritesDropdownOpen}
                        onClose={() => setIsFavoritesDropdownOpen(false)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className={`${styles.userDropdown} position-relative`} ref={authDropdownRef}>
                {!isAuthenticated ? (
                  <button className={styles.profileBtn} onClick={openLoginModal} aria-label="تسجيل الدخول">
                    <i className="fa-solid fa-user"></i>
                  </button>
                ) : (
                  <>
                    <img
                      src={profileImageUrl || '/assets/images/blank-profile.png'}
                      alt="صورة المستخدم"
                      className={styles.userAvatar}
                      loading="lazy"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsAuthDropdownOpen(!isAuthDropdownOpen);
                        setIsNotificationDropdownOpen(false);
                        setIsFavoritesDropdownOpen(false);
                        setIsOpen(false);
                        setIsOpen2(false);
                      }}
                      aria-label="الملف الشخصي"
                    />
                    {isAuthDropdownOpen && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <AuthDropdown onClose={() => setIsAuthDropdownOpen(false)} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Burger Menu Button */}
          <div className={styles.mobileMenuToggle}>
            <button
              className={`${styles.burgerBtn} ${isMobileMenuOpen ? styles.active : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="فتح القائمة الجانبية"
            >
              <span className={styles.burgerLine}></span>
              <span className={styles.burgerLine}></span>
              <span className={styles.burgerLine}></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.active : ''}`}>
          <div className={styles.mobileNavContent}>
            <div className={styles.mobileNavLinks}>
              {!isHomeRoute && (
                <Link href="/" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="fa-solid fa-house"></i>
                  <span>الرئيسية</span>
                </Link>
              )}

              {isAuthenticated && isProjectsRoute && !isAddDetailsRoute && !isProfileRoute && !isCompanyProfileRoute && !isCommunityRoute && !isListBlogRoute && hasRealEstateCompanyRole() && (
                <Link href="/add-project" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="fa-solid fa-plus"></i>
                  <span>أضف مشروع</span>
                </Link>
              )}

              {!isAddAdRoute && !isAddRentRoute && (
                <a className={styles.mobileNavLink} onClick={(e) => { e.stopPropagation(); toggleDropdown(e); }}>
                  <i className="fa-solid fa-plus"></i>
                  <span>أضف إعلانك</span>
                </a>
              )}
              {isOpen && (
                <div className={styles.mobileDropdownMenu}>
                  <a onClick={() => { goToAd(); setIsMobileMenuOpen(false); }} className={`${styles.dropdownItem} ${styles.customCard} ${styles.greenCard} mt-2`} style={{ cursor: 'pointer' }}>
                    <div className={`${styles.iconCircle} ${styles.green}`}>
                      <span className={styles.plusIcon}>+</span>
                    </div>
                    <div className={styles.itemContent}>
                      <span className={`${styles.itemTitle} ${styles.greenTitle}`}>إعلان عن عقار من مالك أو وكيل</span>
                      <span className={styles.itemSubtext}>يتطلب إرفاق رخصة العقار</span>
                    </div>
                  </a>
                  <a onClick={() => { goToDailyRent(); setIsMobileMenuOpen(false); }} className={`${styles.dropdownItem} ${styles.customCard} ${styles.blueCard} mt-2`} style={{ cursor: 'pointer' }}>
                    <div className={`${styles.iconCircle} ${styles.blue}`}>
                      <span className={styles.plusIcon}>+</span>
                    </div>
                    <div className={styles.itemContent}>
                      <span className={`${styles.itemTitle} ${styles.blueTitle}`}>إعلان عن تأجير يومي</span>
                      <span className={styles.itemSubtext}>يتطلب إرفاق رخصة العقار</span>
                    </div>
                  </a>
                </div>
              )}

              {isAuthenticated && !isProjectsRoute && !isAddProjectRoute && !isAddDetailsRoute && !isProfileRoute && !isCompanyProfileRoute && !isHomeRoute && (
                <Link href="/profile?tab=add-post" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="fa-solid fa-plus"></i>
                  <span>أضف مشاركة</span>
                </Link>
              )}

              {isAuthenticated && !isProjectsRoute && !isAddProjectRoute && !isAddDetailsRoute && !isProfileRoute && !isCompanyProfileRoute && !isCommunityRoute && !isListBlogRoute && !isBlogDetailsRoute && !isUserPostsListRoute && (
                <Link href="/projects" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="fa-solid fa-building"></i>
                  <span>المشاريع العقارية</span>
                </Link>
              )}

              {((!isProjectsRoute && !isAddProjectRoute && !isAddDetailsRoute && !isCommunityRoute && !isListBlogRoute && !isBlogDetailsRoute && !isUserPostsListRoute) || isCompanyProfileRoute || isProfileRoute) && (
                <a className={styles.mobileNavLink} onClick={(e) => { e.stopPropagation(); toggleDropdown2(e); }}>
                  <i className="fa-solid fa-plus"></i>
                  <span>أضف طلب</span>
                </a>
              )}
              {isOpen2 && (
                <div className={styles.mobileDropdownMenu}>
                  <a onClick={() => { goToSpecialOrder(); setIsMobileMenuOpen(false); }} className={`${styles.dropdownItem} ${styles.customCard} ${styles.greenCard} mt-2`} style={{ cursor: 'pointer' }}>
                    <div className={`${styles.iconCircle} ${styles.green}`}>
                      <span className={styles.plusIcon}>+</span>
                    </div>
                    <div className={styles.itemContent}>
                      <span className={`${styles.itemTitle} ${styles.greenTitle}`}>طلب تسويق عقار</span>
                      <span className={styles.itemSubtext}>يتطلب إرفاق رخصة العقار</span>
                    </div>
                  </a>
                  <a onClick={() => { goToAddRequest(); setIsMobileMenuOpen(false); }} className={`${styles.dropdownItem} ${styles.customCard} ${styles.greenCard} mt-2`} style={{ cursor: 'pointer' }}>
                    <div className={`${styles.iconCircle} ${styles.green}`}>
                      <span className={styles.plusIcon}>+</span>
                    </div>
                    <div className={styles.itemContent}>
                      <span className={`${styles.itemTitle} ${styles.greenTitle}`}>طلب عقار</span>
                    </div>
                  </a>
                </div>
              )}

              {/* Mobile Action Icons */}
              {isAuthenticated && (
                <div className={styles.mobileActionIcons}>
                  <button
                    className={`${styles.mobileIconBtn} ${styles.notificationBtn}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
                      setIsFavoritesDropdownOpen(false);
                      setIsAuthDropdownOpen(false);
                    }}
                  >
                    {unreadNotificationCount > 0 && (
                      <div className={styles.notificationBadge}>{unreadNotificationCount}</div>
                    )}
                    <i className="fa-solid fa-bell"></i>
                    <span>الإشعارات</span>
                  </button>
                  <div ref={notificationDropdownRef}>
                    <NotificationDropdown
                      isOpen={isNotificationDropdownOpen}
                      onClose={() => {
                        setIsNotificationDropdownOpen(false);
                        getInitialUnreadCount();
                      }}
                    />
                  </div>

                  <button
                    className={`${styles.mobileIconBtn} ${styles.favoriteBtn}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFavoritesDropdownOpen(!isFavoritesDropdownOpen);
                      setIsNotificationDropdownOpen(false);
                      setIsAuthDropdownOpen(false);
                    }}
                  >
                    {favoritesCount > 0 && (
                      <div className={styles.favoritesBadge}>{favoritesCount}</div>
                    )}
                    <i className="fa-solid fa-heart"></i>
                    <span>المفضلة</span>
                  </button>
                  <div ref={favoritesDropdownRef}>
                    <FavoritesDropdown
                      isOpen={isFavoritesDropdownOpen}
                      onClose={() => setIsFavoritesDropdownOpen(false)}
                    />
                  </div>
                </div>
              )}

              {/* Mobile User Section */}
              {isAuthenticated && (
                <div className={styles.mobileUserSection}>
                  <div className={styles.mobileUserInfo}>
                    <div
                      className={styles.mobileUserProfile}
                      onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)}
                      style={{ cursor: 'pointer' }}
                    >
                      <a className={`${styles.mobileNavLink} d-flex align-items-center justify-content-between`} style={{ cursor: 'pointer' }}>
                        <div className="d-flex align-items-center">
                          <img
                            src={profileImageUrl || '/assets/images/blank-profile.png'}
                            alt="User Profile Image"
                            height="35px"
                            width="35px"
                            loading="lazy"
                            className={`${styles.mobileUserAvatar} rounded`}
                          />
                          <span className="ms-2">الملف الشخصي</span>
                        </div>
                        <i className={`fa-solid fa-chevron-down ${isAuthDropdownOpen ? 'fa-chevron-up' : ''}`}></i>
                      </a>
                    </div>

                    {isAuthDropdownOpen && (
                      <div className={styles.mobileAuthDropdown} onClick={(e) => e.stopPropagation()}>
                        <AuthDropdown onClose={() => setIsAuthDropdownOpen(false)} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mobile Login Button - Not Logged In */}
              {!isAuthenticated && (
                <button className={styles.mobileLoginBtn} onClick={openLoginModal}>
                  <i className="fa-solid fa-user"></i>
                  <span>تسجيل الدخول</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.active : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      </div>

      {/* Auth Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={closeAllModals}
          onOpenRegister={openRegisterModal}
          onOpenForgetPassword={openForgetPasswordModal}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          onClose={closeAllModals}
          onOpenLogin={openLoginModal}
        />
      )}

      {showForgetPasswordModal && (
        <ForgetPasswordModal
          onClose={closeAllModals}
          onOpenLogin={openLoginModal}
        />
      )}

      {showResetPasswordModal && (
        <ResetPasswordModal
          onClose={closeAllModals}
          onOpenLogin={openLoginModal}
          email={resetPasswordData.email}
          token={resetPasswordData.token}
        />
      )}
    </div>
  );
}

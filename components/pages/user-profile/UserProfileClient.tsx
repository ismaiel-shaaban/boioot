'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { userService } from '@/lib/services/user';
import { showToast } from '@/lib/utils/toast';
import ProfileContent from './ProfileContent';
import styles from './UserProfileClient.module.css';

export default function UserProfileClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userData, setUserData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [phoneNumberInvalid, setPhoneNumberInvalid] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [emailRequiredMsg, setEmailRequiredMsg] = useState(false);
  const [emailInvalidMsg, setEmailInvalidMsg] = useState(false);
  const [userNameInvalid, setUserNameInvalid] = useState(false);
  const [userNameRequiredMsg, setUserNameRequiredMsg] = useState(false);
  const [userNameLengthMsg, setUserNameLengthMsg] = useState(false);
  const [companyRole, setCompanyRole] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const saudiPhoneRegex = /^(?:\+|00)?\d{11,15}$/;

  const [activeTab, setActiveTab] = useState('ads');

  useEffect(() => {
    getUserInfo();
    const role = getRole();
    // Match Angular: if company role, default to 'projects', otherwise 'ads'
    if (role) {
      setActiveTab('projects');
    } else {
      setActiveTab('ads');
    }

    const tab = searchParams?.get('tab');
    if (tab && tab === 'add-post') {
      setActiveTab('add-post');
    }
  }, [searchParams]);

  const getUserInfo = async () => {
    try {
      const response = await userService.getUserInfo();
      if (response?.IsSuccess) {
        // Match Angular's structure mapping
        const data = (response.Data || {}) as any;
        const userInfo = {
          id: data?.Id,
          name: data?.FullName,
          FullName: data?.FullName,
          phone: data?.PhoneNumber,
          membershipType: data?.RoleName,
          membershipTypeId: data?.RoleId,
          email: data?.Email,
          profileImage: data?.ProfileImageUrl,
          joinDate: data?.CreatedAt,
          isVerified: data?.IsVerified,
          ratingCount: data?.UserRate || 0,
          lastSeen: data?.LastSeen,
        };
        setUserData(userInfo);
        setEmail(userInfo.email || '');
        setFullName(userInfo.FullName || '');
        setPhoneNumber(userInfo.phone || '');
      }
    } catch (error: any) {
      console.error('Error fetching user info:', error);
      showToast('فشل في تحميل بيانات المستخدم', 'error');
    }
  };

  const getRole = (): boolean => {
    const hasRole = user?.roles?.includes('Company') || user?.roles?.includes('Developer');
    setCompanyRole(hasRole || false);
    return hasRole || false;
  };

  const openEditMode = () => {
    setEditMode(true);
  };

  const cancel = () => {
    // Reset to original values (matches Angular logic)
    setPhoneNumber(userData?.phone || '');
    setEmail(userData?.email || '');
    setFullName(userData?.FullName || '');
    setEditMode(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (userData) {
          setUserData({ ...userData, profileImage: e.target?.result });
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const updateEmail = () => {
    setEmailRequiredMsg(!email || email.trim() === '');
    setEmailInvalidMsg(Boolean(email && !emailRegex.test(email)));
    setEmailInvalid(!email || !emailRegex.test(email));
  };

  const updateUserName = () => {
    setUserNameRequiredMsg(!fullName || fullName.trim() === '');
    setUserNameLengthMsg(Boolean(fullName && fullName.trim().length < 3));
    setUserNameInvalid(!fullName || fullName.trim().length < 3);
  };

  const validatePhoneNumber = () => {
    if (phoneNumber && !saudiPhoneRegex.test(phoneNumber)) {
      setPhoneNumberInvalid(true);
    } else {
      setPhoneNumberInvalid(false);
    }
  };

  const saveProfile = async () => {
    updateEmail();
    updateUserName();
    validatePhoneNumber();

    if (emailRequiredMsg || emailInvalidMsg || userNameRequiredMsg || userNameLengthMsg || phoneNumberInvalid) {
      showToast('يرجى تصحيح الأخطاء قبل الحفظ', 'error');
      return;
    }

    // First, upload profile image if file exists (matches Angular logic)
    if (file) {
      try {
        const uploadResponse = await userService.uploadUserProfile(file);
        if (uploadResponse?.IsSuccess) {
          showToast('تم تحديث الصورة الشخصية بنجاح', 'success');
        } else {
          showToast(uploadResponse?.Error || 'فشل في تحديث الصورة الشخصية', 'error');
        }
      } catch (error: any) {
        showToast('فشل في تحديث الصورة الشخصية', 'error');
      }
    }

    // Format phone number (remove spaces)
    let formattedPhone = phoneNumber;
    if (phoneNumber) {
      formattedPhone = phoneNumber.replace(/\s+/g, '');
    }

    // Then update user profile (matches Angular logic with Request wrapper)
    if (!phoneNumberInvalid && !emailInvalid && !userNameInvalid) {
      try {
        const updateResponse = await userService.updateUserInfo({
          Request: {
            PhoneNumber: formattedPhone,
            FullName: fullName,
            Email: email,
          },
        });

        if (updateResponse?.IsSuccess) {
          setEditMode(false);
          showToast('تم تحديث الملف الشخصي بنجاح', 'success');
          getUserInfo();
        } else {
          showToast(updateResponse?.Error || 'فشل في تحديث الملف الشخصي', 'error');
        }
      } catch (error: any) {
        console.error('Error updating user info:', error);
        showToast('فشل في تحديث الملف الشخصي', 'error');
      }
    }
  };

  const getType = (type: string): string => {
    // Match Angular's getType function logic
    switch (type) {
      case 'Admin':
        return 'ادمن';
      case 'SuperAdmin':
        return 'ادمن';
      case 'RealEstateCompany':
        return 'شركه عقاريه';
      case 'RealEstateSeeker':
        return 'باحث عقاري';
      case 'Marketer':
        return 'مسوق';
      case 'Owner':
        return 'مالك';
      default:
        return 'غير معروف';
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.userProfilePage} aria-label="صفحة الملف الشخصي">
      {/* User Profile Header */}
      <div className={styles.profileHeader}>
        <div className="container">
          {!editMode ? (
            <div className="row">
              <div className="col-lg-4">
                <div className={styles.userInfo}>
                  <div className={styles.userAvatar}>
                    <img
                      src={userData?.profileImage || '/assets/images/blank-profile.png'}
                      alt="صورة المستخدم"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/blank-profile.png';
                      }}
                    />
                  </div>
                  <div className={styles.userDetails}>
                    <h2 className={styles.userName}>{userData?.FullName || userData?.name}</h2>
                    <div className={styles.joinDate}>
                      الإنضمام: {userData?.joinDate ? formatDate(userData.joinDate) : 'غير محدد'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-3">
                <div className={styles.userStatus}>
                  <div className={styles.statusItem}>
                    <span className={styles.iconInfo}>
                      <i className="fa-solid fa-clock" aria-hidden="true"></i>
                    </span>
                    <span className={styles.statusLabel}>آخر ظهور:</span>
                    <span className={styles.statusValue}>{userData?.lastSeen || 'غير محدد'}</span>
                  </div>
                  <div className={styles.statusItem}>
                    <span className={styles.iconInfo}>
                      <i className="fa-solid fa-check-circle" aria-hidden="true"></i>
                    </span>
                    <span className={styles.statusLabel}>حساب موثق</span>
                  </div>
                </div>
              </div>

              <div className="col-lg-3">
                <div className={styles.userStatus}>
                  <div className={styles.statusItem}>
                    <span className={styles.iconInfo}>
                      <i className="fa-solid fa-phone" aria-hidden="true"></i>
                    </span>
                    <span className={styles.contactLabel}>رقم الهاتف:</span>
                    <span className={styles.contactValue}>{userData?.phone || 'لا يوجد'}</span>
                  </div>
                  <div className={styles.statusItem}>
                    <span className={styles.iconInfo}>
                      <i className="fa-solid fa-id-card" aria-hidden="true"></i>
                    </span>
                    <span className={styles.membershipLabel}>نوع العضوية:</span>
                    <span className={styles.membershipValue}>{getType(userData?.membershipType)}</span>
                  </div>
                </div>
              </div>

              <div className="col-lg-2">
                <div className={styles.editProfile}>
                  <button className={styles.editProfileAction} onClick={openEditMode} aria-label="تعديل الملف الشخصي">
                    <i className="fas fa-pencil-alt" aria-hidden="true"></i>
                    <span>تعديل البيانات</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-6">
                <div className={styles.editFormCard}>
                  <div className={styles.avatarSection}>
                    <div className={styles.userAvatar}>
                      <img
                        src={userData?.profileImage || '/assets/images/blank-profile.png'}
                        alt="صورة المستخدم"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/blank-profile.png';
                        }}
                      />
                      <div
                        className={styles.uploadIcon}
                        onClick={triggerFileInput}
                        aria-label="رفع صورة جديدة"
                        role="button"
                        tabIndex={0}
                      >
                        <i className="fas fa-upload" aria-hidden="true"></i>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={onFileSelected}
                        accept="image/*"
                        aria-label="اختيار صورة جديدة"
                      />
                    </div>
                    <div className={styles.avatarHint}>
                      <p>يفضل استخدام صورة شخصية واضحة بخلفية محايدة.</p>
                    </div>
                  </div>

                  <div className={styles.editFormFields}>
                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>البريد الالكتروني</span>
                      <div className={`form-floating ${styles.width95}`}>
                        <input
                          type="email"
                          className={`form-control ${emailInvalid ? 'is-invalid' : ''}`}
                          name="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            updateEmail();
                          }}
                          id="user-email"
                          aria-describedby={emailRequiredMsg || emailInvalidMsg ? 'email-error' : undefined}
                          aria-invalid={emailInvalid}
                        />
                        <label htmlFor="user-email">البريد الالكتروني</label>
                        {emailRequiredMsg && (
                          <div className={styles.errorMessage} id="email-error" role="alert">
                            البريد الالكتروني مطلوب
                          </div>
                        )}
                        {emailInvalidMsg && (
                          <div className={styles.errorMessage} id="email-error" role="alert">
                            البريد الالكتروني غير صالح
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <span className={styles.fieldLabel}>اسم المستخدم</span>
                      <div className={`form-floating ${styles.width95}`}>
                        <input
                          type="text"
                          className={`form-control ${userNameInvalid ? 'is-invalid' : ''}`}
                          name="username"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            updateUserName();
                          }}
                          id="user-name"
                          aria-describedby={userNameRequiredMsg || userNameLengthMsg ? 'username-error' : undefined}
                          aria-invalid={userNameInvalid}
                        />
                        <label htmlFor="user-name">اسم المستخدم</label>
                        {userNameRequiredMsg && (
                          <div className={styles.errorMessage} id="username-error" role="alert">
                            اسم المستخدم مطلوب
                          </div>
                        )}
                        {userNameLengthMsg && (
                          <div className={styles.errorMessage} id="username-error" role="alert">
                            اسم المستخدم يجب أن لا يقل عن 3 أحرف
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 mt-3 mt-lg-0">
                <div className={styles.editFormCard}>
                  <div className={styles.fieldGroup}>
                    <span className={styles.fieldLabel}>رقم الهاتف</span>
                    <div className={`${styles.phoneNumberInputClass} ${styles.width95}`}>
                      <input
                        type="tel"
                        className={`form-control ${phoneNumberInvalid ? 'is-invalid' : ''}`}
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          validatePhoneNumber();
                        }}
                        placeholder="+966xxxxxxxxx"
                      />
                      {phoneNumberInvalid && (
                        <div className="invalid-feedback" id="phone-error" role="alert">
                          رقم الهاتف غير صحيح
                        </div>
                      )}
                    </div>
                    <p className={styles.helperText}>سوف نستخدم هذا الرقم للتواصل وإرسال الإشعارات المهمة.</p>
                  </div>
                </div>
              </div>

              <div className="col-lg-2">
                <div className={styles.editProfile}>
                  <div className="div">
                    <button className={`btn ${styles.btnSave} mb-3`} onClick={saveProfile} aria-label="حفظ التعديلات">
                      حفظ
                    </button>
                    <button
                      type="button"
                      className={`btn ${styles.btnCancel} mb-3`}
                      onClick={cancel}
                      aria-label="إلغاء التعديلات"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProfileContent
        userId={userData?.Id}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        companyRole={companyRole}
        userData={userData}
      />
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { advertisementService } from '@/lib/services/advertisement';
import { specialOrderService } from '@/lib/services/special-order';
import { dailyRentService } from '@/lib/services/daily-rent';
import { showToast } from '@/lib/utils/toast';
import AdsListings from '@/components/shared/list/ads-listings/AdsListings';
import ShareModal from '@/components/shared/share-modal/ShareModal';

interface UserInfoClientProps {
  userId: string;
  initialAds: any[];
  initialRents: any[];
  initialOrders: any[];
  initialUserInfo: any;
}

export default function UserInfoClient({
  userId,
  initialAds,
  initialRents,
  initialOrders,
  initialUserInfo,
}: UserInfoClientProps) {
  const [activeTab, setActiveTab] = useState('ads');
  const [ads, setAds] = useState(initialAds);
  const [rents, setRents] = useState(initialRents);
  const [orders, setOrders] = useState(initialOrders);
  const [userInfo, setUserInfo] = useState(initialUserInfo);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const [adtotalPages, setAdtotalPages] = useState(1);
  const [adtotalCount, setAdtotalCount] = useState(0);
  const [adcurrentPage, setAdcurrentPage] = useState(1);

  const [renttotalPages, setRenttotalPages] = useState(1);
  const [renttotalCount, setRenttotalCount] = useState(0);
  const [rentcurrentPage, setRentcurrentPage] = useState(1);

  const [ordertotalPages, setOrdertotalPages] = useState(1);
  const [ordertotalCount, setOrdertotalCount] = useState(0);
  const [ordercurrentPage, setOrdercurrentPage] = useState(1);

  useEffect(() => {
    extractUserInfo();
  }, [ads, rents, orders]);

  const extractUserInfo = () => {
    const firstItem = ads[0] || rents[0] || orders[0];
    if (firstItem) {
      setUserInfo({
        UserFullName: firstItem?.UserfFullName || firstItem?.RequesterName || '',
        UserProfileImageUrl: firstItem?.UserProfileImageUrl || firstItem?.RequesterImageUrl || null,
        IsVerified: firstItem?.IsVerified || false,
        LastSeen: firstItem?.LastSeen || 'لا يوجد',
        UserPhoneNumber: firstItem?.UserPhoneNumber || firstItem?.RequesterPhone || '',
      });
    }
  };

  const getUserAds = async () => {
    const payload = {
      Pagination: {
        PageNumber: adcurrentPage,
        PageSize: 10,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
      UserId: userId,
    };

    try {
      const response = await advertisementService.getAdvertisementsByUserId(payload);
      if (response.IsSuccess) {
        const data = response.Data as any;
        setAds(data?.Items || []);
        setAdtotalPages(data?.TotalPages || 0);
        setAdtotalCount(data?.TotalCount || 0);
        extractUserInfo();
      } else {
        showToast('فشل في جلب الإعلانات', 'error');
      }
    } catch (error: any) {
      showToast('حدث خطأ في جلب الإعلانات', 'error');
    }
  };

  const getUserRents = async () => {
    const payload = {
      Pagination: {
        PageNumber: rentcurrentPage,
        PageSize: 10,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
      UserId: userId,
    };

    try {
      const response = await dailyRentService.getAdvertisementsByUserId(payload);
      if (response.IsSuccess) {
        const data = response.Data as any;
        setRents(data?.Items || []);
        setRenttotalPages(data?.TotalPages || 0);
        setRenttotalCount(data?.TotalCount || 0);
        extractUserInfo();
      } else {
        showToast('فشل في جلب الإيجار اليومي', 'error');
      }
    } catch (error: any) {
      showToast('حدث خطأ في جلب الإيجار اليومي', 'error');
    }
  };

  const getUserSpecialOrders = async () => {
    const payload = {
      Pagination: {
        PageNumber: ordercurrentPage,
        PageSize: 10,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
      userId: userId,
    };

    try {
      const response = await specialOrderService.getAdvertisementsByUserId(payload);
      if (response.IsSuccess) {
        const data = response.Data as any;
        setOrders(data?.Items || []);
        setOrdertotalPages(data?.TotalPages || 0);
        setOrdertotalCount(data?.TotalCount || 0);
        extractUserInfo();
      } else {
        showToast('فشل في جلب الطلبات الخاصة', 'error');
      }
    } catch (error: any) {
      showToast('حدث خطأ في جلب الطلبات الخاصة', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'ads') {
      getUserAds();
    } else if (activeTab === 'rents') {
      getUserRents();
    } else if (activeTab === 'orders') {
      getUserSpecialOrders();
    }
  }, [activeTab, adcurrentPage, rentcurrentPage, ordercurrentPage]);

  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (!cleaned.startsWith('966')) {
      cleaned = '966' + cleaned;
    }
    return cleaned;
  };

  const formatWhatsAppNumber = (phone: string): string => {
    return formatPhoneNumber(phone);
  };

  const callAgent = () => {
    if (userInfo?.UserPhoneNumber) {
      const phoneNumber = formatPhoneNumber(userInfo.UserPhoneNumber);
      window.location.href = `tel:${phoneNumber}`;
    } else {
      showToast('هذا المستخدم ليس لديه رقم هاتف', 'error');
    }
  };

  const whatsappAgent = () => {
    if (userInfo?.UserPhoneNumber) {
      const whatsappNumber = formatWhatsAppNumber(userInfo.UserPhoneNumber);
      window.open(`https://wa.me/${whatsappNumber}`, '_blank');
    } else {
      showToast('هذا المستخدم ليس لديه رقم هاتف', 'error');
    }
  };

  const openShareModal = (project: any) => {
    setSelectedProject(project);
    const modalElement = document.getElementById('shareModal');
    if (modalElement && typeof window !== 'undefined' && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  };

  if (!userInfo) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <p>لا يمكن تحميل بيانات المستخدم</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body text-center">
              <img
                src={userInfo.UserProfileImageUrl || '/assets/images/blank-profile.png'}
                alt="صورة المستخدم"
                className="rounded-circle mb-3"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/images/blank-profile.png';
                }}
              />
              <h4>{userInfo.UserFullName || 'مستخدم'}</h4>
              {userInfo.IsVerified && (
                <span className="badge bg-success mb-2">
                  <i className="fas fa-check-circle"></i> موثق
                </span>
              )}
              <p className="text-muted">آخر ظهور: {userInfo.LastSeen}</p>
              <div className="d-flex gap-2 justify-content-center">
                <button className="btn btn-success" onClick={callAgent}>
                  <i className="fas fa-phone"></i> اتصل
                </button>
                <button className="btn btn-success" onClick={whatsappAgent}>
                  <i className="fab fa-whatsapp"></i> واتساب
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'ads' ? 'active' : ''}`}
                onClick={() => setActiveTab('ads')}
              >
                الإعلانات ({adtotalCount})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'rents' ? 'active' : ''}`}
                onClick={() => setActiveTab('rents')}
              >
                الإيجار اليومي ({renttotalCount})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                الطلبات الخاصة ({ordertotalCount})
              </button>
            </li>
          </ul>

          {activeTab === 'ads' && (
            <>
              <AdsListings ads={ads} type="ads" />
              {adtotalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${adcurrentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => adcurrentPage > 1 && setAdcurrentPage(adcurrentPage - 1)}
                          disabled={adcurrentPage === 1}
                        >
                          السابق
                        </button>
                      </li>
                      {(() => {
                        const pages: number[] = [];
                        const maxVisiblePages = 5;
                        let startPage = Math.max(1, adcurrentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(adtotalPages, startPage + maxVisiblePages - 1);
                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(i);
                        }
                        return pages;
                      })().map((pageNum) => (
                        <li key={pageNum} className={`page-item ${adcurrentPage === pageNum ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setAdcurrentPage(pageNum)}>
                            {pageNum}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${adcurrentPage === adtotalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => adcurrentPage < adtotalPages && setAdcurrentPage(adcurrentPage + 1)}
                          disabled={adcurrentPage === adtotalPages}
                        >
                          التالي
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}

          {activeTab === 'rents' && (
            <>
              <AdsListings ads={rents} type="daily_rent" />
              {renttotalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${rentcurrentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => rentcurrentPage > 1 && setRentcurrentPage(rentcurrentPage - 1)}
                          disabled={rentcurrentPage === 1}
                        >
                          السابق
                        </button>
                      </li>
                      {(() => {
                        const pages: number[] = [];
                        const maxVisiblePages = 5;
                        let startPage = Math.max(1, rentcurrentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(renttotalPages, startPage + maxVisiblePages - 1);
                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(i);
                        }
                        return pages;
                      })().map((pageNum) => (
                        <li key={pageNum} className={`page-item ${rentcurrentPage === pageNum ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setRentcurrentPage(pageNum)}>
                            {pageNum}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${rentcurrentPage === renttotalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => rentcurrentPage < renttotalPages && setRentcurrentPage(rentcurrentPage + 1)}
                          disabled={rentcurrentPage === renttotalPages}
                        >
                          التالي
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <AdsListings ads={orders} type="special_order" />
              {ordertotalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${ordercurrentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => ordercurrentPage > 1 && setOrdercurrentPage(ordercurrentPage - 1)}
                          disabled={ordercurrentPage === 1}
                        >
                          السابق
                        </button>
                      </li>
                      {(() => {
                        const pages: number[] = [];
                        const maxVisiblePages = 5;
                        let startPage = Math.max(1, ordercurrentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(ordertotalPages, startPage + maxVisiblePages - 1);
                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(i);
                        }
                        return pages;
                      })().map((pageNum) => (
                        <li key={pageNum} className={`page-item ${ordercurrentPage === pageNum ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setOrdercurrentPage(pageNum)}>
                            {pageNum}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${ordercurrentPage === ordertotalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => ordercurrentPage < ordertotalPages && setOrdercurrentPage(ordercurrentPage + 1)}
                          disabled={ordercurrentPage === ordertotalPages}
                        >
                          التالي
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedProject && (
        <ShareModal
          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/project-details/${selectedProject.Id || ''}`}
          shareTitle={selectedProject.Name || selectedProject.Title || ''}
          adId={selectedProject.Id || ''}
          userId={userId}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}


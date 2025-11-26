'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { favoritesService } from '@/lib/services/favorites';
import { showToast } from '@/lib/utils/toast';
import AdsListings from '@/components/shared/list/ads-listings/AdsListings';
import { Ad } from '@/components/shared/list/ads-listings/AdsListings';

interface TabItem {
  id: string;
  label: string;
  count: number;
  active: boolean;
}

export default function FavoritesClient() {
  const router = useRouter();
  const [tabs] = useState<TabItem[]>([
    { id: 'projects', label: 'المشاريع', count: 0, active: false },
    { id: 'ads', label: 'الإعلانات', count: 0, active: true },
    { id: 'daily-rent', label: 'الإيجار اليومي', count: 0, active: false },
    { id: 'special-orders', label: 'الطلبات الخاصة', count: 0, active: false },
  ]);

  const [activeTab, setActiveTab] = useState('ads');
  const [ads, setAds] = useState<Ad[]>([]);
  const [rents, setRents] = useState<Ad[]>([]);
  const [orders, setOrders] = useState<Ad[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination for ads
  const [adsCurrentPage, setAdsCurrentPage] = useState(1);
  const [adsTotalPages, setAdsTotalPages] = useState(0);
  const [adsTotalCount, setAdsTotalCount] = useState(0);

  // Pagination for orders
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(0);

  // Pagination for rents
  const [rentCurrentPage, setRentCurrentPage] = useState(1);
  const [rentTotalPages, setRentTotalPages] = useState(0);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 'ads':
        getUserAds();
        break;
      case 'rents':
        getUserRents();
        break;
      case 'special-orders':
        getUserSpecialOrders();
        break;
      case 'projects':
        loadProjects();
        break;
    }
  }, [activeTab]);

  const loadFavorites = () => {
    getUserAds();
    getUserRents();
    getUserSpecialOrders();
    loadProjects();
  };

  const getUserAds = async () => {
    const payload = {
      Pagination: {
        PageNumber: adsCurrentPage,
        PageSize: 10,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
      UserId: null,
    };

    try {
      const response = await favoritesService.getAd(payload);
      if (response.IsSuccess) {
        const data = response.Data as any;
        setAds(data?.Items || []);
        setAdsTotalPages(data?.TotalPages || 0);
        setAdsTotalCount(data?.TotalCount || 0);
      } else {
        showToast('فشل في جلب الإعلانات', 'error');
      }
    } catch (error) {
      console.error('Error fetching user ads:', error);
      showToast('حدث خطأ في جلب الإعلانات', 'error');
    }
  };

  const getUserSpecialOrders = async () => {
    const payload = {
      Pagination: {
        PageNumber: ordersCurrentPage,
        PageSize: 10,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
      userId: null,
    };

    try {
      const response = await favoritesService.getSpecialOrder(payload);
      if (response.IsSuccess) {
        const data = response.Data as any;
        setOrders(data?.Items || []);
        setOrdersTotalPages(data?.TotalPages || 0);
      } else {
        showToast('فشل في جلب الطلبات الخاصة', 'error');
      }
    } catch (error) {
      console.error('Error fetching user special orders:', error);
      showToast('حدث خطأ في جلب الطلبات الخاصة', 'error');
    }
  };

  const getUserRents = async () => {
    const payload = {
      Pagination: {
        PageNumber: rentCurrentPage,
        PageSize: 10,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
      UserId: null,
    };

    try {
      const response = await favoritesService.getDailyRentUnit(payload);
      if (response.IsSuccess) {
        const data = response.Data as any;
        setRents(data?.Items || []);
        setRentTotalPages(data?.TotalPages || 0);
      } else {
        showToast('فشل في جلب الإيجار اليومي', 'error');
      }
    } catch (error) {
      console.error('Error fetching user rents:', error);
      showToast('حدث خطأ في جلب الإيجار اليومي', 'error');
    }
  };

  const loadProjects = async () => {
    const payload = {
      Pagination: {
        PageNumber: 1,
        PageSize: 10,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
      userId: null,
    };

    try {
      const response = await favoritesService.getProjects(payload);
      if (response.IsSuccess) {
        const data = response.Data as any;
        setProjects(data?.Items || []);
      } else {
        showToast('فشل في جلب المشاريع', 'error');
      }
    } catch (error) {
      console.error('Error fetching user projects:', error);
      showToast('حدث خطأ في جلب المشاريع', 'error');
    }
  };

  const selectTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  const getAdsPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, adsCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(adsTotalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="container mt-4">
      <h1>المفضلة</h1>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {tabs.map((tab) => (
          <li key={tab.id} className="nav-item">
            <button
              className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => selectTab(tab.id)}
            >
              {tab.label} {tab.count > 0 && <span className="badge bg-secondary">{tab.count}</span>}
            </button>
          </li>
        ))}
      </ul>

      {/* Tab Content */}
      {activeTab === 'ads' && (
        <>
          {ads.length > 0 ? (
            <>
              <AdsListings ads={ads} type="ads" />
              {/* Pagination */}
              {adsTotalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${adsCurrentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setAdsCurrentPage(adsCurrentPage - 1)}
                          disabled={adsCurrentPage === 1}
                        >
                          السابق
                        </button>
                      </li>
                      {getAdsPageNumbers().map((pageNum) => (
                        <li key={pageNum} className={`page-item ${adsCurrentPage === pageNum ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => setAdsCurrentPage(pageNum)}>
                            {pageNum}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${adsCurrentPage === adsTotalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setAdsCurrentPage(adsCurrentPage + 1)}
                          disabled={adsCurrentPage === adsTotalPages}
                        >
                          التالي
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="alert alert-info">لا توجد إعلانات في المفضلة</div>
          )}
        </>
      )}

      {activeTab === 'daily-rent' && (
        <div className="alert alert-info">الإيجار اليومي - قيد التطوير</div>
      )}

      {activeTab === 'special-orders' && (
        <div className="alert alert-info">الطلبات الخاصة - قيد التطوير</div>
      )}

      {activeTab === 'projects' && (
        <div className="alert alert-info">المشاريع - قيد التطوير</div>
      )}
    </div>
  );
}


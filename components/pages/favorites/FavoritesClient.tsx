'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { favoritesService } from '@/lib/services/favorites';
import { currencyService } from '@/lib/services/currency';
import { showToast } from '@/lib/utils/toast';
import AdsListings from '@/components/shared/list/ads-listings/AdsListings';
import ProjectCard from '@/components/shared/cards/project-card/ProjectCard';
import { Ad } from '@/components/shared/list/ads-listings/AdsListings';
import ShareModal from '@/components/shared/share-modal/ShareModal';
import styles from './FavoritesClient.module.css';

interface TabItem {
  id: string;
  label: string;
  count: number;
  active: boolean;
}

export default function FavoritesClient() {
  const router = useRouter();
  const [tabs] = useState<TabItem[]>([
    { id: 'ads', label: 'الإعلانات', count: 0, active: true },
    { id: 'rents', label: 'الإيجارات اليوميه', count: 0, active: false },
    { id: 'special-orders', label: 'الطلبات الخاصة', count: 0, active: false },
    { id: 'projects', label: 'المشاريع', count: 0, active: false },
    { id: 'units', label: 'الوحدات', count: 0, active: false },
  ]);

  const [activeTab, setActiveTab] = useState('ads');
  const [ads, setAds] = useState<Ad[]>([]);
  const [rents, setRents] = useState<Ad[]>([]);
  const [orders, setOrders] = useState<Ad[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [units, setUnits] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Pagination for ads
  const [adsCurrentPage, setAdsCurrentPage] = useState(1);
  const [adsTotalPages, setAdsTotalPages] = useState(0);
  const [adsTotalCount, setAdsTotalCount] = useState(0);

  // Pagination for orders
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(0);
  const [ordersTotalCount, setOrdersTotalCount] = useState(0);

  // Pagination for rents
  const [rentCurrentPage, setRentCurrentPage] = useState(1);
  const [rentTotalPages, setRentTotalPages] = useState(0);
  const [rentTotalCount, setRentTotalCount] = useState(0);

  // Pagination for units
  const [unitsCurrentPage, setUnitsCurrentPage] = useState(1);
  const [unitsTotalPages, setUnitsTotalPages] = useState(0);
  const [unitsTotalCount, setUnitsTotalCount] = useState(0);

  // Pagination for projects
  const [projectCurrentPage, setProjectCurrentPage] = useState(1);
  const [projectTotalPages, setProjectTotalPages] = useState(0);
  const [projectTotalProjects, setProjectTotalProjects] = useState(0);

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
      case 'units':
        loadUnits();
        break;
    }
  }, [activeTab]);

  // Reload data when page changes
  useEffect(() => {
    if (activeTab === 'ads') {
      getUserAds();
    }
  }, [adsCurrentPage]);

  useEffect(() => {
    if (activeTab === 'rents') {
      getUserRents();
    }
  }, [rentCurrentPage]);

  useEffect(() => {
    if (activeTab === 'special-orders') {
      getUserSpecialOrders();
    }
  }, [ordersCurrentPage]);

  useEffect(() => {
    if (activeTab === 'units') {
      loadUnits();
    }
  }, [unitsCurrentPage]);

  useEffect(() => {
    if (activeTab === 'projects') {
      loadProjects();
    }
  }, [projectCurrentPage]);

  const loadFavorites = () => {
    getUserAds();
    getUserRents();
    getUserSpecialOrders();
    loadProjects();
    loadUnits();
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
        setOrdersTotalCount(data?.TotalCount || 0);
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
        const formattedRents = (data?.Items || []).map((ad: any) => ({
          ...ad,
          CoverImageUrl: ad.MainImageUrl,
          RentPrice: formatPrice(ad?.RentPrice, ad?.IsUsd),
        }));
        setRents(formattedRents);
        setRentTotalPages(data?.TotalPages || 0);
        setRentTotalCount(data?.TotalCount || 0);
      } else {
        showToast('فشل في جلب الإيجار اليومي', 'error');
      }
    } catch (error) {
      console.error('Error fetching user rents:', error);
      showToast('حدث خطأ في جلب الإيجار اليومي', 'error');
    }
  };

  const loadUnits = async () => {
    const payload = {
      Pagination: {
        PageNumber: unitsCurrentPage,
        PageSize: 10,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
      UserId: null,
    };

    try {
      const response = await favoritesService.getUnits(payload);
      if (response.IsSuccess) {
        const data = response.Data as any;
        setUnits(data?.Items || []);
        setUnitsTotalPages(data?.TotalPages || 0);
        setUnitsTotalCount(data?.TotalCount || 0);
      } else {
        showToast('فشل في جلب الوحدات', 'error');
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      showToast('حدث خطأ في جلب الوحدات', 'error');
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    const payload = {
      Pagination: {
        PageNumber: projectCurrentPage,
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
      if (response?.IsSuccess) {
        const data = response.Data as any;
        setProjects(data?.Items || []);
        setProjectCurrentPage(data?.PageNumber || projectCurrentPage);
        setProjectTotalProjects(data?.TotalCount || 0);
        setProjectTotalPages(data?.TotalPages || 0);
      } else {
        showToast(response?.Message || 'حدث خطأ أثناء تحميل المشاريع', 'error');
      }
    } catch (error) {
      console.error('Error fetching user projects:', error);
      showToast('حدث خطأ في الاتصال بالخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, isUsd?: boolean): string => {
    if (!price || price <= 0) return 'السعر غير متوفر';
    return currencyService.formatPriceByCurrency(price, isUsd);
  };

  const selectTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  const onFavoriteToggled = (item: any) => {
    // Small delay to ensure the backend is updated
    setTimeout(() => {
      // Refresh the current tab data
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
        case 'units':
          loadUnits();
          break;
      }
    }, 500);
  };

  const openShareModal = (project: any) => {
    setSelectedProject(project);
  };

  const closeShareModal = () => {
    setSelectedProject(null);
  };

  // Pagination helper functions
  const getPageNumbers = (currentPage: number, totalPages: number): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="notifications-content">
          <h1 className="page-title" aria-label="المفضلة">
            المفضلة
          </h1>

          {/* Tabs Navigation */}
          <div className={`${styles.tabsContainer} mt-3`}>
            <div className={styles.tabsNav} role="tablist" aria-label="تبديل علامات التبويب">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`${styles.tabItem} ${activeTab === tab.id ? styles.active : ''}`}
                  onClick={() => selectTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-label={tab.label}
                >
                  <span className={styles.tabLabel}>{tab.label}</span>
                  {tab.count > 0 && <span className={styles.tabCount}>({tab.count})</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="content-area">
            {/* Loading State */}
            {isLoading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>جاري تحميل المفضلة...</p>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="tab-content">
                <h3 className="section-title mb-5">المشاريع</h3>

                {/* Loading Spinner */}
                {loading && (
                  <div className="row">
                    <div className="col-12 text-center">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">جاري التحميل...</span>
                      </div>
                      <p className="mt-2">جاري تحميل المشاريع...</p>
                    </div>
                  </div>
                )}

                {/* Projects Grid */}
                {projects.length > 0 && !loading && (
                  <div className="row">
                    {projects.map((project) => (
                      <div key={project.Id} className="col-md-6">
                        <ProjectCard
                          project={project}
                          showActions={false}
                          onShare={() => openShareModal(project)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* No Projects Message */}
                {projects.length === 0 && !loading && (
                  <div className="row">
                    <div className="col-12">
                      <div className="alert alert-info text-center" role="alert" aria-label="لا توجد مشاريع متاحة حالياً">
                        لا توجد مشاريع متاحة حالياً
                      </div>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {projectTotalProjects > 0 && !loading && (
                  <div className="pagination-container">
                    <nav aria-label="Page navigation">
                      <ul className="pagination justify-content-center">
                        {/* Previous Page Button */}
                        <li className={`page-item ${projectCurrentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => {
                              if (projectCurrentPage > 1) {
                                setProjectCurrentPage(projectCurrentPage - 1);
                              }
                            }}
                            disabled={projectCurrentPage === 1}
                            aria-disabled={projectCurrentPage === 1}
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>

                        {/* Page Numbers */}
                        {getPageNumbers(projectCurrentPage, projectTotalPages).map((pageNumber) => (
                          <li
                            key={pageNumber}
                            className={`page-item ${pageNumber === projectCurrentPage ? 'active' : ''}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => setProjectCurrentPage(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          </li>
                        ))}

                        {/* Next Page Button */}
                        <li className={`page-item ${projectCurrentPage >= projectTotalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => {
                              if (projectCurrentPage < projectTotalPages) {
                                setProjectCurrentPage(projectCurrentPage + 1);
                              }
                            }}
                            disabled={projectCurrentPage >= projectTotalPages}
                            aria-disabled={projectCurrentPage >= projectTotalPages}
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>

                    {/* Page Info */}
                    <div className="pagination-info text-center mt-2">
                      <small className="text-muted">
                        صفحة {projectCurrentPage} من {projectTotalPages} (إجمالي {projectTotalProjects} مشروع)
                      </small>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Units Tab */}
            {activeTab === 'units' && (
              <div className="favorites-tab">
                <h3 className="section-title mb-5">الوحدات</h3>
                {/* No Data Alert */}
                {units.length === 0 && (
                  <div className="alert alert-info text-center" role="alert" aria-label="لا توجد وحدات في المفضلة">
                    <i className="fas fa-info-circle me-2"></i>
                    لا توجد وحدات في المفضلة
                  </div>
                )}
                {/* Units Listings */}
                {units.length > 0 && (
                  <>
                    <AdsListings ads={units} type="units" showActions={false} onFavoriteToggled={onFavoriteToggled} />
                    <nav aria-label="Units pagination">
                      <ul className="pagination justify-content-center">
                        {/* Previous Button */}
                        <li className={`page-item ${unitsCurrentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => {
                              if (unitsCurrentPage > 1) {
                                setUnitsCurrentPage(unitsCurrentPage - 1);
                              }
                            }}
                            disabled={unitsCurrentPage === 1}
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>
                        {/* Page Numbers */}
                        {getPageNumbers(unitsCurrentPage, unitsTotalPages).map((p) => (
                          <li key={p} className={`page-item ${p === unitsCurrentPage ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setUnitsCurrentPage(p)}>
                              {p}
                            </button>
                          </li>
                        ))}
                        {/* Next Button */}
                        <li className={`page-item ${unitsCurrentPage >= unitsTotalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => {
                              if (unitsCurrentPage < unitsTotalPages) {
                                setUnitsCurrentPage(unitsCurrentPage + 1);
                              }
                            }}
                            disabled={unitsCurrentPage >= unitsTotalPages}
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </>
                )}
              </div>
            )}

            {/* Ads Tab */}
            {activeTab === 'ads' && (
              <div className="favorites-tab">
                <h3 className="section-title mb-5">الإعلانات</h3>
                {/* No Data Alert */}
                {ads.length === 0 && (
                  <div className="alert alert-info text-center" role="alert" aria-label="لا توجد إعلانات في المفضلة">
                    <i className="fas fa-info-circle me-2"></i>
                    لا توجد إعلانات في المفضلة
                  </div>
                )}
                {/* Ads Listings */}
                {ads.length > 0 && (
                  <>
                    <AdsListings ads={ads} type="ads" showActions={false} onFavoriteToggled={onFavoriteToggled} />
                    <nav aria-label="Ads pagination">
                      <ul className="pagination justify-content-center">
                        {/* Previous Button */}
                        <li className={`page-item ${adsCurrentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => {
                              if (adsCurrentPage > 1) {
                                setAdsCurrentPage(adsCurrentPage - 1);
                              }
                            }}
                            disabled={adsCurrentPage === 1}
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>
                        {/* Page Numbers */}
                        {getPageNumbers(adsCurrentPage, adsTotalPages).map((p) => (
                          <li key={p} className={`page-item ${p === adsCurrentPage ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setAdsCurrentPage(p)}>
                              {p}
                            </button>
                          </li>
                        ))}
                        {/* Next Button */}
                        <li className={`page-item ${adsCurrentPage >= adsTotalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => {
                              if (adsCurrentPage < adsTotalPages) {
                                setAdsCurrentPage(adsCurrentPage + 1);
                              }
                            }}
                            disabled={adsCurrentPage >= adsTotalPages}
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </>
                )}
              </div>
            )}

            {/* Daily Rent Tab */}
            {activeTab === 'rents' && (
              <div className="favorites-tab">
                <h3 className="section-title mb-5">الإيجار اليومي</h3>
                {/* No Data Alert */}
                {rents.length === 0 && (
                  <div className="alert alert-info text-center" role="alert" aria-label="لا توجد إيجارات يومية في المفضلة">
                    <i className="fas fa-info-circle me-2"></i>
                    لا توجد إيجارات يومية في المفضلة
                  </div>
                )}
                {/* Daily Rent Listings */}
                {rents.length > 0 && (
                  <>
                    <AdsListings ads={rents} type="daily_rent" showActions={false} onFavoriteToggled={onFavoriteToggled} />
                    <nav aria-label="Daily rent pagination">
                      <ul className="pagination justify-content-center">
                        {/* Previous Button */}
                        <li className={`page-item ${rentCurrentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => {
                              if (rentCurrentPage > 1) {
                                setRentCurrentPage(rentCurrentPage - 1);
                              }
                            }}
                            disabled={rentCurrentPage === 1}
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>
                        {/* Page Numbers */}
                        {getPageNumbers(rentCurrentPage, rentTotalPages).map((p) => (
                          <li key={p} className={`page-item ${p === rentCurrentPage ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setRentCurrentPage(p)}>
                              {p}
                            </button>
                          </li>
                        ))}
                        {/* Next Button */}
                        <li className={`page-item ${rentCurrentPage >= rentTotalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => {
                              if (rentCurrentPage < rentTotalPages) {
                                setRentCurrentPage(rentCurrentPage + 1);
                              }
                            }}
                            disabled={rentCurrentPage >= rentTotalPages}
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </>
                )}
              </div>
            )}

            {/* Special Orders Tab */}
            {activeTab === 'special-orders' && (
              <div className="favorites-tab">
                <h3 className="section-title mb-5">الطلبات الخاصة</h3>
                {/* No Data Alert */}
                {orders.length === 0 && (
                  <div className="alert alert-info text-center" role="alert" aria-label="لا توجد طلبات خاصة في المفضلة">
                    <i className="fas fa-info-circle me-2"></i>
                    لا توجد طلبات خاصة في المفضلة
                  </div>
                )}
                {/* Special Orders Listings */}
                {orders.length > 0 && (
                  <>
                    <AdsListings ads={orders} type="special_order" showActions={false} onFavoriteToggled={onFavoriteToggled} />
                    <nav aria-label="Special orders pagination">
                      <ul className="pagination justify-content-center">
                        {/* Previous Button */}
                        <li className={`page-item ${ordersCurrentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => {
                              if (ordersCurrentPage > 1) {
                                setOrdersCurrentPage(ordersCurrentPage - 1);
                              }
                            }}
                            disabled={ordersCurrentPage === 1}
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </li>
                        {/* Page Numbers */}
                        {getPageNumbers(ordersCurrentPage, ordersTotalPages).map((p) => (
                          <li key={p} className={`page-item ${p === ordersCurrentPage ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setOrdersCurrentPage(p)}>
                              {p}
                            </button>
                          </li>
                        ))}
                        {/* Next Button */}
                        <li className={`page-item ${ordersCurrentPage >= ordersTotalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => {
                              if (ordersCurrentPage < ordersTotalPages) {
                                setOrdersCurrentPage(ordersCurrentPage + 1);
                              }
                            }}
                            disabled={ordersCurrentPage >= ordersTotalPages}
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {selectedProject && (
        <ShareModal
          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/project-details/${selectedProject.Id}`}
          shareTitle={selectedProject.Name || ''}
          adId={selectedProject.Id}
          userId={null}
          onClose={closeShareModal}
        />
      )}
    </div>
  );
}

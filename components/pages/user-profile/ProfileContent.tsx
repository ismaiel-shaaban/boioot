'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdsListings from '@/components/shared/list/ads-listings/AdsListings';
import Wallet from './tabs/Wallet';
import PasswordChange from './tabs/PasswordChange';
import CardsManagement from './tabs/CardsManagement';
import LicenseManagement from './tabs/LicenseManagement';
import AdLicense from './tabs/AdLicense';
import OrdersList from './tabs/OrdersList';
import PostsList from './tabs/PostsList';
import AdPost from './tabs/AdPost';
import SubscriptionProfile from './tabs/SubscriptionProfile';
import ProjectCard from '@/components/shared/cards/project-card/ProjectCard';
import { advertisementService } from '@/lib/services/advertisement';
import { specialOrderService } from '@/lib/services/special-order';
import { dailyRentService } from '@/lib/services/daily-rent';
import { projectsService } from '@/lib/services/projects';
import { showToast } from '@/lib/utils/toast';
import ShareModal from '@/components/shared/share-modal/ShareModal';
import { Ad } from '@/components/shared/list/ads-listings/AdsListings';
import AdCardPayment, { Card } from './tabs/AdCardPayment';
import styles from './ProfileContent.module.css';

interface Project {
  Id: string | number;
  Name?: string;
  [key: string]: any;
}

interface Post {
  [key: string]: any;
}

interface License {
  [key: string]: any;
}

interface UserData {
  [key: string]: any;
}

interface ProfileContentProps {
  userId?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  companyRole: boolean;
  userData: UserData;
}

export default function ProfileContent({
  userId,
  activeTab,
  onTabChange,
  companyRole,
  userData,
}: ProfileContentProps) {
  const router = useRouter();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [activeSettingsOption, setActiveSettingsOption] = useState('password');
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [rents, setRents] = useState<Ad[]>([]);
  const [orders, setOrders] = useState<Ad[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [adtotalPages, setAdTotalPages] = useState(0);
  const [adtotalCount, setAdTotalCount] = useState(0);
  const [adcurrentPage, setAdCurrentPage] = useState(1);
  
  const [renttotalPages, setRentTotalPages] = useState(0);
  const [renttotalCount, setRentTotalCount] = useState(0);
  const [rentcurrentPage, setRentCurrentPage] = useState(1);
  
  const [ordertotalPages, setOrderTotalPages] = useState(0);
  const [ordertotalCount, setOrderTotalCount] = useState(0);
  const [ordercurrentPage, setOrderCurrentPage] = useState(1);
  
  const [projectcurrentPage, setProjectCurrentPage] = useState(1);
  const [projecttotalPages, setProjectTotalPages] = useState(0);
  const [projecttotalProjects, setProjectTotalProjects] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Ad | Project | null>(null);
  const [deleteType, setDeleteType] = useState<'ad' | 'rent' | 'order' | 'project' | 'request' | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [license, setLicense] = useState<License | null>(null);

  useEffect(() => {
    loadTabData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyRole]);

  useEffect(() => {
    if (activeTab === 'ads') {
      getUserAds();
    } else if (activeTab === 'rents') {
      getUserRents();
    } else if (activeTab === 'special_orders') {
      getUserSpecialOrders();
    } else if (activeTab === 'projects') {
      loadProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, adcurrentPage, rentcurrentPage, ordercurrentPage, projectcurrentPage]);

  const loadTabData = async () => {
    if (companyRole) {
      await loadProjects();
    }
    await getUserAds();
    await getUserRents();
    await getUserSpecialOrders();
  };

  const getUserAds = async () => {
    try {
      const payload = {
        Pagination: {
          PageNumber: adcurrentPage,
          PageSize: 10,
          SortBy: '',
          IsDescending: true,
          SearchTerm: '',
          Filters: {},
        },
        UserId: null,
      };
      const response = await advertisementService.getAdvertisementsByUserId(payload);
      if (response?.IsSuccess) {
        const data = response.Data as any;
        const items: Ad[] = (data?.Items || []).map((item: any) => ({
          ...item,
          Id: String(item.Id || item.id || item.ID || ''),
        }));
        setAds(items);
        setAdTotalPages(data?.TotalPages || 0);
        setAdTotalCount(data?.TotalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  };

  const getUserRents = async () => {
    try {
      const payload = {
        Pagination: {
          PageNumber: rentcurrentPage,
          PageSize: 10,
          SortBy: '',
          IsDescending: true,
          SearchTerm: '',
          Filters: {},
        },
        UserId: null,
      };
      const response = await dailyRentService.getAdvertisementsByUserId(payload);
      if (response?.IsSuccess) {
        const data = response.Data as any;
        const items: Ad[] = (data?.Items || []).map((item: any) => ({
          ...item,
          Id: String(item.Id || item.id || item.ID || ''),
        }));
        setRents(items);
        setRentTotalPages(data?.TotalPages || 0);
        setRentTotalCount(data?.TotalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching rents:', error);
    }
  };

  const getUserSpecialOrders = async () => {
    try {
      const payload = {
        Pagination: {
          PageNumber: ordercurrentPage,
          PageSize: 10,
          SortBy: '',
          IsDescending: true,
          SearchTerm: '',
          Filters: {},
        },
        userId: null, // Angular uses lowercase 'userId' for special orders
      };
      const response = await specialOrderService.getAdvertisementsByUserId(payload);
      if (response?.IsSuccess) {
        const data = response.Data as any;
        const items: Ad[] = (data?.Items || []).map((item: any) => ({
          ...item,
          Id: String(item.Id || item.id || item.ID || ''),
        }));
        setOrders(items);
        setOrderTotalPages(data?.TotalPages || 0);
        setOrderTotalCount(data?.TotalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    try {
      // Angular uses getCompanyProjectsWithPagination which returns nested structure
      const response = await projectsService.getCompanyProjectsWithPagination(projectcurrentPage, 6);
      if (response?.IsSuccess) {
        const data = response.Data as any;
        // Angular response structure: response.Data.Projects.Items
        const projectsData = data?.Projects || data;
        setProjects((projectsData?.Items || data?.Items || []) as Project[]);
        setProjectTotalPages(projectsData?.TotalPages || data?.TotalPages || 0);
        setProjectTotalProjects(projectsData?.TotalCount || data?.TotalCount || 0);
        // Also update current page from response if provided
        if (projectsData?.PageNumber) {
          setProjectCurrentPage(projectsData.PageNumber);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      showToast('حدث خطأ في الاتصال بالخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  const setActiveTab = (tab: string) => {
    onTabChange(tab);
    if (tab === 'settings' || tab === 'password' || tab === 'cards' || tab === 'license') {
      setShowSettingsDropdown(true);
      if (tab !== 'settings') {
        setActiveSettingsOption(tab);
      }
    } else {
      setShowSettingsDropdown(false);
    }
  };

  const handleSettingsOptionChange = (option: string) => {
    setActiveSettingsOption(option);
    onTabChange(option);
  };

  const editAd = (ad: Ad) => {
    router.push(`/add-advertistment/${String(ad.Id)}`);
  };

  const editRent = (rent: Ad) => {
    router.push(`/add-daily-rent/${String(rent.Id)}`);
  };

  const editOrder = (order: Ad) => {
    router.push(`/add-special-order/${String(order.Id)}`);
  };

  const updateProject = (project: Project) => {
    router.push(`/add-project/${project.Id}`);
  };

  const openDeleteAdModal = (ad: Ad) => {
    setItemToDelete(ad);
    setDeleteType('ad');
    setShowDeleteDialog(true);
  };

  const openDeleteRentModal = (rent: Ad) => {
    setItemToDelete(rent);
    setDeleteType('rent');
    setShowDeleteDialog(true);
  };

  const openDeleteOrderModal = (order: Ad) => {
    setItemToDelete(order);
    setDeleteType('order');
    setShowDeleteDialog(true);
  };

  const openDeleteProjectModal = (project: Project) => {
    setItemToDelete(project);
    setDeleteType('project');
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !deleteType) return;

    try {
      let response;
      const itemId = String(itemToDelete.Id);
      
      if (deleteType === 'ad') {
        response = await advertisementService.deleteAdvertisement(itemId);
        if (response?.IsSuccess) {
          showToast('تم حذف الإعلان بنجاح', 'success');
          getUserAds(); // Match Angular: calls specific fetch function
        } else {
          showToast((response as any)?.Error || 'فشل في حذف الإعلان', 'error');
        }
      } else if (deleteType === 'rent') {
        response = await dailyRentService.deleteAdvertisement(itemId);
        if (response?.IsSuccess) {
          showToast('تم حذف الإيجار اليومي بنجاح', 'success');
          getUserRents(); // Match Angular: calls specific fetch function
        } else {
          showToast((response as any)?.Error || 'فشل في حذف الإيجار اليومي', 'error');
        }
      } else if (deleteType === 'order') {
        response = await specialOrderService.deleteAdvertisement(itemId);
        if (response?.IsSuccess) {
          showToast('تم حذف الطلب الخاص بنجاح', 'success');
          getUserSpecialOrders(); // Match Angular: calls specific fetch function
        } else {
          showToast((response as any)?.Error || 'فشل في حذف الطلب الخاص', 'error');
        }
      } else if (deleteType === 'project') {
        response = await projectsService.deleteProject(itemId);
        if (response?.IsSuccess) {
          showToast('تم حذف المشروع بنجاح', 'success');
          loadProjects(); // Match Angular: calls specific fetch function
        } else {
          showToast((response as any)?.Message || (response as any)?.Error || 'فشل في حذف المشروع', 'error');
        }
      } else if (deleteType === 'request') {
        const { propertyRequestsService } = await import('@/lib/services/property-requests');
        response = await propertyRequestsService.deletePropertyRequest(itemId);
        if (response?.IsSuccess) {
          showToast('تم حذف طلب العقار بنجاح', 'success');
          // OrdersList will handle its own refresh
        } else {
          showToast((response as any)?.Error || 'فشل في حذف طلب العقار', 'error');
        }
      }

      if (response?.IsSuccess) {
        setShowDeleteDialog(false);
        setItemToDelete(null);
        setDeleteType(null);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast('حدث خطأ أثناء الحذف', 'error');
      setShowDeleteDialog(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  const toggleDeleteDialog = () => {
    setShowDeleteDialog(false);
    setItemToDelete(null);
    setDeleteType(null);
  };

  const getDeleteMessage = (): string => {
    // Match Angular's delete message format
    if (!itemToDelete) {
      return 'هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.';
    }
    
    switch (deleteType) {
      case 'ad':
      case 'rent':
      case 'order': {
        const ad = itemToDelete as Ad;
        const title = deleteType === 'ad' ? 'الإعلان' : deleteType === 'rent' ? 'الإيجار اليومي' : 'الطلب الخاص';
        return `هل أنت متأكد من حذف ${title} "${ad.Title || ''}"؟ لا يمكن التراجع عن هذا الإجراء.`;
      }
      case 'project': {
        const project = itemToDelete as Project;
        return `هل أنت متأكد من حذف المشروع "${project.Name || ''}"؟ لا يمكن التراجع عن هذا الإجراء.`;
      }
      case 'request': {
        const req = itemToDelete as Ad;
        return `هل أنت متأكد من حذف طلب العقار "${req.Title || ''}"؟ لا يمكن التراجع عن هذا الإجراء.`;
      }
      default:
        return 'هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.';
    }
  };

  const getDeleteButtonText = (): string => {
    // Match Angular's delete button text
    switch (deleteType) {
      case 'ad':
        return 'حذف الإعلان';
      case 'rent':
        return 'حذف الإيجار';
      case 'order':
        return 'حذف الطلب الخاص';
      case 'project':
        return 'حذف المشروع';
      case 'request':
        return 'حذف طلب العقار';
      default:
        return 'حذف';
    }
  };

  const goToAddAd = () => {
    router.push('/add-advertistment');
  };

  const goToAddRent = () => {
    router.push('/add-daily-rent');
  };

  const goToAddSpecialOrder = () => {
    router.push('/add-special-order');
  };

  const goToAddProject = () => {
    router.push('/add-project');
  };

  const goToAddRequest = () => {
    router.push('/add-request');
  };

  const editRequest = (req: any) => {
    router.push(`/add-request/${req.Id}`);
  };

  const openDeleteRequestModal = (req: any) => {
    setItemToDelete(req);
    setDeleteType('request');
    setShowDeleteDialog(true);
  };

  const openShareModal = (project: Project) => {
    setSelectedProject(project);
  };

  const changeTabFromCards = (card: Card) => {
    setCard(card);
    setActiveTab('add-card');
  };

  const changeTabFromAdCard = () => {
    setCard(null);
    setActiveTab('cards');
  };

  const changeTabFromlicens = (license: License) => {
    setLicense(license);
    setActiveTab('add-license');
  };

  const changeTabFromAdLicense = () => {
    setLicense(null);
    setActiveTab('license');
  };

  const changeTabFromPosts = (post: Post) => {
    setPost(post);
    setActiveTab('add-post');
  };

  const changeTabFromAdPosts = () => {
    setPost(null);
    setActiveTab('posts');
  };

  // Pagination helpers
  const adnextPage = () => {
    if (adcurrentPage < adtotalPages) {
      setAdCurrentPage(adcurrentPage + 1);
    }
  };

  const adpreviousPage = () => {
    if (adcurrentPage > 1) {
      setAdCurrentPage(adcurrentPage - 1);
    }
  };

  const adgoToPage = (page: number) => {
    if (page >= 1 && page <= adtotalPages) {
      setAdCurrentPage(page);
    }
  };

  const adgetPageNumbers = (): number[] => {
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
  };

  const rentnextPage = () => {
    if (rentcurrentPage < renttotalPages) {
      setRentCurrentPage(rentcurrentPage + 1);
    }
  };

  const rentpreviousPage = () => {
    if (rentcurrentPage > 1) {
      setRentCurrentPage(rentcurrentPage - 1);
    }
  };

  const rentgoToPage = (page: number) => {
    if (page >= 1 && page <= renttotalPages) {
      setRentCurrentPage(page);
    }
  };

  const rentgetPageNumbers = (): number[] => {
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
  };

  const ordernextPage = () => {
    if (ordercurrentPage < ordertotalPages) {
      setOrderCurrentPage(ordercurrentPage + 1);
    }
  };

  const orderpreviousPage = () => {
    if (ordercurrentPage > 1) {
      setOrderCurrentPage(ordercurrentPage - 1);
    }
  };

  const ordergoToPage = (page: number) => {
    if (page >= 1 && page <= ordertotalPages) {
      setOrderCurrentPage(page);
    }
  };

  const ordergetPageNumbers = (): number[] => {
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
  };

  const projectgoToPreviousPage = () => {
    if (projectcurrentPage > 1) {
      setProjectCurrentPage(projectcurrentPage - 1);
    }
  };

  const projectgoToNextPage = () => {
    if (projectcurrentPage < projecttotalPages) {
      setProjectCurrentPage(projectcurrentPage + 1);
    }
  };

  const projectgoToPage = (page: number) => {
    if (page >= 1 && page <= projecttotalPages) {
      setProjectCurrentPage(page);
    }
  };

  const projectisFirstPage = (): boolean => {
    return projectcurrentPage === 1;
  };

  const projectisLastPage = (): boolean => {
    return projectcurrentPage >= projecttotalPages;
  };

  const projectgetPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, projectcurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(projecttotalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={styles.mainContent} role="main">
      <div className="container">
        <div className="row">
          {/* Sidebar with Tabs */}
          <div className="col-lg-3">
            <div className={styles.profileTabs} role="navigation">
              {companyRole && (
                <div
                  className={`${styles.tabItem} ${activeTab === 'projects' ? styles.active : ''}`}
                  onClick={() => setActiveTab('projects')}
                  role="tab"
                  aria-selected={activeTab === 'projects'}
                >
                  المشاريع
                </div>
              )}
              <div
                className={`${styles.tabItem} ${activeTab === 'ads' ? styles.active : ''}`}
                onClick={() => setActiveTab('ads')}
                role="tab"
                aria-selected={activeTab === 'ads'}
              >
                الإعلانات
              </div>
              <div
                className={`${styles.tabItem} ${activeTab === 'rents' ? styles.active : ''}`}
                onClick={() => setActiveTab('rents')}
                role="tab"
                aria-selected={activeTab === 'rents'}
              >
                الإيجارات اليوميه
              </div>
              <div
                className={`${styles.tabItem} ${activeTab === 'wallet' ? styles.active : ''}`}
                onClick={() => setActiveTab('wallet')}
                role="tab"
                aria-selected={activeTab === 'wallet'}
              >
                المحفظة
              </div>
              <div
                className={`${styles.tabItem} ${activeTab === 'profile' ? styles.active : ''}`}
                onClick={() => setActiveTab('profile')}
                role="tab"
                aria-selected={activeTab === 'profile'}
              >
                الباقات
              </div>
              <div
                className={`${styles.tabItem} ${activeTab === 'settings' || showSettingsDropdown ? styles.active : ''}`}
                onClick={() => setActiveTab('settings')}
                role="tab"
                aria-selected={activeTab === 'settings'}
              >
                الإعدادات
              </div>

              {(showSettingsDropdown ||
                activeTab === 'password' ||
                activeTab === 'cards' ||
                activeTab === 'license') && (
                <div className={styles.settingsDropdown}>
                  <div
                    className={`${styles.settingsOption} ${activeTab === 'password' ? styles.active : ''}`}
                    onClick={() => {
                      handleSettingsOptionChange('password');
                    }}
                    role="menuitem"
                  >
                    تغيير كلمة المرور
                  </div>
                  <div
                    className={`${styles.settingsOption} ${activeTab === 'cards' ? styles.active : ''}`}
                    onClick={() => {
                      handleSettingsOptionChange('cards');
                    }}
                    role="menuitem"
                  >
                    إدارة البطاقات
                  </div>
                  <div
                    className={`${styles.settingsOption} ${activeTab === 'license' ? styles.active : ''}`}
                    onClick={() => {
                      handleSettingsOptionChange('license');
                    }}
                    role="menuitem"
                  >
                    إضافة رخصة نشاط عقاري
                  </div>
                </div>
              )}

              <div
                className={`${styles.tabItem} ${activeTab === 'special_orders' ? styles.active : ''}`}
                onClick={() => setActiveTab('special_orders')}
                role="tab"
                aria-selected={activeTab === 'special_orders'}
              >
                طلبات التسويق
              </div>
              <div
                className={`${styles.tabItem} ${activeTab === 'orders' ? styles.active : ''}`}
                onClick={() => setActiveTab('orders')}
                role="tab"
                aria-selected={activeTab === 'orders'}
              >
                طلبات العقارات
              </div>
              <div
                className={`${styles.tabItem} ${activeTab === 'posts' ? styles.active : ''}`}
                onClick={() => setActiveTab('posts')}
                role="tab"
                aria-selected={activeTab === 'posts'}
              >
                المشاركات
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="col-lg-9">
            <div className={styles.contentArea}>
              {activeTab === 'password' && (
                <div className="row">
                  <div className="col-lg-6">
                    <PasswordChange />
                  </div>
                </div>
              )}

              {activeTab === 'ads' && (
                <div className={styles.adsTab}>
                  <div className={styles.tabActions}>
                    <h3 className={styles.sectionTitle}>الاعلانات</h3>
                    <button className={`btn ${styles.btnAddCard}`} onClick={goToAddAd}>
                      إضافة إعلان
                    </button>
                  </div>
                  {ads.length === 0 ? (
                    <div className="alert alert-info text-center">لا توجد إعلانات متاحة</div>
                  ) : (
                    <>
                      <AdsListings
                        ads={ads}
                        type="ads"
                        showActions={true}
                        onEditAd={editAd}
                        onDeleteAd={openDeleteAdModal}
                      />
                      <nav aria-label="Ads pagination">
                        <ul className="pagination justify-content-center">
                          <li className={`page-item ${adcurrentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={adpreviousPage} disabled={adcurrentPage === 1}>
                              <i className="fas fa-chevron-right"></i>
                            </button>
                          </li>
                          {adgetPageNumbers().map((p) => (
                            <li key={p} className={`page-item ${p === adcurrentPage ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => adgoToPage(p)}>
                                {p}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${adcurrentPage >= adtotalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={adnextPage} disabled={adcurrentPage >= adtotalPages}>
                              <i className="fas fa-chevron-left"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'rents' && (
                <div className={styles.adsTab}>
                  <div className={styles.tabActions}>
                    <h3 className={styles.sectionTitle}>الايجار اليومي</h3>
                    <button className={`btn ${styles.btnAddCard}`} onClick={goToAddRent}>
                      إضافة إيجار يومي
                    </button>
                  </div>
                  {rents.length === 0 ? (
                    <div className="alert alert-info text-center">لا توجد إيجارات يومية متاحة</div>
                  ) : (
                    <>
                      <AdsListings
                        ads={rents}
                        type="daily_rent"
                        showActions={true}
                        onEditAd={editRent}
                        onDeleteAd={openDeleteRentModal}
                      />
                      <nav aria-label="rents pagination">
                        <ul className="pagination justify-content-center">
                          <li className={`page-item ${rentcurrentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={rentpreviousPage} disabled={rentcurrentPage === 1}>
                              <i className="fas fa-chevron-right"></i>
                            </button>
                          </li>
                          {rentgetPageNumbers().map((p) => (
                            <li key={p} className={`page-item ${p === rentcurrentPage ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => rentgoToPage(p)}>
                                {p}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${rentcurrentPage >= renttotalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={rentnextPage} disabled={rentcurrentPage >= renttotalPages}>
                              <i className="fas fa-chevron-left"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'special_orders' && (
                <div className={styles.adsTab}>
                  <div className={styles.tabActions}>
                    <h3 className={styles.sectionTitle}>الطلبات الخاصه</h3>
                    <button className={`btn ${styles.btnAddCard}`} onClick={goToAddSpecialOrder}>
                      إضافة طلب تسويق
                    </button>
                  </div>
                  {orders.length === 0 ? (
                    <div className="alert alert-info text-center">لا توجد طلبات خاصة متاحة</div>
                  ) : (
                    <>
                      <AdsListings
                        ads={orders}
                        type="special_order"
                        showActions={true}
                        onEditAd={editOrder}
                        onDeleteAd={openDeleteOrderModal}
                      />
                      <nav aria-label="Orders pagination">
                        <ul className="pagination justify-content-center">
                          <li className={`page-item ${ordercurrentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={orderpreviousPage} disabled={ordercurrentPage === 1}>
                              <i className="fas fa-chevron-right"></i>
                            </button>
                          </li>
                          {ordergetPageNumbers().map((p) => (
                            <li key={p} className={`page-item ${p === ordercurrentPage ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => ordergoToPage(p)}>
                                {p}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${ordercurrentPage >= ordertotalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={ordernextPage} disabled={ordercurrentPage >= ordertotalPages}>
                              <i className="fas fa-chevron-left"></i>
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'wallet' && <Wallet />}

              {activeTab === 'profile' && <SubscriptionProfile userId={userId} />}

              {activeTab === 'license' && (
                <div className={styles.licensesTab}>
                  <div className={styles.tabActions}>
                    <h3 className={styles.sectionTitle}>الرخص العقارية</h3>
                    <button className={`btn ${styles.btnAddLicense}`} onClick={() => setActiveTab('add-license')}>
                      إضافة رخصة
                    </button>
                  </div>
                  <LicenseManagement onChangeTab={changeTabFromlicens} />
                </div>
              )}

              {activeTab === 'cards' && (
                <div className={styles.cardsTab}>
                  <div className={styles.tabActions}>
                    <h3 className={styles.sectionTitle}>البطاقات</h3>
                    <button className={`btn ${styles.btnAddCard}`} onClick={() => {
                      setCard(null);
                      setActiveTab('add-card');
                    }}>
                      إضافة بطاقة جديدة
                    </button>
                  </div>
                  <CardsManagement userId={userId || (userData?.Id as string) || (userData?.id as string)} onChangeTab={changeTabFromCards} />
                </div>
              )}

              {activeTab === 'add-card' && <AdCardPayment card={card} onChangeTab={changeTabFromAdCard} />}

              {activeTab === 'orders' && (
                <div className={styles.ordersTab}>
                  <div className={styles.tabActions}>
                    <h3 className={styles.sectionTitle}>الطلبات</h3>
                    <button className={`btn ${styles.btnAddCard}`} onClick={goToAddRequest}>
                      إضافة طلب عقار
                    </button>
                  </div>
                  <OrdersList
                    userId={userId}
                    showActions={true}
                    onEditRequest={editRequest}
                    onDeleteRequest={openDeleteRequestModal}
                  />
                </div>
              )}

              {activeTab === 'add-license' && (
                <div className={styles.addLicenseTab}>
                  <h3 className={styles.sectionTitle}>إضافة رخصة نشاط عقاري</h3>
                  <AdLicense license={license} onChangeTab={changeTabFromAdLicense} />
                </div>
              )}

              {activeTab === 'posts' && (
                <div className={styles.postsTab}>
                  <div className={styles.tabActions}>
                    <h3 className={styles.sectionTitle}>المشاركات</h3>
                    <button className={`btn ${styles.btnAddCard}`} onClick={() => {
                      setPost(null);
                      setActiveTab('add-post');
                    }}>
                      إضافة مشاركة
                    </button>
                  </div>
              <PostsList authorId={userId || (userData?.Id as string) || (userData?.id as string)} onChangeTab={changeTabFromPosts} />
                </div>
              )}

              {activeTab === 'add-post' && <AdPost post={post} onChangeTab={changeTabFromAdPosts} />}

              {activeTab === 'projects' && companyRole && (
                <div className={styles.tabContent}>
                  <div className={styles.tabActions}>
                    <h3 className={styles.sectionTitle}>المشاريع</h3>
                    <button className={`btn ${styles.btnAddCard}`} onClick={goToAddProject}>
                      إضافة مشروع
                    </button>
                  </div>
                  {loading ? (
                    <div className="row">
                      <div className="col-12 text-center">
                        <div className="spinner-border text-success" role="status">
                          <span className="visually-hidden">جاري التحميل...</span>
                        </div>
                        <p className="mt-2">جاري تحميل المشاريع...</p>
                      </div>
                    </div>
                  ) : projects.length > 0 ? (
                    <div className="row">
                      {projects.map((project: Project) => (
                        <div key={project.Id} className="col-md-6 mb-5">
                          <ProjectCard
                            project={project}
                            showActions={true}
                            onShare={() => openShareModal(project)}
                            onUpdate={updateProject}
                            onDelete={openDeleteProjectModal}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="row">
                      <div className="col-12">
                        <div className="alert alert-info text-center">لا توجد مشاريع متاحة حالياً</div>
                      </div>
                    </div>
                  )}
                  {projecttotalProjects > 0 && !loading && (
                    <div className={styles.paginationContainer}>
                      <nav aria-label="Page navigation">
                        <ul className="pagination justify-content-center">
                          <li className={`page-item ${projectisFirstPage() ? 'disabled' : ''}`}>
                            <a className="page-link" href="#" onClick={(e) => {
                              e.preventDefault();
                              projectgoToPreviousPage();
                            }}>
                              <i className="fas fa-chevron-right"></i>
                            </a>
                          </li>
                          {projectgetPageNumbers().map((pageNumber) => (
                            <li key={pageNumber} className={`page-item ${pageNumber === projectcurrentPage ? 'active' : ''}`}>
                              <a className="page-link" href="#" onClick={(e) => {
                                e.preventDefault();
                                projectgoToPage(pageNumber);
                              }}>
                                {pageNumber}
                              </a>
                            </li>
                          ))}
                          <li className={`page-item ${projectisLastPage() ? 'disabled' : ''}`}>
                            <a className="page-link" href="#" onClick={(e) => {
                              e.preventDefault();
                              projectgoToNextPage();
                            }}>
                              <i className="fas fa-chevron-left"></i>
                            </a>
                          </li>
                        </ul>
                      </nav>
                      <div className="pagination-info text-center mt-2">
                        <small className="text-muted">
                          صفحة {projectcurrentPage} من {projecttotalPages} (إجمالي {projecttotalProjects} مشروع)
                        </small>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteDialog && (
        <div className={styles.cancellationDialog} role="dialog">
          <div className={styles.dialogOverlay} onClick={toggleDeleteDialog}></div>
          <div className={styles.dialogContent}>
            <h3 className={styles.dialogTitle}>تأكيد الحذف</h3>
            <p className={styles.dialogMessage}>{getDeleteMessage()}</p>
            <div className={styles.dialogActions}>
              <button className="btn btn-success" onClick={confirmDelete}>
                {getDeleteButtonText()}
              </button>
              <button className={`btn ${styles.btnCancel}`} onClick={toggleDeleteDialog}>
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {selectedProject && (
        <ShareModal
          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/project-details/${selectedProject.Id}`}
          shareTitle={selectedProject.Name || ''}
          adId={String(selectedProject.Id || '')}
          userId={userId || null}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { propertyRequestsService } from '@/lib/services/property-requests';
import { showToast } from '@/lib/utils/toast';
import styles from './OrdersList.module.css';

interface OrdersListProps {
  userId?: string;
  filters?: any;
  searchTerm?: string;
  showActions?: boolean;
  onEditRequest?: (request: any) => void;
  onDeleteRequest?: (request: any) => void;
}

export default function OrdersList({ userId, filters = null, searchTerm = '', showActions = false, onEditRequest, onDeleteRequest }: OrdersListProps) {
  const [propertyRequests, setPropertyRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  const maxVisiblePages = 5;

  useEffect(() => {
    loadUserPropertyRequests();
  }, [currentPage, userId, searchTerm]);

  useEffect(() => {
    if (searchTerm !== undefined) {
      setCurrentPage(1);
      loadUserPropertyRequests();
    }
  }, [searchTerm]);

  const loadUserPropertyRequests = async () => {
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    const requestFilters = filters && Object.keys(filters).length > 0 ? filters : userId ? { UserId: userId } : {};

    const body = {
      Pagination: {
        PageNumber: currentPage,
        PageSize: pageSize,
        IsDescending: true,
        SearchTerm: searchTerm || '',
        Filters: requestFilters,
      },
    };

    try {
      const response = await propertyRequestsService.getUserPropertyRequests(body);
      if (response?.IsSuccess) {
        const data = response.Data as any;
        setPropertyRequests(data?.Items || []);
        setTotalPages(data?.TotalPages || 0);
        setTotalCount(data?.TotalCount || 0);
      } else {
        setHasError(true);
        const errorMsg = response?.Error || 'فشل في تحميل الطلبات';
        setErrorMessage(errorMsg);
        showToast(errorMsg, 'error');
      }
    } catch (error: any) {
      setIsLoading(false);
      setHasError(true);
      const errorMsg = 'حدث خطأ أثناء تحميل الطلبات';
      setErrorMessage(errorMsg);
      showToast(errorMsg, 'error');
      console.error('Error loading property requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const retryLoading = () => {
    loadUserPropertyRequests();
  };

  const getTypeLabel = (type: number): string => {
    const typeLabels: { [key: number]: string } = {
      0: 'طلب عقار',
      1: 'طلب وحدة',
      2: 'إيجار يومي',
      3: 'إعلان',
      4: 'طلب خاص',
      5: 'صيانة',
      99: 'أخرى',
    };
    return typeLabels[type] || 'غير محدد';
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
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

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const isFirstPage = (): boolean => {
    return currentPage === 1;
  };

  const isLastPage = (): boolean => {
    return currentPage >= totalPages;
  };

  return (
    <div className={styles.ordersTab}>
      {isLoading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-2">جاري تحميل الطلبات...</p>
        </div>
      )}

      {hasError && !isLoading && (
        <div className="alert alert-danger" role="alert">
          {errorMessage || 'حدث خطأ أثناء تحميل الطلبات'}
          <button className="btn btn-sm btn-outline-danger ms-2" onClick={retryLoading}>
            إعادة المحاولة
          </button>
        </div>
      )}

      {!isLoading && !hasError && propertyRequests.length === 0 && (
        <div className="alert alert-info" role="alert">
          لا توجد طلبات
        </div>
      )}

      {!isLoading && !hasError && propertyRequests.length > 0 && (
        <div className="container">
          <div className="row">
            <div className="col-12">
              {propertyRequests.map((request, index) => (
                <div key={request.Id} className={styles.apartmentCard} style={{ marginTop: index > 0 ? '20px' : '0' }}>
                  <div className={styles.userProfileSection + ' mb-3'}>
                    <div className="d-flex align-items-center">
                      <div className={styles.userAvatar + ' me-3'}>
                        {request.DisplayImageUrl ? (
                          <img
                            src={request.DisplayImageUrl}
                            alt={request.DisplayName || 'User'}
                            className={styles.profileImage}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/images/blank-profile.png';
                            }}
                          />
                        ) : (
                          <div className={styles.profileImagePlaceholder}>
                            <i className="fas fa-user"></i>
                          </div>
                        )}
                      </div>
                      <div className={styles.userInfo}>
                        <h6 className={styles.userName + ' mb-0'}>{request.DisplayName || 'مستخدم غير معروف'}</h6>
                        <small className="text-muted">{formatDateTime(request.CreatedAt)}</small>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col">
                      <div className={styles.apartmentContent}>
                        <h3 className={styles.apartmentTitle}>{request.Title}</h3>
                        <p className={styles.apartmentDescription}>{request.Description}</p>
                        <div className={styles.apartmentDetails}>
                          {request.City && (
                            <>
                              <span className={styles.detailItem}>المدينة:</span>
                              <span className={styles.detailValue}>{request.City}</span>
                            </>
                          )}
                          {request.District && (
                            <>
                              <span className={styles.detailItem}>الحي:</span>
                              <span className={styles.detailValue}>{request.District}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className={styles.apartmentTag}>{getTypeLabel(request.Type)}</div>
                    </div>
                  </div>
                  {showActions && (
                    <div className="d-flex justify-content-end gap-2 mt-3">
                      {onEditRequest && (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => onEditRequest(request)}
                          aria-label="تعديل الطلب"
                        >
                          <i className="fas fa-edit me-1"></i>
                          تعديل
                        </button>
                      )}
                      {onDeleteRequest && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => onDeleteRequest(request)}
                          aria-label="حذف الطلب"
                        >
                          <i className="fas fa-trash me-1"></i>
                          حذف
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {propertyRequests.length > 0 && !isLoading && !hasError && (
        <div className={styles.paginationContainer}>
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${isFirstPage() ? 'disabled' : ''}`}>
                <a
                  className="page-link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToPreviousPage();
                  }}
                  aria-disabled={isFirstPage()}
                >
                  <i className="fas fa-chevron-right"></i>
                </a>
              </li>

              {getPageNumbers().map((pageNumber) => (
                <li key={pageNumber} className={`page-item ${pageNumber === currentPage ? 'active' : ''}`}>
                  <a
                    className="page-link"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </a>
                </li>
              ))}

              <li className={`page-item ${isLastPage() ? 'disabled' : ''}`}>
                <a
                  className="page-link"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    goToNextPage();
                  }}
                  aria-disabled={isLastPage()}
                >
                  <i className="fas fa-chevron-left"></i>
                </a>
              </li>
            </ul>
          </nav>

          <div className="pagination-info text-center mt-2">
            <small className="text-muted">
              صفحة {currentPage} من {totalPages} (إجمالي {totalCount} طلب)
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

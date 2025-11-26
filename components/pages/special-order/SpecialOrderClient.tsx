'use client';

import { useState, useEffect } from 'react';
import { specialOrderService } from '@/lib/services/special-order';
import Search from '@/components/shared/search/Search';
import Filters, { FilterOptions } from '@/components/shared/list/filters/Filters';
import AdsListings from '@/components/shared/list/ads-listings/AdsListings';
import MobileFilterButton from '@/components/shared/list/mobile-filter-button/MobileFilterButton';
import MobileFilterDrawer from '@/components/shared/list/mobile-filter-drawer/MobileFilterDrawer';

export default function SpecialOrderClient() {
  const [ads, setAds] = useState<any[]>([]);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchAds = async () => {
    setIsLoading(true);

    const requestPayload = {
      Pagination: {
        PageNumber: currentPage,
        PageSize: pageSize,
        SortBy: '',
        IsDescending: true,
        SearchTerm: searchTerm,
        Filters: currentFilters,
      },
    };

    try {
      const response = await specialOrderService.getAdvertisements(requestPayload);
      if (response?.IsSuccess || response?.Success) {
        const data = response.Data as any;
        setAds(data?.Items || []);
        setTotalPages(data?.TotalPages || 0);
        setTotalCount(data?.TotalCount || 0);
      } else {
        console.error('SpecialOrder - API returned error:', response?.Message);
      }
    } catch (error) {
      console.error('SpecialOrder - Error fetching ads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [currentPage, searchTerm, currentFilters]);

  const onFiltersChanged = (filters: FilterOptions) => {
    const prevKey = JSON.stringify(currentFilters || {});
    const nextKey = JSON.stringify(filters || {});
    if (prevKey === nextKey) {
      return;
    }
    setCurrentFilters(filters);
    setCurrentPage(1);
  };

  const onSearchChanged = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = (): number[] => {
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
    <div className="container mt-4" aria-label="صفحة طلبات التسويق">
      {/* Search Component */}
      <div className="row">
        <div className="col-12">
          <Search onSearchChanged={onSearchChanged} placeholder="ابحث في طلبات التسويق" />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-5" aria-live="polite">
          <div className="spinner-border text-primary" role="status" aria-label="جاري التحميل">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-3">جاري تحميل طلبات التسويق...</p>
        </div>
      )}

      {/* Mobile Filter Button */}
      <div className="row mb-3 d-md-none">
        <div className="col-12">
          <MobileFilterButton onOpenFilters={() => setIsMobileFilterOpen(true)} />
        </div>
      </div>

      {/* Content */}
      {!isLoading && (
        <div className="row">
          {/* Filters - Right Side (hidden on mobile) */}
          <div className="col-md-3 col-lg-3 mb-4 d-none d-md-block">
            <Filters parentComponentId="special-order" onFiltersChanged={onFiltersChanged} />
          </div>

          <div className="col-md-1 col-lg-1 mb-4 d-none d-md-block">
            {/* Spacer */}
          </div>

          {/* Listings - Left Side */}
          <div className="col-12 col-md-8 col-lg-8">
            <div className="listings-header mb-3">
              <h5>طلبات التسويق ({totalCount})</h5>
            </div>
            <AdsListings
              ads={ads}
              type="special_order"
              showActions={false}
            />
          </div>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        onFiltersChanged={(filters) => {
          setCurrentFilters(filters);
          setIsMobileFilterOpen(false);
        }}
      />
    </div>
  );
}


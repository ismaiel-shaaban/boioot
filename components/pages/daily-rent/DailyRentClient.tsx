'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { dailyRentService } from '@/lib/services/daily-rent';
import { useAdTypeFilter } from '@/lib/contexts/AdTypeFilterContext';
import Search from '@/components/shared/search/Search';
import Filters, { FilterOptions } from '@/components/shared/list/filters/Filters';
import AdsListings from '@/components/shared/list/ads-listings/AdsListings';
import MobileFilterButton from '@/components/shared/list/mobile-filter-button/MobileFilterButton';
import MobileFilterDrawer from '@/components/shared/list/mobile-filter-drawer/MobileFilterDrawer';

export default function DailyRentClient() {
  const { selectedAdType, setSelectedAdType } = useAdTypeFilter();
  const [ads, setAds] = useState<any[]>([]);
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Use refs to prevent unnecessary re-renders
  const lastFiltersRef = useRef<string>('');
  const lastSearchRef = useRef<string>('');
  const lastPageRef = useRef<number>(1);
  const isFetchingRef = useRef<boolean>(false);
  const currentFiltersRef = useRef<FilterOptions>({});
  const searchTermRef = useRef<string>('');

  const fetchAds = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) {
      return;
    }

    // Get current values from refs
    const currentFiltersValue = currentFiltersRef.current || {};
    const currentSearchValue = searchTermRef.current || '';
    const currentPageValue = lastPageRef.current;

    const filtersKey = JSON.stringify(currentFiltersValue);
    const searchKey = currentSearchValue;
    const pageKey = currentPageValue;

    // Check if anything actually changed
    if (
      lastFiltersRef.current === filtersKey &&
      lastSearchRef.current === searchKey &&
      lastPageRef.current === pageKey
    ) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);

    const requestPayload = {
      Pagination: {
        PageNumber: pageKey,
        PageSize: pageSize,
        SortBy: '',
        IsDescending: true,
        SearchTerm: searchKey,
        Filters: currentFiltersValue,
      },
    };

    try {
      const response = await dailyRentService.getAdvertisements(requestPayload);
      if (response?.IsSuccess || response?.Success) {
        const data = response.Data as any;
        // Map ads to ensure CoverImageUrl is set correctly
        const mappedAds = (data?.Items || []).map((item: any) => ({
          ...item,
          CoverImageUrl: item.MainImageUrl || item.ImageUrl || item.CoverImage || item.Image || item.MediaUrls?.[0] || null,
          Id: String(item.Id || item.id || item.ID || ''),
        }));
        setAds(mappedAds);
        setTotalPages(data?.TotalPages || 0);
        setTotalCount(data?.TotalCount || 0);
        // Update refs after successful fetch
        lastFiltersRef.current = filtersKey;
        lastSearchRef.current = searchKey;
        lastPageRef.current = pageKey;
      } else {
        console.error('DailyRent - API returned error:', response?.Message);
      }
    } catch (error) {
      console.error('DailyRent - Error fetching ads:', error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [pageSize]);

  // Handle ad type selection from navbar - update filters directly
  useEffect(() => {
    if (selectedAdType) {
      const updatedFilters = { ...currentFiltersRef.current };
      
      if (selectedAdType.unitType === null) {
        // "الكل" (All) was selected - remove unitType filter
        delete updatedFilters.unitType;
      } else {
        // Specific type was selected - add/update unitType filter
        updatedFilters.unitType = selectedAdType.unitType;
      }
      
      // Clear the refs to force fetch
      lastFiltersRef.current = '';
      currentFiltersRef.current = updatedFilters;
      setCurrentFilters(updatedFilters);
      setCurrentPage(1);
      
      // Clear the selected ad type to avoid infinite loops
      setSelectedAdType(null);
    }
  }, [selectedAdType, setSelectedAdType]);

  // Update refs when state changes and trigger fetch
  useEffect(() => {
    const filtersKey = JSON.stringify(currentFilters || {});
    const filtersChanged = lastFiltersRef.current !== filtersKey;
    const searchChanged = lastSearchRef.current !== searchTerm;
    const pageChanged = lastPageRef.current !== currentPage;

    // Update refs
    if (filtersChanged) {
      currentFiltersRef.current = currentFilters;
    }

    if (searchChanged) {
      searchTermRef.current = searchTerm;
    }

    if (pageChanged) {
      lastPageRef.current = currentPage;
    }

    // Only fetch if something actually changed
    if (filtersChanged || searchChanged || pageChanged) {
      fetchAds();
    }
  }, [currentPage, searchTerm, currentFilters, fetchAds]);

  const onFiltersChanged = useCallback((filters: FilterOptions) => {
    const prevKey = JSON.stringify(currentFiltersRef.current || {});
    const nextKey = JSON.stringify(filters || {});
    if (prevKey === nextKey) {
      return;
    }
    // Update filters and reset page
    lastFiltersRef.current = '';
    currentFiltersRef.current = filters;
    setCurrentFilters(filters);
    setCurrentPage(1);
  }, []);

  const onSearchChanged = useCallback((term: string) => {
    if (searchTermRef.current === term) {
      return;
    }
    // Clear the ref to force fetch
    lastSearchRef.current = '';
    searchTermRef.current = term;
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  }, [currentPage, totalPages]);

  const handleOpenMobileFilter = useCallback(() => {
    setIsMobileFilterOpen(true);
  }, []);

  const handleCloseMobileFilter = useCallback(() => {
    setIsMobileFilterOpen(false);
  }, []);

  return (
    <div className="container mt-4" aria-label="صفحة الإيجار اليومي">
      {/* Search Component */}
      <div className="row">
        <div className="col-12">
          <Search onSearchChanged={onSearchChanged} placeholder="ابحث في عروض الإيجار اليومي" />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-5" aria-live="polite">
          <div className="spinner-border text-primary" role="status" aria-label="جاري التحميل">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-3">جاري تحميل عروض الإيجار اليومي...</p>
        </div>
      )}

      {/* Mobile Filter Button */}
      <div className="row mb-3 d-md-none">
        <div className="col-12">
          <MobileFilterButton onOpenFilters={handleOpenMobileFilter} />
        </div>
      </div>

      {/* Content */}
      {!isLoading && (
        <div className="row">
          {/* Filters - Right Side (hidden on mobile) */}
          <div className="col-md-3 col-lg-3 mb-4 d-none d-md-block">
            <Filters 
              parentComponentId="daily-rent" 
              onFiltersChanged={onFiltersChanged}
              externalUnitType={currentFilters?.unitType || null}
            />
          </div>

          <div className="col-md-1 col-lg-1 mb-4 d-none d-md-block">
            {/* Spacer */}
          </div>

          {/* Listings - Left Side */}
          <div className="col-12 col-md-8 col-lg-8">
            <div className="listings-header mb-3">
              <h5>عروض الإيجار اليومي ({totalCount})</h5>
            </div>
            <AdsListings
              ads={ads}
              type="daily_rent"
              showActions={false}
            />
          </div>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={handleCloseMobileFilter}
        onFiltersChanged={onFiltersChanged}
      />
    </div>
  );
}


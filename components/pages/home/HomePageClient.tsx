'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { advertisementService } from '@/lib/services/advertisement';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useAdTypeFilter } from '@/lib/contexts/AdTypeFilterContext';
import Search from '@/components/shared/search/Search';
import Filters, { FilterOptions } from '@/components/shared/list/filters/Filters';
import AdsListings from '@/components/shared/list/ads-listings/AdsListings';
import MobileFilterButton from '@/components/shared/list/mobile-filter-button/MobileFilterButton';
import MobileFilterDrawer from '@/components/shared/list/mobile-filter-drawer/MobileFilterDrawer';
import styles from './HomePageClient.module.css';

export default function HomePageClient() {
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

  const slides = useMemo(() => [
    '/assets/images/hero.jpeg',
    '/assets/images/property2.jpeg',
    '/assets/images/property3.jpg'
  ], []);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);
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

    // Get current values from refs (which are updated by state)
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
      const response = await advertisementService.getAdvertisements(requestPayload);
      if (response.IsSuccess || response.Success) {
        const data = response.Data as any;
        setAds(data?.Items || []);
        setTotalPages(data?.TotalPages || 0);
        setTotalCount(data?.TotalCount || 0);
        // Update refs after successful fetch
        lastFiltersRef.current = filtersKey;
        lastSearchRef.current = searchKey;
        lastPageRef.current = pageKey;
      } else {
        console.error('HomePage - API returned error:', response.Message);
      }
    } catch (error) {
      console.error('HomePage - Error fetching ads:', error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [pageSize]);

  // Handle ad type selection from navbar - update filters directly without triggering Filters component
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
    
    // Update refs immediately
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

  const startAutoSlide = useCallback(() => {
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
    }
    slideIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    startAutoSlide();
  }, [startAutoSlide]);

  const scrollToHomeContent = useCallback(() => {
    const element = document.getElementById('home-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [startAutoSlide]);

  const onFiltersChanged = useCallback((filters: FilterOptions) => {
    const prevKey = JSON.stringify(currentFiltersRef.current || {});
    const nextKey = JSON.stringify(filters || {});
    if (prevKey === nextKey) {
      return;
    }
    // Update filters and reset page
    lastFiltersRef.current = '';
    currentFiltersRef.current = filters;
    // Use functional update to prevent unnecessary re-renders if value is the same
    setCurrentFilters((prev) => {
      const prevKey2 = JSON.stringify(prev || {});
      if (prevKey2 === nextKey) {
        return prev; // Return same reference if unchanged
      }
      return filters;
    });
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

  const pageNumbers = useMemo(() => {
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
  }, [currentPage, totalPages]);

  const handleOpenMobileFilter = useCallback(() => {
    setIsMobileFilterOpen(true);
  }, []);

  const handleCloseMobileFilter = useCallback(() => {
    setIsMobileFilterOpen(false);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroSlider}>
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
            >
              <Image
                src={slide}
                alt={`عقار ${index + 1}`}
                fill
                sizes="100vw"
                style={{ objectFit: 'cover' }}
                priority={index === 0}
              />
            </div>
          ))}

          {/* Navigation Buttons */}
          <button className={`${styles.navBtn} ${styles.prev}`} onClick={prevSlide}>
            &#10094;
          </button>
          <button className={`${styles.navBtn} ${styles.next}`} onClick={nextSlide}>
            &#10095;
          </button>

          {/* Dots */}
          <div className={styles.dots}>
            {slides.map((_, index) => (
              <span
                key={index}
                className={index === currentSlide ? styles.active : ''}
                onClick={() => goToSlide(index)}
              ></span>
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>شارك طلبك . . . وخلي العروض تجي لعندك</h1>
          <p className={styles.heroSubtitle}>
            انشر طلبك في قسم الطلبات الخاصة وخلي الملاك والمكاتب يتواصلوا معك.
          </p>
          <button className={styles.heroBtn} onClick={scrollToHomeContent}>
            ابدأ الآن
          </button>

          <div className={styles.heroSubsection}>
            <h2>لأن العقار رحلة . . . شاركها مع الآخرين</h2>
            <p>في مجتمع بيوت . . . تواصل مع الآخرين واستفد من تجاربهم.</p>
          </div>
        </div>
      </section>

      <div className="container mt-4 bg-blend-lighten" aria-label="الصفحة الرئيسية" id="home-content">
        {/* Search Component */}
        <div className="row">
          <div className="col-12">
            <Search onSearchChanged={onSearchChanged} placeholder="ابحث في جميع الاعلانات" />
          </div>
        </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-5" aria-live="polite">
          <div className="spinner-border text-primary" role="status" aria-label="جاري التحميل">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-3">جاري تحميل العقارات...</p>
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
              parentComponentId="home" 
              onFiltersChanged={onFiltersChanged}
              externalUnitType={currentFilters?.unitType || null}
            />
          </div>

          <div className="col-md-1 col-lg-1 mb-4 d-none d-md-block">
            {/* Spacer */}
          </div>

          {/* Listings - Left Side */}
          <div className="col-12 col-md-8 col-lg-8">
            <div className={styles.listingsHeader + ' mb-3'}>
              <h5 aria-label="عدد الإعلانات المتاحة">الاعلانات المتاحة ({totalCount})</h5>
            </div>
            <AdsListings
              ads={ads}
              type="ads"
            />
            
            {/* Pagination - Like Angular */}
            {ads.length > 0 && (
              <nav aria-label="انتقال صفحات الإعلانات">
                <ul className="pagination justify-content-center">
                  {/* Previous Button */}
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={previousPage}
                      disabled={currentPage === 1}
                      aria-label="الصفحة السابقة"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </li>
                  {/* Page Numbers */}
                  {pageNumbers.map((p) => (
                    <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => goToPage(p)}
                        aria-label="الانتقال إلى الصفحة"
                      >
                        {p}
                      </button>
                    </li>
                  ))}
                  {/* Next Button */}
                  <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={nextPage}
                      disabled={currentPage >= totalPages}
                      aria-label="الصفحة التالية"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
            
            {ads.length === 0 && !isLoading && (
              <div className="no-results text-center py-5" aria-label="لا توجد عقارات متاحة">
                <h4>لا توجد عقارات متاحة</h4>
                <p className="text-muted">جرب تعديل الفلاتر أو البحث للعثور على عقارات أخرى</p>
              </div>
            )}
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
    </>
  );
}


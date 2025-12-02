'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { favoritesService } from '@/lib/services/favorites';
import { currencyService } from '@/lib/services/currency';
import styles from './FavoritesDropdown.module.css';

interface FavoritesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FavoritesDropdown({ isOpen, onClose }: FavoritesDropdownProps) {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadFavorites();
    }
  }, [isOpen]);

  const loadFavorites = async () => {
    try {
      const response = await favoritesService.getFavourites({});
      if (response?.IsSuccess || response?.Success) {
        // Handle response data structure - could be array directly or wrapped
        const data = response.Data as any;
        if (Array.isArray(data)) {
          setFavorites(data);
        } else if (data?.Items) {
          setFavorites(data.Items);
        } else if (data?.Items && Array.isArray(data.Items)) {
          setFavorites(data.Items);
        } else {
          // Try to flatten if data contains arrays
          const allFavorites = [
            ...(data?.Ads || []),
            ...(data?.Projects || []),
            ...(data?.DailyRentUnits || []),
            ...(data?.SpecialOrders || []),
            ...(data?.Units || [])
          ];
          setFavorites(allFavorites);
        }
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    }
  };

  const onItemClick = () => {
    onClose();
  };

  const getItemRoute = (item: any): string => {
    switch (item?.Source) {
      case 0:
        return `/ad-details/${item.Id}`;
      case 3:
        return `/project-details/${item.Id}`;
      case 2:
        return `/daily-rent-details/${item.Id}`;
      case 4:
        return `/ad-unit-details/${item.Id}`;
      case 1:
        return `/special-order-details/${item.Id}`;
      default:
        return '/';
    }
  };

  const getTypeLabel = (type: any): string => {
    switch (type) {
      case 0:
        return 'إعلان عقار';
      case 3:
        return 'مشروع عقاري';
      case 4:
        return 'وحدات';
      case 2:
        return 'إيجار يومي';
      case 1:
        return 'طلب خاص';
      default:
        return '';
    }
  };

  const getPrice = (price: number): string => {
    if (!price || price <= 0) return 'السعر غير متوفر';
    return currencyService.formatCurrencyWithConversion(price);
  };

  const getDurationLabel = (DurationLabel: any): string => {
    const labelStr = String(DurationLabel).toLowerCase();
    if (labelStr === '1' || labelStr === 'monthly') {
      return 'شهري';
    }
    if (labelStr === '3' || labelStr === 'yearly') {
      return 'سنوي';
    }
    return DurationLabel;
  };

  const viewAllFavorites = () => {
    onClose();
    router.push('/favorites');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Desktop Favorites Dropdown */}
      <div
        className={`${styles.favoritesDropdown} ${isOpen ? styles.show : ''} d-none d-md-block`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        data-favorites-dropdown="true"
        role="dialog"
        aria-label="قائمة المفضلة"
      >
        <div className={styles.dropdownHeader}>
          <h6 className={styles.dropdownTitle}>المفضلة</h6>
          <div className={styles.headerActions}>
            <span className={styles.favoritesCount} onClick={viewAllFavorites} aria-label="عرض جميع العناصر المفضلة">
              الكل
            </span>
            <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="إغلاق قائمة المفضلة">
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>

        <div className={styles.dropdownBody}>
          {favorites.length === 0 ? (
            <div className={styles.noFavorites}>
              <div className={styles.noFavoritesIcon}>
                <i className="fa-regular fa-heart"></i>
              </div>
              <p className={styles.noFavoritesText}>لا توجد عناصر مفضلة</p>
              <small className={styles.noFavoritesSubtext}>أضف عناصر إلى المفضلة لتظهر هنا</small>
            </div>
          ) : (
            <div className={styles.favoritesList} aria-label="قائمة العناصر المفضلة">
              {favorites.map((item) => (
                <Link key={item.Id} href={getItemRoute(item)} className={styles.favoriteItem} onClick={onItemClick}>
                  <div className={styles.favoriteImage}>
                    <img
                      src={item?.ImageUrl || '/assets/images/no_image.png'}
                      alt={item?.Title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/no_image.png';
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div className={styles.favoriteContent}>
                    <div className={styles.favoriteHeader}>
                      <h6 className={styles.favoriteTitle}>{item?.Title}</h6>
                      <span className={styles.favoriteType}>{getTypeLabel(item?.Source)}</span>
                    </div>
                    <div className={styles.favoriteDetails}>
                      {item?.RentPrice && (
                        <div className={styles.favoritePrice}>
                          <i className="fa-solid fa-tag"></i>
                          <span>
                            {item?.Source !== 2
                              ? `${getPrice(item.RentPrice)} ${getDurationLabel(item.DurationLabel)}`
                              : getPrice(item.RentPrice)}
                          </span>
                        </div>
                      )}
                      {item?.District && (
                        <div className={styles.favoriteLocation}>
                          <i className="fa-solid fa-location-dot"></i>
                          <span>
                            {item.District}, {item.City}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Favorites Modal */}
      <div 
        className={`${styles.mobileFavoritesModal} d-md-none`} 
        onClick={(e) => {
          // Only close if clicking directly on the overlay, not on the content
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        role="dialog" 
        aria-label="قائمة المفضلة على الجوال"
      >
        <div 
          className={styles.mobileModalContent} 
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className={styles.mobileModalHeader}>
            <h5>المفضلة</h5>
            <div className={styles.mobileHeaderActions}>
              <span className={styles.mobileFavoritesCount} onClick={viewAllFavorites}>
                الكل
              </span>
              <button className={styles.mobileCloseBtn} onClick={onClose}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          </div>

          <div className={styles.mobileModalBody}>
            <div className={styles.mobileFavoritesList}>
              {favorites.length === 0 ? (
                <div className={styles.mobileNoFavorites}>
                  <div className={styles.noFavoritesIcon}>
                    <i className="fa-regular fa-heart"></i>
                  </div>
                  <p className={styles.noFavoritesText}>لا توجد عناصر مفضلة</p>
                  <small className={styles.noFavoritesSubtext}>أضف عناصر إلى المفضلة لتظهر هنا</small>
                </div>
              ) : (
                favorites.map((item) => (
                  <Link
                    key={item.Id}
                    href={getItemRoute(item)}
                    className={styles.mobileFavoriteItem}
                    onClick={onItemClick}
                  >
                    <div className={styles.mobileFavoriteImage}>
                      <img
                        src={item?.ImageUrl || '/assets/images/no_image.png'}
                        alt={item?.Title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/no_image.png';
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className={styles.mobileFavoriteContent}>
                      <div className={styles.mobileFavoriteHeader}>
                        <h6 className={styles.mobileFavoriteTitle}>{item?.Title}</h6>
                        <span className={styles.mobileFavoriteType}>{getTypeLabel(item?.Source)}</span>
                      </div>
                      <div className={styles.mobileFavoriteDetails}>
                        {item?.RentPrice && (
                          <div className={styles.mobileFavoritePrice}>
                            <i className="fa-solid fa-tag"></i>
                            <span>
                              {item?.Source !== 2
                                ? `${getPrice(item.RentPrice)} ${getDurationLabel(item.DurationLabel)}`
                                : getPrice(item.RentPrice)}
                            </span>
                          </div>
                        )}
                        {item?.District && (
                          <div className={styles.mobileFavoriteLocation}>
                            <i className="fa-solid fa-location-dot"></i>
                            <span>
                              {item.District}, {item.City}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


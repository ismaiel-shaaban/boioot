'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { currencyService } from '@/lib/services/currency';
import { useAuth } from '@/lib/contexts/AuthContext';
import { advertisementService } from '@/lib/services/advertisement';
import { specialOrderService } from '@/lib/services/special-order';
import { dailyRentService } from '@/lib/services/daily-rent';
import { projectsService } from '@/lib/services/projects';
import { showToast } from '@/lib/utils/toast';
import { unitTypesService } from '@/lib/services/unit-types';
import { Ad } from '@/components/shared/list/ads-listings/AdsListings';
import styles from './AdCard.module.css';

interface AdCardProps {
  ad: Ad;
  type: string;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  onFavoriteToggled?: (ad: Ad) => void;
}

export default function AdCard({ ad, type, onShare, onEdit, onDelete, showActions = false, onFavoriteToggled }: AdCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(ad.IsFavorite || false);
  const [unitTypes, setUnitTypes] = useState<any[]>([]);

  useEffect(() => {
    setIsFavorite(ad.IsFavorite || false);
  }, [ad.IsFavorite]);

  useEffect(() => {
    loadUnitTypes();
  }, []);

  const loadUnitTypes = async () => {
    try {
      const response = await unitTypesService.getPropertyTypes();
      if (response && Array.isArray(response)) {
        setUnitTypes(response);
      }
    } catch (error) {
      console.error('Error loading unit types:', error);
    }
  };

  const viewAdDetails = (id: string) => {
    if (type === 'special_order') {
      router.push(`/special-order-details/${id}`);
    } else if (type === 'daily_rent') {
      router.push(`/daily-rent-details/${id}`);
    } else if (type === 'ads') {
      router.push(`/ad-details/${id}`);
    } else if (type === 'unit_project' || type === 'units') {
      router.push(`/ad-unit-details/${id}`);
    }
  };

  const formatPriceWithConversion = (price: number, isUsd?: boolean): string => {
    if (!price) return '';
    const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    if (isNaN(numPrice)) return price.toString();
    return currencyService.formatPriceByCurrency(numPrice, isUsd);
  };

  const getPaymentFrequency = (paymentFrequency?: any): string => {
    if (!paymentFrequency) return '';
    const contractDurations = [
      { label: 'دفعه واحده', value: 1 },
      { label: 'اكتر من دفعه', value: 2 }
    ];
    const matchedDuration = contractDurations.find((duration: any) => duration.value === paymentFrequency);
    return matchedDuration ? matchedDuration.label : '';
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('الرجاء تسجيل الدخول أولاً للاعجاب بالوحده', 'warning');
      return;
    }

    try {
      let response;
      if (type === 'special_order') {
        response = await specialOrderService.likeAdvertisement(ad.Id);
      } else if (type === 'daily_rent') {
        response = await dailyRentService.likeAdvertisement(ad.Id);
      } else if (type === 'ads') {
        response = await advertisementService.likeAdvertisement(ad.Id);
      } else if (type === 'units' || type === 'unit_project') {
        response = await projectsService.likeUnit(ad.Id);
      } else {
        return;
      }

      if (response?.IsSuccess) {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState);
        showToast(newFavoriteState ? 'تم الاعجاب بالوحده بنجاح' : 'تم الغاء الاعجاب بالوحده', 'success');
        if (onFavoriteToggled) {
          onFavoriteToggled({ ...ad, IsFavorite: newFavoriteState });
        }
      } else {
        showToast('حدث خطأ ما', 'error');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('حدث خطأ ما', 'error');
    }
  };

  const shareProject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare();
    }
  };

  // Get unit type label
  const getUnitTypeLabel = (unitType: number | undefined): string => {
    if (!unitType) return '';
    const matchedType = unitTypes.find((property: any) => property.value === unitType);
    return matchedType ? matchedType.label : unitType.toString();
  };

  return (
    <div className={styles.adCard} data-type={type} data-featured={ad.IsFeatured ? 'true' : 'false'} role="region" aria-label="بطاقة إعلان">
      <div className="row g-0">
        <div className={`col-md-6 ${styles.adImage}`}>
          <img
            src={ad.CoverImageUrl || '/assets/images/no_image.png'}
            alt={ad.Title}
            className="img-fluid"
            onClick={() => viewAdDetails(ad.Id)}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/no_image.png';
            }}
            aria-label="صورة الإعلان"
          />

          {/* Featured Star Badge */}
          {ad.IsFeatured && (
            <div className={styles.featuredBadge} aria-label="إعلان مميز">
              <i className="fas fa-star"></i>
            </div>
          )}

            <button
              className={`${styles.actionBtn} ${styles.favoriteBtn}`}
              onClick={toggleFavorite}
              aria-label="إضافة أو إزالة من المفضلة"
            >
              <i className={isFavorite ? 'fas fa-heart text-danger' : 'far fa-heart'}></i>
            </button>
          <button
            className={`${styles.actionBtn} ${styles.shareBtn}`}
            onClick={shareProject}
            aria-label="مشاركة الإعلان"
          >
            <i className="fas fa-share-alt"></i>
          </button>
        </div>

        <div className={`col-md-6 ${styles.adInfo}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className={styles.price}>
              {type !== 'daily_rent' && type !== 'units'
                ? formatPriceWithConversion(parseFloat(ad.RentPrice || '0'), ad.IsUsd)
                : type === 'daily_rent'
                ? formatPriceWithConversion(parseFloat(ad.RentPrice || '0'), ad.IsUsd)
                : formatPriceWithConversion(ad.Price || 0, ad.IsUsd)}
            </div>
            {type !== 'daily_rent' && type !== 'units' && (
              <div className={styles.paymentType}>{getPaymentFrequency(ad.PaymentFrequency)}</div>
            )}
          </div>

          <div className={styles.location}>{ad.Title}</div>

          <div className={styles.adFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureValue}>{ad.Area}</span>
              <i className="fas fa-vector-square"></i>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureValue}>{ad.Halls}</span>
              <i className="fas fa-utensils"></i>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureValue}>{ad.Bathrooms}</span>
              <i className="fas fa-bath"></i>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureValue}>{ad.Rooms}</span>
              <i className="fas fa-bed"></i>
            </div>
          </div>

          <div className={styles.adDetails}>
            {ad.Description}
            <br />
            {ad.District}, {ad.City}
          </div>

          {ad.SerialNumber && (
            <div className={styles.serialNumberBottom}>
              <span className={styles.serialLabel}> رقم الإعلان : </span>
              <span className={styles.serialValue}>{ad.SerialNumber}</span>
            </div>
          )}

          <div className={styles.detailsBtnContainer}>
            <div className={styles.footerRow}>
              <span className={styles.adType}>{getUnitTypeLabel(ad.UnitType)}</span>
              <div className={styles.actionButtons}>
                {showActions && (
                  <div className={styles.profileActions}>
                    <button
                      className={`${styles.btnEditSmall}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onEdit) onEdit();
                      }}
                      title="تعديل"
                      aria-label="تعديل الإعلان"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className={`${styles.btnDeleteSmall}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (onDelete) onDelete();
                      }}
                      title="حذف"
                      aria-label="حذف الإعلان"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                )}
                <button
                  className={styles.backBtn}
                  onClick={() => viewAdDetails(ad.Id)}
                  aria-label="عرض تفاصيل الإعلان"
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


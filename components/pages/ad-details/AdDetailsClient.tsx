'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { advertisementService } from '@/lib/services/advertisement';
import { showToast } from '@/lib/utils/toast';
import AdGallery from '@/components/shared/ad-details/ad-gallery/AdGallery';
import AdInfo from '@/components/shared/ad-details/ad-info/AdInfo';
import AdFeatures from '@/components/shared/ad-details/ad-features/AdFeatures';
import AdMap from '@/components/shared/ad-details/ad-map/AdMap';
import AgentInfo from '@/components/shared/ad-details/agent-info/AgentInfo';
import PaymentOptions from '@/components/shared/ad-details/payment-options/PaymentOptions';
import SimilarAds from '@/components/shared/ad-details/similar-ads/SimilarAds';
import styles from './AdDetailsClient.module.css';

interface AdDetailsClientProps {
  adId: string;
}

export default function AdDetailsClient({ adId }: AdDetailsClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [unit, setUnit] = useState<any>(null);
  const [ad, setAd] = useState<any>(null);
  const [similarAds, setSimilarAds] = useState<any[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoModalTitle, setVideoModalTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const videoThumbnailRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    getAdDetails();
    getSimilarAds();
  }, [adId]);

  const getAdDetails = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await advertisementService.getAdvertisementById(adId);
      if (response?.IsSuccess && response?.Data) {
        setUnit(response.Data);
        mapApiDataToAd(response.Data as any);
      } else {
        setHasError(true);
        setErrorMessage(response?.Message || 'فشل في تحميل تفاصيل الإعلان');
        showToast('فشل في تحميل تفاصيل الإعلان', 'error');
      }
    } catch (error: any) {
      setIsLoading(false);
      setHasError(true);
      setErrorMessage(error.message || 'حدث خطأ أثناء تحميل الإعلان');
      showToast('حدث خطأ أثناء تحميل الإعلان', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, isUsd?: boolean): string => {
    if (!price || price <= 0) return 'السعر غير متوفر';

    if (isUsd) {
      return `${price.toLocaleString('ar-SA')} دولار`;
    } else {
      return `${price.toLocaleString('ar-SA')} ليرة`;
    }
  };

  const getAdAge = (age: number): string => {
    const propertyAgeOptions = [
      { id: 0, label: 'جديد' },
      { id: 1, label: '1-5 سنوات' },
      { id: 2, label: '6-10 سنوات' },
      { id: 3, label: 'أكثر من 10 سنوات' }
    ];
    return propertyAgeOptions.find(option => option.id === age)?.label || 'غير محدد';
  };

  const getAdType = (audience: number): string => {
    const audienceOptions = [
      { id: 0, label: 'عائلي' },
      { id: 1, label: 'أعزب' },
      { id: 2, label: 'الكل' }
    ];
    return audienceOptions.find(option => option.id === audience)?.label || 'غير محدد';
  };

  const getPaymentFrequency = (durationNum: any): string => {
    const contractDurations = [
      { label: 'دفعه واحده', value: 1 },
      { label: 'اكتر من دفعه', value: 2 }
    ];
    const matchedDuration = contractDurations.find((duration: any) => duration.value === durationNum);
    return matchedDuration ? matchedDuration.label : 'نوع غير معروف';
  };

  const mapApiDataToAd = (apiData: any) => {
    // Filter media for images and videos
    let images = apiData?.MediaUrls?.filter((media: any) => {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const mediaUrl = typeof media === 'string' ? media : media.url || media.Url || '';
      return imageExtensions.some((ext) => mediaUrl.toLowerCase().endsWith(ext));
    }) || [];
    
    let images2 = images.map((image: any) => ({
      url: typeof image === 'string' ? image : image.url || image.Url || image,
      alt: 'Ad Image'
    })) || [];

    const video = apiData?.MediaUrls?.find((media: any) => {
      const videoExtensions = ['.mp4', '.avi', '.mov', '.webm'];
      const mediaUrl = typeof media === 'string' ? media : media.url || media.Url || '';
      return videoExtensions.some((ext) => mediaUrl.toLowerCase().endsWith(ext));
    });

    const mappedAd = {
      Id: apiData?.Id || 0,
      Title: apiData?.Title || 'عنوان غير متوفر',
      Description: apiData?.Description || 'لا يوجد وصف متاح',
      RentPrice: formatPrice(apiData?.RentPrice || apiData?.Price, apiData?.IsUsd),
      paymentType: (apiData?.PaymentFrequency == 1 || apiData?.PaymentFrequency == '1') ? 'شهري' : 'سنوي',
      Features: apiData?.FeatureNames || apiData?.Features || [],
      MediaUrls: images2,
      mapCoordinates: {
        lat: apiData?.Latitude || apiData?.mapCoordinates?.lat || 0,
        lng: apiData?.Longitude || apiData?.mapCoordinates?.lng || 0
      },
      agent: {
        id: apiData?.UserId || 0,
        name: apiData?.UserFullName || '',
        image: apiData?.UserProfileImageUrl || '',
        rating: 0,
        reviewsCount: 0,
        phone: apiData?.UserPhoneNumber || '',
        whatsapp: apiData?.UserPhoneNumber || ''
      },
      videoUrl: video ? (typeof video === 'string' ? video : video.url || video.Url || video) : undefined,
      projectAdNum: apiData?.AdCount || 0,
      SerialNumber: apiData?.SerialNumber || 'رقم الإعلان غير متوفر',
      CreatedAt: apiData?.CreatedAt || '',
      LastModifiedAt: apiData?.LastModifiedAt || '',
      ViewCount: apiData?.ViewCount || 0,
      PropertyAge: getAdAge(apiData?.PropertyAge),
      Area: apiData?.Area || 0,
      Rooms: apiData?.Rooms || 0,
      Bathrooms: apiData?.Bathrooms || 0,
      Floor: apiData?.Floor || 0,
      Halls: apiData?.Halls || 0,
      Audience: getAdType(Number(apiData?.Audience)),
      City: apiData?.City || 'المدينة غير متوفرة',
      District: apiData?.District || 'الحي غير متوفر',
      paymentOptions: apiData?.paymentOptions || [{ 
        amount: formatPrice(apiData?.RentPrice || apiData?.Price, apiData?.IsUsd), 
        description: getPaymentFrequency(apiData?.PaymentFrequency) 
      }]
    };
    setAd(mappedAd);
    if (mappedAd.videoUrl) {
      setVideoUrl(mappedAd.videoUrl);
    }
  };

  const getSimilarAds = async () => {
    try {
      const payload = {
        BaseAdUnitId: adId,
        MaxResults: 3
      };
      const response = await advertisementService.getSimilar(payload);
      if (response?.IsSuccess) {
        const data = response.Data as any;
        setSimilarAds(data?.Items || data || []);
      }
    } catch (error) {
      console.error('Error fetching similar ads:', error);
    }
  };

  const hasVideo = (): boolean => {
    return !!(ad?.videoUrl);
  };

  const playVideo = () => {
    if (ad?.videoUrl) {
      setVideoModalTitle(ad?.Title || unit?.Title || 'عنوان غير متوفر');
      setShowVideoModal(true);
    } else {
      showToast('لا يوجد فيديو متاح لهذه الوحدة', 'warning');
    }
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'غير متوفر';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-3">جاري تحميل بيانات الوحدة...</p>
        </div>
      </div>
    );
  }

  if (hasError || !ad) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="alert alert-danger" role="alert">
            <i className="fa-solid fa-exclamation-triangle me-2"></i>
            {errorMessage || 'حدث خطأ أثناء تحميل تفاصيل الإعلان'}
          </div>
          <button className="btn btn-primary mt-3" onClick={() => getAdDetails()} aria-label="إعادة تحميل بيانات الوحدة">
            <i className="fa-solid fa-refresh me-2"></i>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* First Section: Gallery full width */}
      <div className="row mb-4">
        <div className="col-lg-12">
          <AdGallery mediaUrls={ad.MediaUrls} videoUrl={ad.videoUrl} title={ad.Title} />
        </div>
      </div>

      {/* Second Section: AdInfo left, Sidebar right */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <AdInfo 
            Floor={ad.Floor}
            Area={ad.Area}
            Rooms={ad.Rooms}
            Bathrooms={ad.Bathrooms}
            Street={0}
            Halls={ad.Halls}
            Category={ad.Audience}
            Title={ad.Title || 'عنوان غير متوفر'}
            AdAge={ad.PropertyAge}
            Description={ad.Description}
            City={ad.City}
            District={ad.District}
          />
        </div>

        <div className="col-lg-4">
          {/* Price */}
          <h2 className={styles.price}>{ad.RentPrice} / {ad.paymentType}</h2>
          
          {/* Payment Options */}
          {ad.paymentOptions && ad.paymentOptions.length > 0 && (
            <PaymentOptions paymentOptions={ad.paymentOptions} />
          )}

          {/* Agent Info */}
          {ad.agent && <AgentInfo agent={ad.agent} />}
        </div>
      </div>

      {/* Third Section: Features and Video */}
      <div className="row mb-4">
        <div className="col-lg-8">
          {/* Ad Features */}
          <AdFeatures features={ad.Features} />

          {/* Video Hero Section */}
          {hasVideo() && (
            <section className={styles.videoHeroSection}>
              <div className="container">
                <div className="row justify-content-start">
                  <div className="col-lg-10">
                    <div className="row">
                      <div className="col-12 text-right">
                        <h6 className={styles.knowMoreTitle}>تعرف أكثر</h6>
                      </div>
                    </div>
                    <div className={`${styles.videoContainer} mt-2`}>
                      <div className={styles.videoThumbnailContainer}>
                        <video
                          ref={videoThumbnailRef}
                          src={ad.videoUrl}
                          className={styles.videoThumbnail}
                          preload="metadata"
                          muted
                        />
                        <div className={styles.playOverlay} onClick={playVideo}>
                          <div className={styles.playButton}>
                            <i className="fa-solid fa-play"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Ad Map */}
          <AdMap coordinates={ad.mapCoordinates} />

          {/* Ad Information Section */}
          <div className={styles.adInfoSection}>
            <div className="row">
              <div className="col-lg-3">
                <div className={styles.actionButtons}>
                  <button className={`${styles.actionBtn} ${styles.infoBtn}`} aria-label="معلومات الإعلان">معلومات الإعلان</button>
                  <button className={`${styles.actionBtn} ${styles.detailsBtn}`} aria-label="معلومات إضافية">معلومات إضافية</button>
                </div>
              </div>
              <div className="col-lg-8">
                <div className={styles.adDetails}>
                  <div className={styles.detailsRow}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>رقم الإعلان</div>
                      <div className={styles.detailValue}>{ad.SerialNumber}</div>
                    </div>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>المشاهدات</div>
                      <div className={styles.detailValue}>{ad.ViewCount}</div>
                    </div>
                  </div>

                  <div className={styles.detailsRow}>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>تاريخ الإضافة</div>
                      <div className={styles.detailValue}>{formatDate(ad.CreatedAt)}</div>
                    </div>
                    <div className={styles.detailItem}>
                      <div className={styles.detailLabel}>آخر تحديث</div>
                      <div className={styles.detailValue}>{formatDate(ad.LastModifiedAt)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fourth Section: Similar Ads */}
      {similarAds.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <SimilarAds ads={similarAds} type="ads" />
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className={styles.videoModal} onClick={closeVideoModal}>
          <div className={styles.videoModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.videoModalHeader}>
              <h4>{videoModalTitle}</h4>
              <button className={styles.closeBtn} onClick={closeVideoModal} aria-label="إغلاق الفيديو">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className={styles.videoModalBody}>
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className={styles.projectVideo}
                  onEnded={closeVideoModal}
                  aria-label="فيديو الوحدة"
                >
                  متصفحك لا يدعم تشغيل الفيديو.
                </video>
              ) : (
                <p>لا يوجد فيديو متاح</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect, useRef } from 'react';
import { projectsService } from '@/lib/services/projects';
import { favoritesService } from '@/lib/services/favorites';
import { currencyService } from '@/lib/services/currency';
import { showToast } from '@/lib/utils/toast';
import AdGallery from '@/components/shared/ad-details/ad-gallery/AdGallery';
import AgentInfo from '@/components/shared/ad-details/agent-info/AgentInfo';
import ShareModal from '@/components/shared/share-modal/ShareModal';
import { environment } from '@/lib/config/environment';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './ProjectDetailsClient.module.css';

declare global {
  interface Window {
    google: any;
  }
}

interface ProjectDetailsClientProps {
  project: any;
  error: string | null;
  projectId: string;
}

export default function ProjectDetailsClient({ project: initialProject, error: initialError, projectId }: ProjectDetailsClientProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [project, setProject] = useState(initialProject);
  const [error, setError] = useState(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [projectImages, setProjectImages] = useState<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const baseUrl = environment.baseApiUrl;

  useEffect(() => {
    if (!initialProject && projectId) {
      loadProject();
    }
    
    if (initialError) {
      showToast(initialError, 'error');
    }
  }, [initialProject, projectId, initialError]);

  useEffect(() => {
    if (project && isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [project, isAuthenticated]);

  const loadProject = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await projectsService.getProjectById(projectId);
      if (response?.IsSuccess) {
        setProject(response.Data);
      } else {
        setError(response?.Error || 'فشل في تحميل بيانات المشروع');
        showToast(response?.Error || 'فشل في تحميل بيانات المشروع', 'error');
      }
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء تحميل بيانات المشروع');
      showToast(err?.message || 'حدث خطأ أثناء تحميل بيانات المشروع', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!isAuthenticated || !projectId) return;
    
    try {
      const response = await favoritesService.getFavorites({});
      if (response?.IsSuccess || response?.Success) {
        const data: any = response?.Data || {};
        const allFavorites = [
          ...(data.Projects || []),
          ...(data.Ads || []),
          ...(data.DailyRentUnits || []),
          ...(data.SpecialOrders || []),
          ...(data.Units || []),
        ];
        const isFav = allFavorites.some((fav: any) => fav.Id === projectId);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  useEffect(() => {
    if (project) {
      // Use CoverImageUrl instead of Media array
      const projectImage = project?.CoverImageUrl ? [{ url: project.CoverImageUrl, alt: 'Project Image' }] : [];
      setProjectImages(projectImage);

      if (project?.Owner) {
        project.Owner.phone = project.Owner?.Phone;
        project.Owner.name = project.Owner?.Name;
        project.Owner.id = project.Owner?.Id;
        project.Owner.image = project.Owner?.LogoUrl;
        project.Owner.company = true;
      }
    }
  }, [project]);

  useEffect(() => {
    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (isMapLoaded && project && mapRef.current) {
      initializeMap();
    }
  }, [isMapLoaded, project]);

  const loadGoogleMapsScript = () => {
    if (typeof window !== 'undefined' && window.google) {
      setIsMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsMapLoaded(true);
    };
    script.onerror = () => {
      showToast('فشل في تحميل خريطة جوجل', 'error');
    };
    document.head.appendChild(script);
  };

  const hasValidCoordinates = (): boolean => {
    return !!(
      project?.Latitude &&
      project?.Longitude &&
      project?.Latitude !== 0 &&
      project?.Longitude !== 0 &&
      !isNaN(project.Latitude) &&
      !isNaN(project.Longitude) &&
      project.Latitude >= -90 &&
      project.Latitude <= 90 &&
      project.Longitude >= -180 &&
      project.Longitude <= 180
    );
  };

  const initializeMap = () => {
    if (!isMapLoaded || !window.google || !mapRef.current || !project || !hasValidCoordinates()) {
      return;
    }

    const lat = project.Latitude;
    const lng = project.Longitude;

    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      geocoderRef.current = new window.google.maps.Geocoder();

      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: project?.Name || 'موقع المشروع',
      });

      geocodeCoordinates(lat, lng);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const geocodeCoordinates = (lat: number, lng: number) => {
    if (!geocoderRef.current) return;

    const latlng = { lat, lng };
    geocoderRef.current.geocode({ location: latlng }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        setSelectedLocation({
          address: results[0].formatted_address,
          latitude: lat,
          longitude: lng,
        });
      } else {
        setSelectedLocation({
          address: project?.FullAddress || 'عنوان غير محدد',
          latitude: lat,
          longitude: lng,
        });
      }
    });
  };

  const handleLikeProject = async () => {
    if (!isAuthenticated) {
      showToast('يرجى تسجيل الدخول أولاً', 'warning');
      return;
    }

    try {
      const response = await projectsService.likeProject(projectId);
      if (response?.IsSuccess) {
        setIsFavorite(!isFavorite);
        showToast(isFavorite ? 'تم إزالة المشروع من المفضلة' : 'تم إضافة المشروع إلى المفضلة', 'success');
      } else {
        showToast(response?.Error || 'فشل العملية', 'error');
      }
    } catch (error: any) {
      showToast(error?.message || 'حدث خطأ', 'error');
    }
  };

  const playVideo = () => {
    if (project?.VideoIntro?.Url) {
      setShowVideoModal(true);
      setIsVideoPlaying(true);
    } else {
      showToast('لا يوجد فيديو متاح لهذا المشروع', 'warning');
    }
  };

  const hasVideo = (): boolean => {
    return !!(project?.VideoIntro && project?.VideoIntro?.Url);
  };

  const getVideoThumbnail = (): string => {
    if (project?.VideoIntro?.Url) {
      return project.VideoIntro.Url;
    }
    return '/assets/images/play-video.svg';
  };

  const openShareModal = (proj: any) => {
    setSelectedProject(proj || project);
  };

  const closeShareModal = () => {
    setSelectedProject(null);
  };

  const openGoogleMaps = () => {
    if (selectedLocation) {
      const url = `https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}`;
      window.open(url, '_blank');
    } else if (project?.Latitude && project?.Longitude) {
      const url = `https://www.google.com/maps?q=${project.Latitude},${project.Longitude}`;
      window.open(url, '_blank');
    } else {
      showToast('لا يوجد موقع محدد', 'warning');
    }
  };

  // Helper functions
  const getDisplayDescription = (): string => {
    if (!project?.Description) return '';
    if (showFullDescription || project.Description.length <= 150) {
      return project.Description;
    }
    return project.Description.substring(0, 150) + '...';
  };

  const shouldShowViewMore = (): boolean => {
    return !!(project?.Description && project.Description.length > 150);
  };

  const getViewMoreText = (): string => {
    return showFullDescription ? 'عرض أقل' : 'عرض المزيد';
  };

  const getDisplayUnitDescription = (unitDescription: string): string => {
    if (!unitDescription) return 'لا يوجد وصف متاح';
    if (unitDescription.length <= 100) return unitDescription;
    return unitDescription.substring(0, 100) + '...';
  };

  const getWarrantyDuration = (type: string): string => {
    const warranty = project?.Warranties?.find((w: any) => w.Type === type);
    return warranty?.DurationInYears || 'غير متوفر';
  };

  const getPriceRangeValues = (priceFrom: number, priceTo: number): { sypRange: string } => {
    if (!priceFrom && !priceTo) return { sypRange: 'الأسعار غير متوفرة' };
    
    if (priceFrom && priceTo) {
      const fromSyp = new Intl.NumberFormat('ar-SA').format(priceFrom);
      const toSyp = new Intl.NumberFormat('ar-SA').format(priceTo);
      return { sypRange: `من ${fromSyp} إلى ${toSyp}` };
    }
    
    if (priceFrom) {
      const fromSyp = new Intl.NumberFormat('ar-SA').format(priceFrom);
      return { sypRange: `يبدأ من ${fromSyp}` };
    }
    
    if (priceTo) {
      const toSyp = new Intl.NumberFormat('ar-SA').format(priceTo);
      return { sypRange: `حتى ${toSyp}` };
    }
    
    return { sypRange: 'الأسعار غير متوفرة' };
  };

  const getPriceValues = (price: number): { syp: string, usd: string } => {
    if (!price || price <= 0) return { syp: 'غير متوفر', usd: '' };
    // Format SYP
    const syp = new Intl.NumberFormat('ar-SA').format(price) + ' ل.س';
    // Calculate USD (assuming 15000 SYP = 1 USD)
    const usd = price / 15000;
    const usdFormatted = usd > 0 ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(usd) + ' دولار' : '';
    return { syp, usd: usdFormatted };
  };

  const zoomIn = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom + 1);
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      const currentZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(currentZoom - 1);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter({ lat, lng });
            showToast('تم تحديد موقعك الحالي', 'success');
          }
        },
        () => {
          showToast('فشل في تحديد موقعك الحالي', 'error');
        }
      );
    } else {
      showToast('متصفحك لا يدعم تحديد الموقع', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-3">جاري تحميل بيانات المشروع...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <p>{error || 'لا يمكن تحميل بيانات المشروع'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainProjectContainer}>
      <section className={styles.mainContentSection}>
        <div className="container">
          <div className="row">
            {/* Gallery Section */}
            <div className="row mb-4">
              <div className="col-lg-12">
                {projectImages.length > 0 && <AdGallery mediaUrls={projectImages} title={project?.Name} />}
              </div>
            </div>

            {/* Project Info Section */}
            <div className="row mb-5">
              <div className="col-lg-8">
                <div className={styles.projectDetailsCard}>
                  <h1 className={styles.projectName}>{project?.Name}</h1>
                  <p className={styles.projectAddress}>{project?.FullAddress}</p>
                  {project?.Description && (
                    <>
                      <p className={styles.projectDescription}>{getDisplayDescription()}</p>
                      {shouldShowViewMore() && (
                        <a className={styles.viewMore} onClick={() => setShowFullDescription(!showFullDescription)}>
                          {getViewMoreText()}
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="col-lg-4">
                {project?.Owner && (
                  <AgentInfo
                    agent={{
                      id: Number(project.Owner.Id) || 0,
                      name: project.Owner.Name,
                      image: project.Owner.LogoUrl || '/assets/images/blank-profile.png',
                      phone: project.Owner.Phone,
                      rating: 0,
                      reviewsCount: 0,
                      whatsapp: project.Owner.Phone || '',
                    }}
                    onCall={() => {
                      if (project.Owner?.Phone) {
                        window.location.href = `tel:${project.Owner.Phone}`;
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Project Specifications */}
            <div className="row mb-5">
              <div className="col-8">
                <div className={styles.projectSpecifications}>
                  <div className="row">
                    <div className="col-md-4">
                      <div className={styles.specCardHorizontal}>
                        <div className={styles.specIconCircle}>
                          <i className="fa-solid fa-building"></i>
                        </div>
                        <div className={styles.specInfo}>
                          <h5 className={styles.specName}>الوحدات</h5>
                          <p className={styles.specDetails}>{project?.UnitsCount || 0} &nbsp; وحدة</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className={styles.specCardHorizontal}>
                        <div className={styles.specIconCircle}>
                          <i className="fa-solid fa-ruler-combined"></i>
                        </div>
                        <div className={styles.specInfo}>
                          <h5 className={styles.specName}>المساحات</h5>
                          <p className={styles.specDetails}>
                            {project?.AreaFrom || 'غير محدد'} - {project?.AreaTo || 'غير محدد'} &nbsp; م2
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className={styles.specCardHorizontal}>
                        <div className={styles.specIconCircle}>
                          <i className="fa-solid fa-money-bill"></i>
                        </div>
                        <div className={styles.specInfo}>
                          <h5 className={styles.specName}>الأسعار</h5>
                          <p className={styles.specDetails}>
                            {getPriceRangeValues(project?.PriceFrom, project?.PriceTo).sypRange}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Features Navigation */}
            {project?.Features && project.Features.length > 0 && (
              <div className="row">
                <div className="col-8">
                  <div className={styles.projectFeaturesNav}>
                    <h4 className={styles.featuresTitle}>مميزات المشروع</h4>
                    <div className={styles.featuresTabs}>
                      {project.Features.map((feature: string, index: number) => (
                        <button key={index} className={styles.featureTabBtn}>
                          {feature}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video Hero Section */}
      {hasVideo() && (
        <section className={styles.videoHeroSection}>
          <div className="container">
            <div className="row justify-content-start">
              <div className="col-lg-7">
                <div className="row">
                  <div className="col-12 text-right">
                    <h6 className={styles.knowMoreTitle}>تعرف أكثر</h6>
                  </div>
                </div>
                <div className={`${styles.videoContainer} mt-2`}>
                  <div className={styles.videoThumbnailContainer}>
                    <video
                      src={getVideoThumbnail()}
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

            {/* Warranty Section */}
            <div className="row justify-content-start">
              <div className="row">
                <div className="col-12 text-right">
                  <h6 className={styles.knowMoreTitle}>ضمان وصيانة</h6>
                </div>
              </div>
              <div className="col-lg-10">
                <div className={styles.featuresRow}>
                  <div className="row">
                    <div className="col-md-3">
                      <div className={styles.featureCardHorizontal}>
                        <div className={styles.featureIcon} style={{ color: '#4CAF50' }}>
                          <i className="fa-solid fa-bolt"></i>
                        </div>
                        <div className={styles.specInfo}>
                          <h6 style={{ fontWeight: 'bold' }}>الكهرباء</h6>
                          <p>{getWarrantyDuration('الكهرباء')} سنوات</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className={styles.featureCardHorizontal}>
                        <div className={styles.featureIcon} style={{ color: '#4CAF50' }}>
                          <i className="fa-solid fa-faucet-drip"></i>
                        </div>
                        <div className={styles.specInfo}>
                          <h6 style={{ fontWeight: 'bold' }}>السباكة</h6>
                          <p>{getWarrantyDuration('السباكة')} سنوات</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className={styles.featureCardHorizontal}>
                        <div className={styles.featureIcon} style={{ color: '#4CAF50' }}>
                          <i className="fa-solid fa-screwdriver"></i>
                        </div>
                        <div className={styles.specInfo}>
                          <h6 style={{ fontWeight: 'bold' }}>الصيانة</h6>
                          <p>{getWarrantyDuration('الصيانة')} سنوات</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Map and Units Section */}
      <section className={styles.mapUnitsSection}>
        <div className="container">
          <div className="row">
            {/* Map Section */}
            {hasValidCoordinates() && (
              <div className="col-lg-7">
                <div className={styles.mapSection}>
                  <h3 className={styles.mapTitle}>العنوان على الخريطة</h3>

                  {!isMapLoaded && (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">جاري التحميل...</span>
                      </div>
                      <p className="mt-3">جاري تحميل الخريطة...</p>
                    </div>
                  )}

                  {isMapLoaded && !hasValidCoordinates() && (
                    <div className="alert alert-info" role="alert">
                      <i className="fa-solid fa-map-location-dot me-2"></i>
                      <strong>لا يمكن تحميل الخريطة</strong>
                      <p className="mb-0 mt-2">لا توجد إحداثيات صحيحة لموقع هذا المشروع.</p>
                    </div>
                  )}

                  {isMapLoaded && hasValidCoordinates() && (
                    <div className={styles.mapContainer}>
                      <div id="project-map" ref={mapRef} className={styles.googleMapContainer}></div>
                      <div className={styles.mapControls}>
                        <button className={styles.mapControl} onClick={zoomIn} aria-label="تكبير الخريطة">
                          <i className="fa-solid fa-plus"></i>
                        </button>
                        <button className={styles.mapControl} onClick={zoomOut} aria-label="تصغير الخريطة">
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <button className={styles.mapControl} onClick={getCurrentLocation} aria-label="تحديد الموقع الحالي">
                          <i className="fa-solid fa-location-crosshairs"></i>
                        </button>
                      </div>

                      {selectedLocation && (
                        <div className={styles.locationInfoPanel}>
                          <div className={styles.locationInfo}>
                            <h6>موقع المشروع</h6>
                            <p><strong>خط الطول:</strong> {selectedLocation.latitude.toFixed(6)}</p>
                            <p><strong>خط العرض:</strong> {selectedLocation.longitude.toFixed(6)}</p>
                          </div>
                        </div>
                      )}

                      <button className={styles.googleMapsBtn} onClick={openGoogleMaps} aria-label="فتح خريطة جوجل">
                        انتقل لخريطة جوجل
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Units Section */}
            <div className="row mt-5">
              <div className="units-section">
                <h3 className={styles.unitsTitle}>الوحدات</h3>
                <div className="row">
                  {project?.ReadyUnits && project.ReadyUnits.length > 0 ? (
                    <div className="row">
                      {project.ReadyUnits.map((unit: any) => (
                        <div key={unit.Id} className="col-lg-6 col-md-6 col-sm-12">
                          <div className={`${styles.unitCard} mt-3`}>
                            <div className="row">
                              <div className={`${styles.unitImageContainer} col-lg-6`}>
                                <img
                                  src={unit?.CoverImageUrl || '/assets/images/no_image.png'}
                                  alt={getDisplayUnitDescription(unit?.Description)}
                                  className={styles.unitImage}
                                  onClick={() => router.push(`/ad-unit-details/${unit.Id}`)}
                                  style={{ cursor: 'pointer' }}
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/images/no_image.png';
                                  }}
                                />
                                <div className={styles.unitActions}>
                                  <button className={styles.unitActionBtn} onClick={() => router.push(`/ad-unit-details/${unit.Id}`)}>
                                    <i className={`far ${unit?.IsFavorite ? 'fas fa-heart text-danger' : 'far fa-heart'}`}></i>
                                  </button>
                                  <button className={styles.unitActionBtn} onClick={() => openShareModal(unit)}>
                                    <i className="fa-solid fa-share"></i>
                                  </button>
                                </div>
                              </div>

                              <div className={`${styles.unitDetails} col-lg-6`}>
                                <div className={styles.unitPrice}>{getPriceValues(unit?.Price || 0).syp}</div>
                                <div className={styles.unitStatus}>{unit?.UnitTypeLabel || ''}</div>
                                <div className={styles.unitLocation}>{unit?.FullAddress || ''}</div>

                                <div className={styles.unitSpecs}>
                                  {unit?.Area && (
                                    <div className={styles.spec}>
                                      <i className="fa-solid fa-ruler-combined"></i>
                                      <span>{unit.Area} م2</span>
                                    </div>
                                  )}
                                  {unit?.Rooms && (
                                    <div className={styles.spec}>
                                      <i className="fa-solid fa-bed"></i>
                                      <span>{unit.Rooms}</span>
                                    </div>
                                  )}
                                  {unit?.Bathrooms && (
                                    <div className={styles.spec}>
                                      <i className="fa-solid fa-bath"></i>
                                      <span>{unit.Bathrooms}</span>
                                    </div>
                                  )}
                                  {unit?.Halls && (
                                    <div className={styles.spec}>
                                      <i className="fa-solid fa-door-open"></i>
                                      <span>{unit.Halls}</span>
                                    </div>
                                  )}
                                </div>

                                <p className={styles.unitDescription}>
                                  {getDisplayUnitDescription(unit?.Description)}
                                </p>

                                <button className={styles.backBtn} onClick={() => router.push(`/ad-unit-details/${unit.Id}`)}>
                                  <i className="fa-solid fa-arrow-left"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-info text-center mt-4" role="alert" aria-label="لا توجد وحدات متاحة حالياً">
                      <i className="fa-solid fa-info-circle me-2"></i>
                      لا توجد وحدات متاحة حالياً
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {showVideoModal && project?.VideoIntro?.Url && (
        <div className={styles.videoModal} onClick={() => { setShowVideoModal(false); setIsVideoPlaying(false); }}>
          <div className={styles.videoModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.videoModalHeader}>
              <h4>{project?.Name}</h4>
              <button className={styles.videoCloseBtn} onClick={() => { setShowVideoModal(false); setIsVideoPlaying(false); }}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className={styles.videoModalBody}>
              <video
                src={project.VideoIntro.Url}
                controls
                autoPlay
                className={styles.projectVideo}
                onEnded={() => { setShowVideoModal(false); setIsVideoPlaying(false); }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

      {selectedProject && (
        <ShareModal
          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/project-details/${selectedProject.Id || projectId}`}
          shareTitle={selectedProject.Name || project?.Name || ''}
          adId={String(selectedProject.Id || projectId || '')}
          userId={null}
          onClose={closeShareModal}
        />
      )}
    </div>
  );
}


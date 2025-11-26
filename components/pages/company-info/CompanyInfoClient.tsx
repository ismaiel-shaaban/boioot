'use client';

import { useState, useEffect, useRef } from 'react';
import { projectsService } from '@/lib/services/projects';
import { showToast } from '@/lib/utils/toast';
import AdGallery from '@/components/shared/ad-details/ad-gallery/AdGallery';
import AgentInfo from '@/components/shared/ad-details/agent-info/AgentInfo';
import ShareModal from '@/components/shared/share-modal/ShareModal';
import { environment } from '@/lib/config/environment';

declare global {
  interface Window {
    google: any;
  }
}

interface CompanyInfoClientProps {
  companyProfile: any;
  projects: any[];
  error: string | null;
  companyId: string;
}

export default function CompanyInfoClient({ companyProfile: initialCompanyProfile, projects: initialProjects, error: initialError, companyId }: CompanyInfoClientProps) {
  const [companyProfile, setCompanyProfile] = useState(initialCompanyProfile);
  const [projects, setProjects] = useState(initialProjects);
  const [error, setError] = useState(initialError);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [shareModalData, setShareModalData] = useState<{ shareUrl: string; shareTitle: string; adId: string } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const baseUrl = environment.baseApiUrl;

  useEffect(() => {
    if (initialError) {
      showToast(initialError, 'error');
    }
  }, [initialError]);

  useEffect(() => {
    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (isMapLoaded && companyProfile && mapRef.current) {
      initializeMap();
    }
  }, [isMapLoaded, companyProfile]);

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

  const initializeMap = () => {
    if (!isMapLoaded || !window.google || !mapRef.current || !companyProfile) return;

    const latitude = companyProfile?.Location?.Latitude || 0;
    const longitude = companyProfile?.Location?.Longitude || 0;

    if (!latitude || !longitude || latitude === 0 || longitude === 0) {
      return;
    }

    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      geocoderRef.current = new window.google.maps.Geocoder();

      markerRef.current = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapInstanceRef.current,
        draggable: false,
        title: 'موقع الشركة',
      });

      geocodeCoordinates(latitude, longitude);
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
          address: companyProfile?.FullAddress || 'عنوان غير محدد',
          latitude: lat,
          longitude: lng,
        });
      }
    });
  };

  const formatPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (!cleaned.startsWith('966')) {
      cleaned = '966' + cleaned;
    }
    return cleaned;
  };

  const callAgent = () => {
    if (companyProfile?.Phone) {
      const phoneNumber = formatPhoneNumber(companyProfile.Phone);
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const openShareModal = (project: any) => {
    const shareUrl = `${baseUrl}/project-details/${project?.Id}`;
    setShareModalData({
      shareUrl,
      shareTitle: project?.Name || 'مشروع عقاري',
      adId: project?.Id?.toString() || '',
    });
  };

  if (!companyProfile) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <p>{error || 'لا يمكن تحميل بيانات الشركة'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-8">
          <h1>{companyProfile.Name || 'معلومات الشركة'}</h1>
          {companyProfile.Description && (
            <div className="mb-4">
              <p>{companyProfile.Description}</p>
            </div>
          )}

          {projects.length > 0 && (
            <div className="mb-4">
              <h2>مشاريع الشركة</h2>
              <div className="row">
                {projects.map((project) => (
                  <div key={project.Id} className="col-md-6 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">{project.Name}</h5>
                        <p className="card-text">{project.Description}</p>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => openShareModal(project)}
                        >
                          مشاركة
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-md-4">
          <AgentInfo
            agent={{
                id: Number(companyProfile.Id) || 0,
                name: companyProfile.Name,
                image: companyProfile.LogoUrl || '/assets/images/blank-profile.png',
                phone: companyProfile.Phone,
                rating: 0,
                reviewsCount: 0,
                whatsapp: companyProfile.Phone ? formatPhoneNumber(companyProfile.Phone) : '',
              }}
              onCall={callAgent}
          />

          {selectedLocation && (
            <div className="mt-4">
              <h5>الموقع</h5>
              <div id="company-map" ref={mapRef} style={{ height: '300px', width: '100%' }}></div>
              <p className="mt-2">{selectedLocation.address}</p>
            </div>
          )}
        </div>
      </div>

      {shareModalData && (
        <ShareModal
          shareUrl={shareModalData.shareUrl}
          shareTitle={shareModalData.shareTitle}
          adId={shareModalData.adId}
          userId={null}
          onClose={() => setShareModalData(null)}
        />
      )}
    </div>
  );
}


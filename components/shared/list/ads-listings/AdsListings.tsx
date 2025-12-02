'use client';

import { useState, useEffect } from 'react';
import AdCard from '@/components/shared/cards/ad-card/AdCard';
import { useAuth } from '@/lib/contexts/AuthContext';
import ShareModal from '@/components/shared/share-modal/ShareModal';

export interface Ad {
  Id: string;
  RentPrice?: string;
  Price?: number;
  paymentType?: string;
  DurationLabel?: string;
  location?: string;
  District?: string;
  City?: string;
  region?: string;
  details?: string;
  Description?: string;
  Rooms?: number;
  Bathrooms?: number;
  Halls?: number;
  Title?: string;
  kitchens?: number;
  Area?: number;
  CoverImageUrl?: string;
  type?: string;
  IsFavorite?: boolean;
  IsFeatured?: boolean;
  UnitType?: number;
  ContractDuration?: number;
  PaymentFrequency?: any;
  SerialNumber?: string;
  IsUsd?: boolean;
  [key: string]: any; // Allow additional properties
}

interface AdsListingsProps {
  ads: Ad[];
  type?: string;
  showActions?: boolean;
  onEditAd?: (ad: Ad) => void;
  onDeleteAd?: (ad: Ad) => void;
  onFavoriteToggled?: (ad: Ad) => void;
}

export default function AdsListings({
  ads,
  type = 'ads',
  showActions = false,
  onEditAd,
  onDeleteAd,
  onFavoriteToggled,
}: AdsListingsProps) {
  const { isAuthenticated, getUserProfile } = useAuth();
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [sharedUrl, setSharedUrl] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserInfo();
    }
  }, [isAuthenticated]);

  const loadUserInfo = async () => {
    try {
      const response = await getUserProfile();
      if (response?.IsSuccess || response?.Success) {
        const data = response.Data as any;
        setUserId(data?.Id || null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const openShareModal = (ad: Ad) => {
    setSelectedAd(ad);
    if (typeof window !== 'undefined') {
      // Determine the correct URL based on type
      let urlPath = '/ad-details';
      if (type === 'special_order') {
        urlPath = '/special-order-details';
      } else if (type === 'daily_rent') {
        urlPath = '/daily-rent-details';
      } else if (type === 'unit_project') {
        urlPath = '/ad-unit-details';
      }
      const url = `${window.location.origin}${urlPath}/${ad.Id}`;
      setSharedUrl(url);
    }
  };

  const closeShareModal = () => {
    setSelectedAd(null);
  };

  if (ads.length === 0) {
    return null; // Return null when no ads, parent handles empty state
  }

  return (
    <>
      <div>
        {ads.map((ad) => (
          <AdCard 
            key={ad.Id} 
            ad={ad} 
            type={type} 
            showActions={showActions}
            onShare={() => openShareModal(ad)}
            onEdit={onEditAd ? () => onEditAd(ad) : undefined}
            onDelete={onDeleteAd ? () => onDeleteAd(ad) : undefined}
            onFavoriteToggled={onFavoriteToggled}
          />
        ))}
      </div>

      {selectedAd && (
        <ShareModal
          shareUrl={sharedUrl}
          shareTitle={selectedAd.Title || ''}
          adId={selectedAd.Id}
          userId={userId}
          onClose={closeShareModal}
        />
      )}
    </>
  );
}

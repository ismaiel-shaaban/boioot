'use client';

import { useRouter } from 'next/navigation';
import AdCard from '@/components/shared/cards/ad-card/AdCard';

interface SimilarAdsProps {
  ads: any[];
  type?: string;
}

export default function SimilarAds({ ads, type = 'ads' }: SimilarAdsProps) {
  const router = useRouter();

  if (!ads || ads.length === 0) {
    return null;
  }

  return (
    <div className="similar-ads mt-5">
      <h3>إعلانات مشابهة</h3>
      <div className="row">
        {ads.map((ad) => (
          <div key={ad.Id} className="col-12 col-md-6 col-lg-4 mb-4">
            <AdCard ad={ad} type={type} />
          </div>
        ))}
      </div>
    </div>
  );
}


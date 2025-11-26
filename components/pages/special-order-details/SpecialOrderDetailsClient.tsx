'use client';

import AdDetailsClient from '@/components/pages/ad-details/AdDetailsClient';

interface SpecialOrderDetailsClientProps {
  adId: string;
}

export default function SpecialOrderDetailsClient({ adId }: SpecialOrderDetailsClientProps) {
  return <AdDetailsClient adId={adId} />;
}


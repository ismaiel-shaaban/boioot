'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dailyRentService } from '@/lib/services/daily-rent';
import { showToast } from '@/lib/utils/toast';
import AdDetailsClient from '@/components/pages/ad-details/AdDetailsClient';

interface DailyRentDetailsClientProps {
  adId: string;
}

export default function DailyRentDetailsClient({ adId }: DailyRentDetailsClientProps) {
  return <AdDetailsClient adId={adId} />;
}


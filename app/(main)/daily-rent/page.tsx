import { Metadata } from 'next';
import { generateMetadata } from '@/lib/utils/metadata';
import { Suspense } from 'react';
import DailyRentClient from '@/components/pages/daily-rent/DailyRentClient';

export const metadata: Metadata = generateMetadata({
  title: 'الإيجار اليومي - بيوت',
  description: 'ابحث عن أفضل خيارات الإيجار اليومي في سوريا. شقق، فلل، ومكاتب للإيجار اليومي.',
  canonicalUrl: 'https://boioot.com/daily-rent',
});

export default function DailyRentPage() {
  return (
    <Suspense fallback={<div className="container mt-4 text-center py-5">جاري التحميل...</div>}>
      <DailyRentClient />
    </Suspense>
  );
}


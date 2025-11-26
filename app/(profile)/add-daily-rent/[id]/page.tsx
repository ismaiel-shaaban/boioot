import { Metadata } from 'next';
import { Suspense } from 'react';
import AddDailyRentClient from '@/components/pages/add-daily-rent/AddDailyRentClient';
import { generateMetadata as getMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = getMetadata({
  title: 'تعديل إعلان الإيجار اليومي | بوابة العقارات',
  description: 'صفحة تعديل إعلان الإيجار اليومي في بوابة العقارات.',
});

export default function EditDailyRentPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="container py-5">جاري التحميل...</div>}>
      <AddDailyRentClient dailyRentId={params.id} />
    </Suspense>
  );
}


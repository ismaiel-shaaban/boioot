import { Metadata } from 'next';
import { Suspense } from 'react';
import AddDailyRentClient from '@/components/pages/add-daily-rent/AddDailyRentClient';
import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'إضافة إعلان إيجار يومي | بوابة العقارات',
  description: 'صفحة إضافة إعلان إيجار يومي في بوابة العقارات، أدخل بيانات الإعلان لإتمام العملية.',
});

export default function AddDailyRentPage() {
  return (
    <Suspense fallback={<div className="container py-5">جاري التحميل...</div>}>
      <AddDailyRentClient />
    </Suspense>
  );
}


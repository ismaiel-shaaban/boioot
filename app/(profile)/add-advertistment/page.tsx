import { Metadata } from 'next';
import { Suspense } from 'react';
import AddAdvertisementClient from '@/components/pages/add-advertisement/AddAdvertisementClient';
import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'إضافة إعلان جديد | بوابة العقارات',
  description: 'صفحة إضافة إعلان جديد في بوابة العقارات، أدخل بيانات الإعلان لإتمام العملية.',
});

export default function AddAdvertisementPage() {
  return (
    <Suspense fallback={<div className="container py-5">جاري التحميل...</div>}>
      <AddAdvertisementClient />
    </Suspense>
  );
}


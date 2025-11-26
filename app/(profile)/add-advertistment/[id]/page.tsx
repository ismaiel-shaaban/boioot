import { Metadata } from 'next';
import { Suspense } from 'react';
import AddAdvertisementClient from '@/components/pages/add-advertisement/AddAdvertisementClient';
import { generateMetadata as getMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = getMetadata({
  title: 'تعديل الإعلان | بوابة العقارات',
  description: 'صفحة تعديل الإعلان في بوابة العقارات.',
});

export default function EditAdvertisementPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="container py-5">جاري التحميل...</div>}>
      <AddAdvertisementClient advertisementId={params.id} />
    </Suspense>
  );
}


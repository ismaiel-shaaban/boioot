import { Metadata } from 'next';
import { Suspense } from 'react';
import AddSpecialOrderClient from '@/components/pages/add-special-order/AddSpecialOrderClient';
import { generateMetadata as getMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = getMetadata({
  title: 'تعديل الطلب الخاص | بوابة العقارات',
  description: 'صفحة تعديل الطلب الخاص في بوابة العقارات.',
});

export default function EditSpecialOrderPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="container py-5">جاري التحميل...</div>}>
      <AddSpecialOrderClient specialOrderId={params.id} />
    </Suspense>
  );
}


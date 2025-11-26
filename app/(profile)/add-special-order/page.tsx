import { Metadata } from 'next';
import { Suspense } from 'react';
import AddSpecialOrderClient from '@/components/pages/add-special-order/AddSpecialOrderClient';
import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'إضافة طلب خاص جديد | بوابة العقارات',
  description: 'صفحة إضافة طلب خاص جديد في بوابة العقارات، أدخل تفاصيل الطلب الخاص لإتمام العملية.',
});

export default function AddSpecialOrderPage() {
  return (
    <Suspense fallback={<div className="container py-5">جاري التحميل...</div>}>
      <AddSpecialOrderClient />
    </Suspense>
  );
}


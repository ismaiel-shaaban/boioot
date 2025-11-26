import { Metadata } from 'next';
import { generateMetadata } from '@/lib/utils/metadata';
import { Suspense } from 'react';
import SpecialOrderClient from '@/components/pages/special-order/SpecialOrderClient';

export const metadata: Metadata = generateMetadata({
  title: 'طلبات التسويق - بيوت',
  description: 'عرض طلبات التسويق العقاري في سوريا.',
  canonicalUrl: 'https://boioot.com/special-order',
});

export default function SpecialOrderPage() {
  return (
    <Suspense fallback={<div className="container mt-4 text-center py-5">جاري التحميل...</div>}>
      <SpecialOrderClient />
    </Suspense>
  );
}


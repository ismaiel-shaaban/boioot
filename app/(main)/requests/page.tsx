import { Metadata } from 'next';
import { generateMetadata } from '@/lib/utils/metadata';
import { Suspense } from 'react';
import RequestsClient from '@/components/pages/requests/RequestsClient';

export const metadata: Metadata = generateMetadata({
  title: 'طلبات العقارات - بيوت',
  description: 'عرض طلبات العقارات في سوريا.',
  canonicalUrl: 'https://boioot.com/requests',
});

export default function RequestsPage() {
  return (
    <Suspense fallback={<div className="container mt-4 text-center py-5">جاري التحميل...</div>}>
      <RequestsClient />
    </Suspense>
  );
}


import { Metadata } from 'next';
import { Suspense } from 'react';
import { subscribeService } from '@/lib/services/subscribe';
import SubscribeClient from '@/components/pages/subscribe/SubscribeClient';
import { generateMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'الاشتراك | بوابة العقارات',
  description: 'صفحة الاشتراك في بوابة العقارات، اشترك للحصول على أحدث العروض والإعلانات.',
});

export default async function SubscribePage() {
  let packages: any[] = [];
  let error: string | null = null;

  try {
    const response = await subscribeService.getSubscribeTypes();
    if (response?.IsSuccess) {
      const data = response.Data;
      if (Array.isArray(data) && data.length > 0) {
        packages = data;
      } else {
        error = 'No packages found';
      }
    } else {
      error = response?.Error || 'No packages found';
    }
  } catch (err: any) {
    error = err?.message || 'حدث خطأ أثناء تحميل الباقات';
  }

  return (
    <Suspense fallback={<div className="container py-5">جاري التحميل...</div>}>
      <SubscribeClient initialPackages={packages} error={error} />
    </Suspense>
  );
}


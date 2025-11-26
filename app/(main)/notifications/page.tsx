import { Metadata } from 'next';
import { Suspense } from 'react';
import { generateMetadata } from '@/lib/utils/metadata';
import NotificationsClient from '@/components/pages/notifications/NotificationsClient';

export const metadata: Metadata = generateMetadata({
  title: 'الإشعارات - بيوت',
  description: 'صفحة الإشعارات في بوابة العقارات، استعرض جميع التنبيهات والإشعارات الخاصة بك.',
  canonicalUrl: 'https://boioot.com/notifications',
});

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="container mt-4 text-center py-5">جاري التحميل...</div>}>
      <NotificationsClient />
    </Suspense>
  );
}


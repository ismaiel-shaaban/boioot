import { Metadata } from 'next';
import { generateMetadata } from '@/lib/utils/metadata';
import { Suspense } from 'react';
import UserProfileClient from '@/components/pages/user-profile/UserProfileClient';

export const metadata: Metadata = generateMetadata({
  title: 'معلومات المستخدم | بوابة العقارات',
  description: 'صفحة معلومات المستخدم في بوابة العقارات، استعرض بياناتك الشخصية وتحديثها.',
  canonicalUrl: 'https://boioot.com/profile',
});

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="container py-5 text-center">جاري التحميل...</div>}>
      <UserProfileClient />
    </Suspense>
  );
}


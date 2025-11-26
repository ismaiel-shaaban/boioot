import { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordPageClient from '@/components/pages/reset-password/ResetPasswordPageClient';
import { generateMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'إعادة تعيين كلمة المرور | بوابة العقارات',
  description: 'صفحة إعادة تعيين كلمة المرور في بوابة العقارات.',
});

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <ResetPasswordPageClient />
    </Suspense>
  );
}


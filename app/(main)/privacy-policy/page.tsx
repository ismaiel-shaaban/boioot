import { Metadata } from 'next';
import { generateMetadata } from '@/lib/utils/metadata';
import { Suspense } from 'react';
import DynamicPage from '@/components/shared/dynamic-page/DynamicPage';

export const metadata: Metadata = generateMetadata({
  title: 'سياسة الخصوصية - بيوت',
  description: 'سياسة الخصوصية لمنصة بيوت العقارية.',
  canonicalUrl: 'https://boioot.com/privacy-policy',
});

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={<div className="container mt-4 text-center py-5">جاري التحميل...</div>}>
      <DynamicPage shortCode={1002} />
    </Suspense>
  );
}


import { Metadata } from 'next';
import { generateMetadata } from '@/lib/utils/metadata';
import { Suspense } from 'react';
import DynamicPage from '@/components/shared/dynamic-page/DynamicPage';

export const metadata: Metadata = generateMetadata({
  title: 'الشروط والأحكام - بيوت',
  description: 'الشروط والأحكام لمنصة بيوت العقارية.',
  canonicalUrl: 'https://boioot.com/terms-conditions',
});

export default function TermsConditionsPage() {
  return (
    <Suspense fallback={<div className="container mt-4 text-center py-5">جاري التحميل...</div>}>
      <DynamicPage shortCode={1003} />
    </Suspense>
  );
}


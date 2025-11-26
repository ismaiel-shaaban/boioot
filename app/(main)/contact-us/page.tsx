import { Metadata } from 'next';
import { generateMetadata } from '@/lib/utils/metadata';
import { Suspense } from 'react';
import DynamicPage from '@/components/shared/dynamic-page/DynamicPage';

export const metadata: Metadata = generateMetadata({
  title: 'اتصل بنا - بيوت',
  description: 'تواصل معنا في منصة بيوت العقارية.',
  canonicalUrl: 'https://boioot.com/contact-us',
});

export default function ContactUsPage() {
  return (
    <Suspense fallback={<div className="container mt-4 text-center py-5">جاري التحميل...</div>}>
      <DynamicPage shortCode={1001} />
    </Suspense>
  );
}


import { Metadata } from 'next';
import { Suspense } from 'react';
import { generateMetadata } from '@/lib/utils/metadata';
import BlogsCategoriesClient from '@/components/pages/blogs/BlogsCategoriesClient';

export const metadata: Metadata = generateMetadata({
  title: 'مدونة بيوت - أخبار ونصائح العقارات',
  description: 'اقرأ آخر أخبار العقارات، النصائح، والتوجيهات من خبراء بيوت العقاريين.',
  canonicalUrl: 'https://boioot.com/blogs',
});

export default function BlogsPage() {
  return (
    <Suspense fallback={<div className="container mt-4 text-center py-5">جاري التحميل...</div>}>
      <BlogsCategoriesClient />
    </Suspense>
  );
}


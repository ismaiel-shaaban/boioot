import { Metadata } from 'next';
import { Suspense } from 'react';
import { generateMetadata } from '@/lib/utils/metadata';
import HomePageClient from '@/components/pages/home/HomePageClient';

export const metadata: Metadata = generateMetadata({
  title: 'بيوت - منصة العقارات الرائدة في سوريا',
  description: 'منصة بيوت للعقارات - ابحث عن العقارات، المشاريع، الإيجار اليومي، والمزيد. أفضل منصة عقارية في سوريا.',
  keywords: 'عقارات، مشاريع عقارية، إيجار يومي، بيوت، سوريا، دمشق، حلب، حمص',
  canonicalUrl: 'https://boioot.com/',
});

export default async function HomePage() {
  return (
    <Suspense fallback={<div className="container mt-4 text-center py-5">جاري التحميل...</div>}>
      <HomePageClient />
    </Suspense>
  );
}


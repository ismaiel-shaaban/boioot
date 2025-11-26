import { Metadata } from 'next';
import { Suspense } from 'react';
import { generateMetadata } from '@/lib/utils/metadata';
import FavoritesClient from '@/components/pages/favorites/FavoritesClient';

export const metadata: Metadata = generateMetadata({
  title: 'المفضلة - بيوت',
  description: 'صفحة المفضلة في بوابة العقارات، استعرض جميع الإعلانات والمشاريع والطلبات التي أعجبتك.',
  canonicalUrl: 'https://boioot.com/favorites',
});

export default function FavoritesPage() {
  return (
    <Suspense fallback={<div className="container mt-4 text-center py-5">جاري التحميل...</div>}>
      <FavoritesClient />
    </Suspense>
  );
}


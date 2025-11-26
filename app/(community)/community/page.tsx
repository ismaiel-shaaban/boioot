import { Metadata } from 'next';
import { Suspense } from 'react';
import { generateMetadata } from '@/lib/utils/metadata';
import CommunityClient from '@/components/pages/community/CommunityClient';

export const metadata: Metadata = generateMetadata({
  title: 'مجتمع بيوت - منتدى العقارات',
  description: 'انضم إلى مجتمع بيوت العقاري. شارك خبراتك، اطرح أسئلتك، واقرأ آخر أخبار العقارات.',
  canonicalUrl: 'https://boioot.com/community',
});

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="container mt-4">
          <div className="text-center py-5" aria-live="polite">
            <div className="spinner-border text-primary" role="status" aria-label="جاري التحميل">
              <span className="visually-hidden">جاري التحميل...</span>
            </div>
            <p className="mt-3">جاري تحميل صفحة المجتمع...</p>
          </div>
        </div>
      }
    >
      <CommunityClient />
    </Suspense>
  );
}


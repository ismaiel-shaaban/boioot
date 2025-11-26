import { Metadata } from 'next';
import { generateMetadata } from '@/lib/utils/metadata';
import { Suspense } from 'react';
import ProjectsListingClient from '@/components/pages/projects/ProjectsListingClient';

export const metadata: Metadata = generateMetadata({
  title: 'المشاريع العقارية - بيوت',
  description: 'اكتشف أفضل المشاريع العقارية في سوريا. مشاريع سكنية، تجارية، وصناعية من أفضل المطورين.',
  keywords: 'مشاريع عقارية، مشاريع سكنية، مشاريع تجارية، مشاريع صناعية، سوريا',
  canonicalUrl: 'https://boioot.com/projects',
});

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="container mt-4 text-center py-5">جاري التحميل...</div>}>
      <ProjectsListingClient />
    </Suspense>
  );
}


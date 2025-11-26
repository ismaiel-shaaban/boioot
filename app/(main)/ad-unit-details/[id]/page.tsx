import { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';
import UnitDetailsClient from '@/components/pages/unit-details/UnitDetailsClient';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return buildMetadata({
    title: 'تفاصيل الوحدة - بيوت',
    description: 'تفاصيل الوحدة العقارية',
    canonicalUrl: `https://boioot.com/ad-unit-details/${params.id}`,
  });
}

export default async function UnitDetailsPage({ params }: { params: { id: string } }) {
  return <UnitDetailsClient unitId={params.id} />;
}


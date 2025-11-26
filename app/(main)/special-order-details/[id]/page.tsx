import { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';
import SpecialOrderDetailsClient from '@/components/pages/special-order-details/SpecialOrderDetailsClient';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return buildMetadata({
    title: 'تفاصيل طلب التسويق - بيوت',
    description: 'تفاصيل طلب التسويق العقاري',
    canonicalUrl: `https://boioot.com/special-order-details/${params.id}`,
  });
}

export default async function SpecialOrderDetailsPage({ params }: { params: { id: string } }) {
  return <SpecialOrderDetailsClient adId={params.id} />;
}


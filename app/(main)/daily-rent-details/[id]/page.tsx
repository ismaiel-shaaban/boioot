import { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';
import DailyRentDetailsClient from '@/components/pages/daily-rent-details/DailyRentDetailsClient';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return buildMetadata({
    title: 'تفاصيل الإيجار اليومي - بيوت',
    description: 'تفاصيل وحدة الإيجار اليومي',
    canonicalUrl: `https://boioot.com/daily-rent-details/${params.id}`,
  });
}

export default async function DailyRentDetailsPage({ params }: { params: { id: string } }) {
  return <DailyRentDetailsClient adId={params.id} />;
}


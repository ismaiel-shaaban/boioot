import { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';
import AdDetailsClient from '@/components/pages/ad-details/AdDetailsClient';
import { advertisementService } from '@/lib/services/advertisement';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const response = await advertisementService.getAdvertisementById(params.id);
    const ad = response?.Data as any;

    if (ad) {
      return buildMetadata({
        title: `${ad.Title} - بيوت`,
        description: ad.Description || 'تفاصيل الإعلان العقاري في منصة بيوت',
        keywords: ad.Title,
        canonicalUrl: `https://boioot.com/ad-details/${params.id}`,
        ogImage: ad.CoverImageUrl || ad.MediaUrls?.[0]?.url,
      });
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return buildMetadata({
    title: 'تفاصيل الإعلان - بيوت',
    description: 'تفاصيل الإعلان العقاري',
    canonicalUrl: `https://boioot.com/ad-details/${params.id}`,
  });
}

export default async function AdDetailsPage({ params }: { params: { id: string } }) {
  return <AdDetailsClient adId={params.id} />;
}


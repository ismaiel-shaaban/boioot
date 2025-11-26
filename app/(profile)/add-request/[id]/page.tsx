import { Metadata } from 'next';
import { projectsService } from '@/lib/services/projects';
import AddPropertyRequestClient, { City } from '@/components/pages/add-property-request/AddPropertyRequestClient';
import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'تعديل طلب عقار | بوابة العقارات',
  description: 'صفحة تعديل طلب عقار في بوابة العقارات، قم بتحديث تفاصيل الطلب لإعادة نشره.',
});

async function fetchCities(): Promise<{ cities: City[]; error: string | null }> {
  let cities: City[] = [];
  let error: string | null = null;

  try {
    const response = await projectsService.getCities();
    if (Array.isArray(response)) {
      cities = response as City[];
    } else if (response?.Data && Array.isArray(response.Data)) {
      cities = response.Data as City[];
    } else if (response && typeof response === 'object' && 'Items' in response) {
      cities = ((response as { Items?: City[] }).Items || []) as City[];
    }
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل المدن';
  }

  return { cities, error };
}

interface EditPropertyRequestPageProps {
  params: { id: string };
}

export default async function EditPropertyRequestPage({ params }: EditPropertyRequestPageProps) {
  const { cities, error } = await fetchCities();

  return <AddPropertyRequestClient initialCities={cities} error={error} requestId={params.id} />;
}


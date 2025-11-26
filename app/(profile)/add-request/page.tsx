import { Metadata } from 'next';
import { Suspense } from 'react';
import { projectsService } from '@/lib/services/projects';
import AddPropertyRequestClient, { City } from '@/components/pages/add-property-request/AddPropertyRequestClient';
import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'إضافة طلب عقار جديد | بوابة العقارات',
  description: 'صفحة إضافة طلب عقار جديد في بوابة العقارات، أدخل تفاصيل الطلب لإتمام العملية.',
});

export default async function AddPropertyRequestPage() {
  let cities: City[] = [];
  let error: string | null = null;

  try {
    const response = await projectsService.getCities();
    // Handle both array and ApiResponse formats
    if (Array.isArray(response)) {
      cities = response;
    } else if (response?.Data && Array.isArray(response.Data)) {
      cities = response.Data;
    } else if (response && typeof response === 'object' && 'Items' in response) {
      cities = (response as { Items?: City[] }).Items || [];
    }
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : 'حدث خطأ أثناء تحميل المدن';
  }

  return (
    <Suspense fallback={<div className="container py-5">جاري التحميل...</div>}>
      <AddPropertyRequestClient initialCities={cities} error={error} />
    </Suspense>
  );
}


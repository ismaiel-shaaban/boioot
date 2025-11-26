import { Metadata } from 'next';
import { projectsService } from '@/lib/services/projects';
import CompanyInfoClient from '@/components/pages/company-info/CompanyInfoClient';
import { generateMetadata as getMetadata } from '@/lib/utils/metadata';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const response = await projectsService.getCompanyProfileById(params.id);
    if (response?.IsSuccess && response?.Data) {
      const data = response.Data as any;
      if (data?.Name) {
        return getMetadata({
          title: `${data.Name} | بوابة العقارات`,
          description: data.Name || 'صفحة معلومات الشركة في بوابة العقارات، استعرض بيانات الشركة ومشاريةها.',
        });
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return getMetadata({
    title: 'معلومات الشركة | بوابة العقارات',
    description: 'صفحة معلومات الشركة في بوابة العقارات، استعرض بيانات الشركة ومشاريةها.',
  });
}

export default async function CompanyInfoPage({ params }: { params: { id: string } }) {
  let companyProfile: any = null;
  let projects: any[] = [];
  let error: string | null = null;

  try {
    const response = await projectsService.getCompanyProfileById(params.id);
    if (response?.IsSuccess) {
      companyProfile = response.Data;
      // Load projects if available
      // You might want to add a method to get company projects
    } else {
      error = response?.Error || 'فشل في تحميل بيانات الشركة';
    }
  } catch (err: any) {
    error = err?.message || 'حدث خطأ أثناء تحميل بيانات الشركة';
  }

  return <CompanyInfoClient companyProfile={companyProfile} projects={projects} error={error} companyId={params.id} />;
}


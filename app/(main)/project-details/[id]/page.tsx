import { Metadata } from 'next';
import { Suspense } from 'react';
import { projectsService } from '@/lib/services/projects';
import ProjectDetailsClient from '@/components/pages/project-details/ProjectDetailsClient';
import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const response = await projectsService.getProjectById(params.id);
    if (response?.IsSuccess && response?.Data) {
      const project = response.Data as any;
      if (project?.Name) {
        return buildMetadata({
          title: `${project.Name} | بوابة العقارات`,
          description: project.Description || 'صفحة مشروع رئيسي في بوابة العقارات، استعرض تفاصيل المشروع الرئيسي.',
        });
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return buildMetadata({
    title: 'مشروع رئيسي | بوابة العقارات',
    description: 'صفحة مشروع رئيسي في بوابة العقارات، استعرض تفاصيل المشروع الرئيسي.',
  });
}

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  let project: any = null;
  let error: string | null = null;

  try {
    const response = await projectsService.getProjectById(params.id);
    if (response?.IsSuccess) {
      project = response.Data;
    } else {
      error = response?.Error || 'فشل في تحميل بيانات المشروع';
    }
  } catch (err: any) {
    error = err?.message || 'حدث خطأ أثناء تحميل بيانات المشروع';
  }

  return (
    <Suspense fallback={<div className="container py-5 text-center">جاري التحميل...</div>}>
      <ProjectDetailsClient project={project} error={error} projectId={params.id} />
    </Suspense>
  );
}


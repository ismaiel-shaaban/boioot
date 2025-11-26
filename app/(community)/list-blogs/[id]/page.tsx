import { Metadata } from 'next';
import { communityService } from '@/lib/services/community';
import ListBlogsClient from '@/components/pages/blogs/list-blogs/ListBlogsClient';
import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'قائمة المدونة | بوابة العقارات',
  description: 'صفحة قائمة المدونة في بوابة العقارات، استعرض جميع المقالات حسب الفئة المختارة.',
});

const getRelativeTime = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'ثواني';
  if (diffMins < 60) return `${diffMins} دقيقة`;
  if (diffHours < 24) return `${diffHours} ساعة`;
  return `${diffDays} يوم`;
};

export default async function ListBlogsPage({ params }: { params: { id: string } }) {
  let category: any = null;
  let blogs: any[] = [];
  let error: string | null = null;
  let totalPages = 0;
  let totalCount = 0;

  try {
    const [categoryResponse, blogsResponse] = await Promise.all([
      communityService.getCategoryInfo(params.id, 1),
      communityService.getPostsByCategory(params.id, 1, 5, 1),
    ]);

    if (categoryResponse?.IsSuccess) {
      category = categoryResponse.Data;
    }

    if (blogsResponse?.IsSuccess) {
      const data = blogsResponse.Data as any;
      // Process relative time for each blog (matching Angular)
      blogs = (data?.Items || []).map((blog: any) => {
        if (blog?.CreatedAt) {
          blog.CreatedAt = getRelativeTime(blog.CreatedAt);
        }
        return blog;
      });
      totalPages = data?.TotalPages || 0;
      totalCount = data?.TotalCount || 0;
    }
  } catch (err: any) {
    error = err?.message || 'حدث خطأ أثناء تحميل المدونة';
  }

  return (
    <ListBlogsClient
      categoryId={params.id}
      initialCategory={category}
      initialBlogs={blogs}
      initialTotalPages={totalPages}
      initialTotalCount={totalCount}
      error={error}
    />
  );
}


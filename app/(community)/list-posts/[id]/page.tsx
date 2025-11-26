import { Metadata } from 'next';
import { communityService } from '@/lib/services/community';
import ListPostsClient from '@/components/pages/community/list-posts/ListPostsClient';
import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'قائمة المشاركات | بوابة العقارات',
  description: 'صفحة قائمة المشاركات في بوابة العقارات، استعرض جميع المشاركات حسب الفئة المختارة.',
});

export default async function ListPostsPage({ params }: { params: { id: string } }) {
  let category: any = null;
  let posts: any[] = [];
  let popularShares: any[] = [];
  let error: string | null = null;
  let totalPages = 0;
  let totalCount = 0;

  try {
    const [categoryResponse, postsResponse] = await Promise.all([
      communityService.getCategoryInfo(params.id, 0),
      communityService.getPostsByCategory(params.id, 1, 5, 0),
    ]);

    if (categoryResponse?.IsSuccess) {
      category = categoryResponse.Data;
    }

    if (postsResponse?.IsSuccess && postsResponse.Data) {
      const data = postsResponse.Data as any;
      posts = data?.Items || [];
      totalPages = data?.TotalPages || 0;
      totalCount = data?.TotalCount || 0;
    }

    // Load popular shares
    try {
      const popularResponse = await communityService.getPopularPosts(0);
      if (popularResponse?.IsSuccess && popularResponse.Data) {
        const data = popularResponse.Data as any;
        popularShares = data?.Items || [];
      }
    } catch (err) {
      // Ignore error for popular shares
    }
  } catch (err: any) {
    error = err?.message || 'حدث خطأ أثناء تحميل المشاركات';
  }

  return (
    <ListPostsClient
      categoryId={params.id}
      initialCategory={category}
      initialPosts={posts}
      initialPopularShares={popularShares}
      initialTotalPages={totalPages}
      initialTotalCount={totalCount}
      error={error}
    />
  );
}


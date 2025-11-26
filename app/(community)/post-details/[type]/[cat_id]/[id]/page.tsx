import { Metadata } from 'next';
import { communityService } from '@/lib/services/community';
import PostDetailsClient from '@/components/pages/community/post-details/PostDetailsClient';
import { generateMetadata as buildMetadata } from '@/lib/utils/metadata';

export async function generateMetadata({ params }: { params: { type: string; cat_id: string; id: string } }): Promise<Metadata> {
  const postType = parseInt(params.type) || 0;

  try {
    const response = await communityService.getPostDetails(params.id, postType);
    if (response?.IsSuccess && response?.Data) {
      const post = response.Data as any;
      return buildMetadata({
        title: post.MetaTitle || post.Title || 'تفاصيل المشاركة | بوابة العقارات',
        description: post.MetaDescription || post.Excerpt || 'صفحة تفاصيل المشاركة في بوابة العقارات',
        keywords: post.MetaKeywords,
      });
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return buildMetadata({
    title: 'تفاصيل المشاركة | بوابة العقارات',
    description: 'صفحة تفاصيل المشاركة في بوابة العقارات',
  });
}

export default async function PostDetailsPage({ params }: { params: { type: string; cat_id: string; id: string } }) {
  const postType = parseInt(params.type) || 0;
  let post: any = null;
  let category: any = null;
  let comments: any[] = [];
  let popularShares: any[] = [];
  let error: string | null = null;

  try {
    const [postResponse, categoryResponse, commentsResponse, popularResponse] = await Promise.all([
      communityService.getPostDetails(params.id, postType),
      communityService.getCategoryInfo(params.cat_id, postType),
      communityService.getComments(params.id),
      communityService.getCategoriesPostsInSidebar(params.cat_id, postType),
    ]);

    if (postResponse?.IsSuccess) {
      post = postResponse.Data;
    } else {
      error = postResponse?.Error || 'فشل في تحميل المشاركة';
    }

    if (categoryResponse?.IsSuccess) {
      category = categoryResponse.Data;
    }

    if (commentsResponse?.IsSuccess) {
      comments = (commentsResponse.Data as any) || [];
    }

    if (popularResponse?.IsSuccess) {
      popularShares = (popularResponse.Data as any) || [];
    }

    // View post
    try {
      await communityService.viewPost(params.id);
    } catch (err) {
      // Ignore view error
    }
  } catch (err: any) {
    error = err?.message || 'حدث خطأ أثناء تحميل المشاركة';
  }

  return (
    <PostDetailsClient
      post={post}
      category={category}
      initialComments={comments}
      popularShares={popularShares}
      postType={postType}
      postId={params.id}
      error={error}
      mainTitle={postType === 1 ? 'المدونة' : 'المجتمع'}
      mainLink={postType === 1 ? '/blogs' : '/community'}
    />
  );
}


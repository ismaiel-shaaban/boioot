import { Metadata } from 'next';
import { communityService } from '@/lib/services/community';
import UserPostsListClient from '@/components/pages/community/user-posts-list/UserPostsListClient';
import { generateMetadata as getMetadata } from '@/lib/utils/metadata';

export const metadata: Metadata = getMetadata({
  title: 'مشاركات المستخدم | بوابة العقارات',
  description: 'مشاركات المستخدم في المجتمع أو المدونة على بوابة العقارات.',
});

export default async function UserPostsListPage({ params }: { params: { id: string } }) {
  let posts: any[] = [];
  let profileData: any = null;
  let error: string | null = null;

  try {
    const response = await communityService.getPostsByUserId2(params.id);
    if (response?.IsSuccess) {
      const data = response.Data as any;
      posts = data?.Posts || [];
      profileData = {
        name: data?.FullName || '',
        avatar: data?.ProfileImageUrl || null,
        LastSeen: data?.LastSeen || null,
        stats: {
          posts: data?.TotalPosts || 0,
          replies: data?.TotalReplies || 0,
        },
      };
    } else {
      error = response?.Error || 'فشل في تحميل المشاركات';
    }
  } catch (err: any) {
    error = err?.message || 'حدث خطأ أثناء تحميل المشاركات';
  }

  return (
    <UserPostsListClient
      userId={params.id}
      initialPosts={posts}
      initialProfileData={profileData}
      error={error}
    />
  );
}


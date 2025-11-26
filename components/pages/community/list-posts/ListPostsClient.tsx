'use client';

import { useState, useEffect } from 'react';
import { communityService } from '@/lib/services/community';
import { showToast } from '@/lib/utils/toast';
import Posts from '@/components/community/Posts';
import PopularShares from '@/components/community/PopularShares';
import Breadcrumb from '@/components/community/Breadcrumb';

interface ListPostsClientProps {
  categoryId: string;
  initialCategory: any;
  initialPosts: any[];
  initialPopularShares: any[];
  initialTotalPages: number;
  initialTotalCount: number;
  error: string | null;
}

export default function ListPostsClient({
  categoryId,
  initialCategory,
  initialPosts,
  initialPopularShares,
  initialTotalPages,
  initialTotalCount,
  error,
}: ListPostsClientProps) {
  const [category, setCategory] = useState(initialCategory);
  const [posts, setPosts] = useState(initialPosts);
  const [popularShares, setPopularShares] = useState(initialPopularShares);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const pageSize = 5;

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error]);

  const loadPosts = async (page: number) => {
    setLoading(true);
    try {
      const response = await communityService.getPostsByCategory(categoryId, page, pageSize, 0);
      if (response?.IsSuccess && response.Data) {
        const data = response.Data as any;
        setPosts(data?.Items || []);
        setTotalPages(data?.TotalPages || 0);
        setTotalCount(data?.TotalCount || 0);
      } else {
        showToast(response?.Error || 'فشل في تحميل المشاركات', 'error');
      }
    } catch (error: any) {
      showToast(error?.message || 'حدث خطأ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage > 1) {
      loadPosts(currentPage);
    }
  }, [currentPage]);

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

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-8">
          {category && (
            <Breadcrumb
              main_link="/community"
              main_title="المجتمع"
              category={category.Name || 'الفئة'}
              categoryId={categoryId}
              links="/list-posts"
            />
          )}

          <h1 className="mb-4">{category?.Name || 'المشاركات'}</h1>

          <Posts
            blogs={posts}
            pageSize={pageSize}
            page={currentPage - 1}
            loading={loading}
            error={error}
            totalItems={totalCount}
            totalPages={totalPages}
            categoryId={categoryId}
            onPageChange={(page) => setCurrentPage(page + 1)}
          />
        </div>

        <div className="col-md-4">
          <PopularShares type={0} categoryId={categoryId} shares={popularShares} />
        </div>
      </div>
    </div>
  );
}


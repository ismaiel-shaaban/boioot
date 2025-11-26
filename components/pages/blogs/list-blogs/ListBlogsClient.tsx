'use client';

import { useState, useEffect } from 'react';
import { communityService } from '@/lib/services/community';
import { showToast } from '@/lib/utils/toast';
import Breadcrumb from '@/components/community/Breadcrumb';
import Posts from '@/components/community/Posts';

interface ListBlogsClientProps {
  categoryId?: string;
  initialCategory?: any;
  initialBlogs?: any[];
  initialTotalPages?: number;
  initialTotalCount?: number;
  error?: string | null;
}

export default function ListBlogsClient({
  categoryId = '0',
  initialCategory = null,
  initialBlogs = [],
  initialTotalPages = 0,
  initialTotalCount = 0,
  error = null,
}: ListBlogsClientProps = {}) {
  const [category, setCategory] = useState(initialCategory);
  const [blogs, setBlogs] = useState(initialBlogs);
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

  const getCategoryInfo = async (catId: string) => {
    try {
      const response = await communityService.getCategoryInfo(catId, 1);
      if (response?.IsSuccess) {
        setCategory(response.Data);
      } else {
        showToast(response?.Message || 'حدث خطأ أثناء تحميل معلومات الفئة', 'error');
      }
    } catch (error: any) {
      showToast('حدث خطأ في الاتصال بالخادم', 'error');
    }
  };

  const loadBlogs = async (page: number, catId?: string) => {
    setLoading(true);
    try {
      const targetCategoryId = catId || categoryId;
      const response = await communityService.getPostsByCategory(targetCategoryId, page, pageSize, 1);
      if (response?.IsSuccess) {
        const data = response.Data as any;
        const blogsWithRelativeTime = (data?.Items || []).map((blog: any) => {
          if (blog?.CreatedAt) {
            blog.CreatedAt = getRelativeTime(blog.CreatedAt);
          }
          return blog;
        });
        setBlogs(blogsWithRelativeTime);
        setTotalPages(data?.TotalPages || 0);
        setTotalCount(data?.TotalCount || 0);
        setCurrentPage(data?.PageNumber || page);
      } else {
        showToast(response?.Message || 'حدث خطأ أثناء تحميل المنشورات', 'error');
      }
    } catch (error: any) {
      showToast('حدث خطأ في الاتصال بالخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load data on mount - matching Angular's ngOnInit
    if (categoryId && categoryId !== '0') {
      // If we have initial data, use it, otherwise load
      if (!initialBlogs || initialBlogs.length === 0) {
        setLoading(true);
        Promise.all([
          getCategoryInfo(categoryId),
          loadBlogs(1, categoryId)
        ]).finally(() => {
          setLoading(false);
        });
      }
    } else if (!initialBlogs || initialBlogs.length === 0) {
      // Load default blogs (categoryId === '0')
      loadBlogs(1, '0');
    }
  }, []); // Only run on mount

  const changePage = (page: number) => {
    setCurrentPage(page);
    loadBlogs(page, categoryId);
  };

  useEffect(() => {
    // Handle page changes when currentPage changes from pagination
    if (currentPage > 1 && categoryId) {
      loadBlogs(currentPage, categoryId);
    }
  }, [currentPage]); // Only when currentPage changes

  return (
    <div className="community-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <Breadcrumb
              main_title="المدونة"
              main_link="/blogs"
              links="/list-blogs"
              title={null}
              category={category?.Name}
              categoryId={category?.Id || categoryId}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="row">
          {/* Main Content Area */}
          <div className="col-lg-12 order-lg-1 order-1">
            <div className="mb-4">
              <Posts
                blogs={blogs}
                pageSize={pageSize}
                page={currentPage}
                loading={loading}
                error={null}
                totalItems={totalCount}
                totalPages={totalPages}
                categoryId={categoryId}
                onPageChange={changePage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


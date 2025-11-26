'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { communityService } from '@/lib/services/community';
import { showToast } from '@/lib/utils/toast';
import { useAuth } from '@/lib/contexts/AuthContext';
import styles from './CommunityClient.module.css';

interface CommunityPost {
  Id: number;
  Name: string;
  Slug: string;
  IconUrl: string;
  PostsCount: number;
  TotalRepliesCount: number;
  LatestPost: {
    Id: number;
    Title: string;
    AuthorName?: string;
    AuthorFullName?: string;
    AuthorId: string;
    RepliesCount: number;
    LikesCount: number;
    ViewsCount: number;
    CommentsCount: number;
    CreatedAt: string;
  } | null;
}

export default function CommunityClient() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [communities, setCommunities] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await communityService.getCategoriesWithLatestPosts("0");
      if (response?.IsSuccess) {
        const data = response.Data as any;
        const categories = (Array.isArray(data) ? data : []) as CommunityPost[];
        
        // Process relative time for each community's latest post
        categories.forEach((community: CommunityPost) => {
          if (community?.LatestPost && community?.LatestPost?.CreatedAt) {
            community.LatestPost.CreatedAt = getRelativeTime(community.LatestPost.CreatedAt);
          }
        });
        
        setCommunities(categories);
      } else {
        setError('فشل في تحميل المجتمعات');
        showToast(response?.Message || 'فشل في تحميل المجتمعات', 'error');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'حدث خطأ أثناء جلب المجتمعات';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (dateString: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000); // minutes
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'ثواني';
    if (diffMins < 60) return `${diffMins} دقيقة`;
    if (diffHours < 24) return `${diffHours} ساعة`;
    return `${diffDays} يوم`;
  };

  const addPost = () => {
    router.push('/profile?tab=add-post');
  };

  return (
    <div className={styles.communitiesMain}>
      <div className="container">
        {/* Communities Filter */}
        <div className={`${styles.communitiesFilter} d-flex justify-content-between align-items-center mb-3`} role="region" aria-label="تصفية المجتمعات">
          <div className={styles.filterItem}>كل المجتمعات</div>
          {isAuthenticated && (
            <button className="btn btn-success" onClick={addPost} aria-label="إضافة مشاركة جديدة">
              إضافة مشاركة
            </button>
          )}
        </div>

        {/* Communities Grid */}
        <div className={styles.communitiesGrid} role="region" aria-label="قائمة المجتمعات">
          {loading ? (
            <div className="text-center py-5" aria-live="polite">
              <div className="spinner-border text-primary" role="status" aria-label="جاري التحميل">
                <span className="visually-hidden">جاري التحميل...</span>
              </div>
              <p className="mt-3">جاري تحميل المجتمعات...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          ) : communities.length > 0 ? (
            <div className="row">
              {communities.map((community) => (
                <div key={community.Id} className="col-md-6 col-lg-4 mb-4">
                  <div className={styles.communityCard} role="article" aria-label="بطاقة المجتمع">
                    <div className={styles.communityHeader}>
                      <div className={styles.communityIcon}>
                        <Link href={`/list-posts/${community.Id}`}>
                          <img
                            src={community.IconUrl || '/assets/images/no_icon.png'}
                            alt={community.Name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/assets/images/no_icon.png';
                            }}
                            loading="lazy"
                            aria-label="أيقونة"
                          />
                        </Link>
                      </div>
                      <h3 className={styles.communityTitle}>
                        <Link href={`/list-posts/${community.Id}`} aria-label="اسم المجتمع">
                          {community.Name}
                        </Link>
                      </h3>
                      <div className={styles.communityStats} aria-label="إحصائيات المجتمع">
                        <span>
                          {community.PostsCount} مقال، {community.TotalRepliesCount} تعليق
                        </span>
                      </div>
                      <h4 className={styles.latestTitle} aria-label={community.LatestPost ? 'أحدث المشاركات' : 'لا يوجد مشاركات'}>
                        {community.LatestPost ? 'أحدث المشاركات' : 'لا يوجد اشتركات'}
                      </h4>
                    </div>

                    {community.LatestPost && (
                      <div className={styles.communityLatest} aria-label="أحدث مشاركة">
                        <div className={styles.latestPost}>
                          <div className={styles.postMeta}>
                            <Link href={`/user-posts-list/${community.LatestPost.AuthorId}`} className={styles.postAuthor} aria-label="الكاتب">
                              {community.LatestPost.AuthorFullName}
                            </Link>
                            <span className={styles.postTime} aria-label="وقت النشر">
                              قبل {community.LatestPost.CreatedAt}
                            </span>
                          </div>

                          <div className={styles.postTitle}>
                            <Link
                              href={`/post-details/0/${community.Id}/${community.LatestPost.Id}`}
                              onClick={(e) => e.stopPropagation()}
                              aria-label="عنوان المشاركة"
                            >
                              {community.LatestPost.Title}
                            </Link>
                          </div>

                          <div className={styles.postStats} aria-label="إحصائيات المشاركة">
                            <span>
                              {community.LatestPost.LikesCount || 0} لايك، {community.LatestPost.ViewsCount || 0} مشاهدة،{' '}
                              {community.LatestPost.RepliesCount || 0} تعليق
                            </span>
                          </div>

                          <div className={styles.postAction}>
                            <Link
                              href={`/post-details/0/${community.Id}/${community.LatestPost.Id}`}
                              className={styles.backLink}
                              onClick={(e) => e.stopPropagation()}
                              aria-label="عرض تفاصيل المشاركة"
                            >
                              <i className="fa-solid fa-arrow-left"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="row">
              <div className="col-12">
                <div className="alert alert-info text-center" role="alert" aria-label="لا يوجد مجتمعات">
                  لايوجد مجتمعات
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


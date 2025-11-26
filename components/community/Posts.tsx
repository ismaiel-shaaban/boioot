'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/lib/core/models/community.models';
import ShareModal from '@/components/shared/share-modal/ShareModal';
import { communityService } from '@/lib/services/community';
import { useAuth } from '@/lib/contexts/AuthContext';
import { showToast } from '@/lib/utils/toast';
import { environment } from '@/lib/config/environment';
import styles from './Posts.module.css';

interface PostsProps {
  blogs: BlogPost[];
  pageSize: number;
  page: number;
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
  categoryId: string;
  onPageChange: (page: number) => void;
}

export default function Posts({
  blogs,
  pageSize,
  page,
  loading,
  error,
  totalItems,
  totalPages,
  categoryId,
  onPageChange,
}: PostsProps) {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(page || 1);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [blogsList, setBlogsList] = useState<BlogPost[]>(blogs || []);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : environment.baseApiUrl;

  useEffect(() => {
    if (page && page > 0) {
      setCurrentPage(page);
    }
  }, [page]);

  useEffect(() => {
    if (blogs) {
      setBlogsList(blogs);
    }
  }, [blogs]);

  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      onPageChange(newPage);
    }
  };

  const retry = () => {
    onPageChange(currentPage);
  };

  const openShareModal = (blog: BlogPost) => {
    setSelectedBlog(blog);
  };

  const closeShareModal = () => {
    setSelectedBlog(null);
  };

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      handlePageChange(newPage);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      handlePageChange(newPage);
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      handlePageChange(pageNum);
    }
  };

  const likePost = async (postId: any, userReaction: any) => {
    // Authentication check
    if (!isAuthenticated) {
      showToast('الرجاء تسجيل الدخول أولاً للاعجاب بالمنشورات', 'warning');
      return;
    }

    // Validate inputs
    if (!postId) {
      showToast('معرف المنشور غير صحيح', 'error');
      return;
    }

    // Determine new reaction state
    const isCurrentlyLiked = userReaction === 1;
    const newReaction = isCurrentlyLiked ? 2 : 1; // 1 = like, 2 = unlike

    // Find the post in the blogs array to update its state
    const postIndex = blogsList.findIndex((blog) => blog.Id === postId);
    if (postIndex === -1) {
      showToast('المنشور غير موجود', 'error');
      return;
    }

    // Store original state for rollback on error
    const originalPost = { ...blogsList[postIndex] };

    // Optimistically update UI
    const updatedBlogs = [...blogsList];
    updatedBlogs[postIndex] = {
      ...updatedBlogs[postIndex],
      UserReaction: isCurrentlyLiked ? 0 : 1,
      LikesCount: isCurrentlyLiked
        ? (updatedBlogs[postIndex].LikesCount || 1) - 1
        : (updatedBlogs[postIndex].LikesCount || 0) + 1,
    };
    setBlogsList(updatedBlogs);

    try {
      // Make API call
      const response = await communityService.likePost(postId.toString(), newReaction);
      if (response?.IsSuccess) {
        // Success message
        const message = isCurrentlyLiked ? 'تم إلغاء الاعجاب بالمنشور بنجاح' : 'تم الإعجاب بالمنشور بنجاح';
        showToast(message, 'success');

        // Update with actual data from server if available
        if (response.Data) {
          const finalBlogs = [...updatedBlogs];
          finalBlogs[postIndex] = { ...finalBlogs[postIndex], ...response.Data };
          setBlogsList(finalBlogs);
        }
      } else {
        // Rollback on API failure
        const rolledBackBlogs = [...blogsList];
        rolledBackBlogs[postIndex] = originalPost;
        setBlogsList(rolledBackBlogs);
        showToast(response?.Message || 'فشل في تحديث الإعجاب', 'error');
      }
    } catch (error: any) {
      // Rollback on error
      const rolledBackBlogs = [...blogsList];
      rolledBackBlogs[postIndex] = originalPost;
      setBlogsList(rolledBackBlogs);
      console.error('Like post error:', error);
      showToast('حدث خطأ أثناء الإعجاب بالمنشور', 'error');
    }
  };

  const isContentShort = (content: any): boolean => {
    if (!content) return true;
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length <= 200;
  };

  const getTruncatedContent = (content: any, maxLength: number = 200): string => {
    if (!content) return '';

    let sanitized = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

    const textContent = sanitized.replace(/<[^>]*>/g, '');

    if (textContent.length <= maxLength) {
      return limitContentSizes(sanitized);
    }

    const truncatedText = textContent.substring(0, maxLength) + '...';
    return `<p>${truncatedText}</p>`;
  };

  const limitContentSizes = (html: string): string => {
    return html
      .replace(/<img([^>]*?)>/gi, '<img$1 style="max-width: 100%; height: auto; max-height: 100px; object-fit: cover; border-radius: 8px; margin: 4px 0;">')
      .replace(/<h([1-6])([^>]*?)>/gi, '<h6$2 style="font-size: 15px; font-weight: 600; margin: 6px 0 4px 0; color: #333;">')
      .replace(/<\/h[1-6]>/gi, '</h6>')
      .replace(/<p([^>]*?)>/gi, '<p$1 style="margin: 4px 0; line-height: 1.4; font-size: 14px;">')
      .replace(/<(iframe|object|embed)[^>]*>.*?<\/\1>/gi, '');
  };

  if (loading) {
    return (
      <div className="text-center p-4" aria-live="polite">
        <div className="spinner-border text-primary" role="status" aria-label="جاري التحميل">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert" aria-label="خطأ">
        <p>{error}</p>
        <button className="btn btn-outline-danger" onClick={retry} aria-label="إعادة المحاولة">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.communityBlogContainer}>
        <div className="blog-items row g-4">
          {blogsList?.map((item) => (
            <div key={item.Id} className="col-lg-4 col-md-6 col-sm-12">
              <div className={`${styles.postCard} h-100`} role="article" aria-label="مقالة">
                {/* Post Content - Image and Title at top */}
                <div className={styles.postContent}>
                  {/* Post Image */}
                  {item?.CoverMediaUrl && (
                    <div className={styles.postImage}>
                      <Link href={`/post-details/1/${categoryId}/${item?.Id}`} onClick={(e) => e.stopPropagation()}>
                        <img
                          src={item?.CoverMediaUrl}
                          alt={item?.Title || ''}
                          className={styles.contentImage}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/blank-profile.png';
                          }}
                          loading="lazy"
                          aria-label="صورة المقالة"
                        />
                      </Link>
                    </div>
                  )}

                  {/* Post Title */}
                  {item?.Title && (
                    <h4 className={`${styles.postTitle} mt-3`}>
                      <Link href={`/post-details/1/${categoryId}/${item?.Id}`} onClick={(e) => e.stopPropagation()} aria-label="عنوان المقالة">
                        {item?.Title}
                      </Link>
                    </h4>
                  )}

                  {/* Post Content Preview */}
                  <div
                    className={`${styles.postTextContainer} ${isContentShort(item?.Content) ? styles.shortContent : ''}`}
                    dangerouslySetInnerHTML={{ __html: getTruncatedContent(item?.Content) }}
                  />

                  {/* Read More Link */}
                  {!isContentShort(item?.Content) && (
                    <div className={styles.readMoreIndicator}>
                      <Link href={`/post-details/1/${categoryId}/${item?.Id}`} className={styles.readMoreText} onClick={(e) => e.stopPropagation()}>
                        اقرأ المزيد...
                      </Link>
                    </div>
                  )}
                </div>

                {/* Post Header - User Info at bottom */}
                <div className={styles.postHeader}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      <div>
                        <img
                          src={item?.AuthorImageUrl || '/assets/images/blank-profile.png'}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/blank-profile.png';
                          }}
                          alt={item?.AuthorFullName || ''}
                          className={styles.userAvatar}
                          loading="lazy"
                          aria-label="صورة الكاتب"
                        />
                      </div>
                    </div>
                    <div className={styles.userDetails}>
                      <div className={styles.userName} aria-label="اسم الكاتب">{item?.Title || ''}</div>
                      <div className={styles.postTimestamp} aria-label="تاريخ النشر">قبل {item?.CreatedAt}</div>
                    </div>
                  </div>
                </div>

                {/* Post Actions - Stats and Share */}
                <div className={styles.postActions} aria-label="إجراءات المقالة">
                  <div className={styles.postStats}>
                    <div
                      className={`${styles.statItem} ${item?.UserReaction && item?.UserReaction === 1 ? styles.liked : ''} likes`}
                      onClick={() => likePost(item?.Id, item?.UserReaction)}
                      aria-label="إعجاب"
                    >
                      <i className="fa-solid fa-thumbs-up"></i>
                      <span className={styles.statNumber}>{item?.LikesCount || 0}</span>
                    </div>
                    <div className={`${styles.statItem} views`} aria-label="عدد المشاهدات">
                      <i className="fa-solid fa-eye"></i>
                      <span className={styles.statNumber}>{item?.ViewsCount || 0}</span>
                    </div>
                    <div className={`${styles.statItem} comments`} aria-label="عدد التعليقات">
                      <i className="fa-solid fa-comment"></i>
                      <span className={styles.statNumber}>{item?.RepliesCount || 0}</span>
                    </div>
                  </div>
                  <div className={styles.actionButtons}>
                    <button className={styles.shareBtn} onClick={() => openShareModal(item)} aria-label="مشاركة المقالة">
                      <i className="fa-solid fa-share"></i>
                      مشاركة
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {blogsList?.length > 0 && (
          <nav aria-label="Blog pagination mt-5" style={{ marginTop: '30px' }}>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={previousPage} disabled={currentPage === 1}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </li>

              {getPageNumbers().map((p) => (
                <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => goToPage(p)}>
                    {p}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={nextPage} disabled={currentPage >= totalPages}>
                  <i className="fas fa-chevron-left"></i>
                </button>
              </li>
            </ul>
          </nav>
        )}

        {/* No Blogs Message */}
        {blogsList?.length === 0 && !loading && (
          <div className="row">
            <div className="col-12">
              <div className="alert alert-info text-center" role="alert" aria-label="لا توجد مشاركات متاحة حالياً">
                لا توجد مشاركات متاحة حالياً
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {selectedBlog && (
        <ShareModal
          shareUrl={`${baseUrl}/post-details/1/${categoryId}/${selectedBlog?.Id}`}
          shareTitle={selectedBlog?.Title || ''}
          adId={String(selectedBlog?.Id || '')}
          userId={selectedBlog?.AuthorId || null}
          onClose={closeShareModal}
        />
      )}
    </>
  );
}


'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { communityService } from '@/lib/services/community';
import { showToast } from '@/lib/utils/toast';
import ShareModal from '@/components/shared/share-modal/ShareModal';
import { environment } from '@/lib/config/environment';
import { useAuth } from '@/lib/contexts/AuthContext';
import styles from './PostsList.module.css';

interface BlogPost {
  Id: string;
  Title: string;
  Content: string;
  CategoryId: string;
  CategoryName?: string;
  CoverMediaUrl?: string;
  CreatedAt: string;
  LikesCount?: number;
  ViewsCount?: number;
  RepliesCount?: number;
}

interface PostsListProps {
  onChangeTab?: (post: any) => void;
  authorId?: string;
}

export default function PostsList({ onChangeTab, authorId }: PostsListProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const resolvedAuthorId = useMemo(() => {
    if (authorId) return authorId;
    if (user) {
      return user.Id || user.id || user.UserId || user.userId || user.sub || user.nameid;
    }
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          return parsed?.Id || parsed?.id || parsed?.UserId || parsed?.userId;
        } catch (error) {
          console.warn('Failed to parse stored user', error);
        }
      }
    }
    return undefined;
  }, [authorId, user]);

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    try {
      if (!resolvedAuthorId) {
        setLoading(false);
        return;
      }
      const response = await communityService.getPostsByUserId(resolvedAuthorId);
      if (response?.IsSuccess || response?.Success) {
        const data = response?.Data as any || {};
        const posts = data?.Posts || [];
        setAllBlogs(posts);
        setTotalItems(posts.length);
        setTotalPages(Math.ceil(posts.length / pageSize));
        changePage(1);
      } else {
        showToast(response?.Error || 'فشل في تحميل المشاركات', 'error');
      }
    } catch (error: any) {
      console.error('Error loading posts:', error);
      showToast('حدث خطأ أثناء تحميل المشاركات', 'error');
    } finally {
      setLoading(false);
    }
  }, [resolvedAuthorId, pageSize]);

  useEffect(() => {
    if (!resolvedAuthorId) return;
    loadBlogs();
  }, [loadBlogs, resolvedAuthorId]);

  useEffect(() => {
    changePage(page);
  }, [page, allBlogs]);

  const changePage = (pageNumber: number) => {
    setPage(pageNumber);
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBlogs = allBlogs.slice(startIndex, endIndex).map((blog) => ({
      ...blog,
      CreatedAt: getRelativeTime(blog.CreatedAt),
    }));
    setBlogs(paginatedBlogs);
  };

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

  const openShareModal = (blog: BlogPost) => {
    setSelectedBlog(blog);
    // Bootstrap modal would be opened here if needed
  };

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
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
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const previousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  const editPost = (post: BlogPost) => {
    if (onChangeTab) {
      onChangeTab({
        Id: post.Id,
        Title: post.Title,
        Content: post.Content,
        CategoryId: post.CategoryId,
        CoverMediaUrl: post.CoverMediaUrl,
      });
    }
  };

  const openDeleteModal = (postId: string) => {
    setSelectedPostId(postId);
    setShowDeleteDialog(true);
  };

  const toggleDeleteDialog = () => {
    setShowDeleteDialog(!showDeleteDialog);
    if (showDeleteDialog) {
      setSelectedPostId(null);
    }
  };

  const deletePost = async () => {
    if (!selectedPostId) return;

    try {
      const response = await communityService.deletePost(selectedPostId);
      if (response?.IsSuccess || response?.Success) {
        showToast('تم الحذف بنجاح', 'success');
        setSelectedPostId(null);
        toggleDeleteDialog();
        loadBlogs();
      } else {
        showToast(response?.Error || 'فشل في حذف المشاركة', 'error');
        toggleDeleteDialog();
      }
    } catch (error: any) {
      console.error('Error deleting post:', error);
      showToast('حدث خطأ أثناء حذف المشاركة', 'error');
      toggleDeleteDialog();
    }
  };

  const isContentShort = (content: string | undefined): boolean => {
    if (!content) return true;
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length <= 200;
  };

  const getTruncatedContent = (content: string | undefined, maxLength: number = 200): string => {
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

  const shareUrl = selectedBlog
    ? `${environment.baseApiUrl}/post-details/0/${selectedBlog.CategoryId}/${selectedBlog.Id}`
    : '';

  return (
    <div className={styles.ordersTab} role="main" aria-label="علامة المشاركات">
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-2">جاري تحميل المشاركات...</p>
        </div>
      )}

      {!loading && blogs.length > 0 && (
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className={styles.blogItems} aria-label="قائمة المشاركات">
                {blogs.map((item) => (
                  <div key={item.Id}>
                    <div className={styles.blogItem} aria-label="مشاركة">
                      <div className={`${styles.blogHeader} d-flex justify-content-between align-items-center`}>
                        <div className={`${styles.blogUserInfo} d-flex align-items-center`}>
                          <div>
                            <a
                              className={styles.blogCategory}
                              onClick={() => router.push(`/list-posts/${item.CategoryId}`)}
                              style={{ cursor: 'pointer' }}
                            >
                              {item.CategoryName}
                            </a>
                            <h3
                              className={styles.blogTitle}
                              onClick={() => router.push(`/post-details/0/${item.CategoryId}/${item.Id}`)}
                              style={{ cursor: 'pointer' }}
                            >
                              {item.Title}
                            </h3>
                          </div>
                        </div>
                        <div className={styles.blogTime}>قبل {item.CreatedAt}</div>
                      </div>

                      <div
                        className={styles.blogContent}
                        onClick={() => router.push(`/post-details/0/${item.CategoryId}/${item.Id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        {item.CoverMediaUrl && (
                          <div className={`${styles.blogImage} mb-3`}>
                            <img
                              src={item.CoverMediaUrl}
                              alt={item.Title}
                              className="img-fluid rounded"
                              loading="lazy"
                              aria-label="صورة المشاركة"
                            />
                          </div>
                        )}

                        <div
                          className={`${styles.postTextContainer} ${isContentShort(item.Content) ? styles.shortContent : ''}`}
                          dangerouslySetInnerHTML={{ __html: getTruncatedContent(item.Content) }}
                        ></div>
                        {!isContentShort(item.Content) && (
                          <div className={styles.readMoreIndicator}>
                            <span
                              className={styles.readMoreText}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/post-details/0/${item.CategoryId}/${item.Id}`);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              اقرأ المزيد...
                            </span>
                          </div>
                        )}
                      </div>

                      <div className={`${styles.blogFooter} d-flex justify-content-between align-items-center`}>
                        <div className={`${styles.blogStats} d-flex align-items-center`}>
                          <div className={`${styles.statItem} ${styles.likes}`}>
                            <i className="fa-solid fa-thumbs-up reactions-icons"></i>
                            <span className={styles.statValue}>{item.LikesCount || 0}</span>
                          </div>
                          <div className={`${styles.statItem} ${styles.views}`}>
                            <i className="fa-solid fa-eye reactions-icons"></i>
                            <span className={styles.statValue}>{item.ViewsCount || 0}</span>
                          </div>
                          <div className={`${styles.statItem} ${styles.comments}`}>
                            <i className="fa-solid fa-comment reactions-icons"></i>
                            <span className={styles.statValue}>{item.RepliesCount || 0}</span>
                          </div>
                        </div>
                        <div className={styles.blogActions}>
                          <a
                            href="javascript:void(0)"
                            className={styles.blogActionLink}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openShareModal(item);
                            }}
                          >
                            <i className="fa-solid fa-share share-icon"></i> مشاركة
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardActionsContainer}>
                      <button
                        className={`btn ${styles.btnEdit}`}
                        onClick={() => editPost(item)}
                        aria-label="تعديل المشاركة"
                      >
                        <i className="fas fa-edit"></i> تعديل
                      </button>
                      <button
                        className={`btn ${styles.btnDelete}`}
                        onClick={() => openDeleteModal(item.Id)}
                        aria-label="حذف المشاركة"
                      >
                        <i className="fas fa-trash"></i> حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {blogs.length > 0 && (
                <nav aria-label="Blog pagination">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={previousPage} disabled={page === 1}>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>

                    {getPageNumbers().map((p) => (
                      <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => goToPage(p)}>
                          {p}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={nextPage} disabled={page >= totalPages}>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && blogs.length === 0 && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-info text-center" role="alert">
              لا توجد مشاركات حالية
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {selectedBlog && (
        <ShareModal
          shareUrl={shareUrl}
          shareTitle={selectedBlog.Title}
          adId={selectedBlog.Id}
          userId=""
          onClose={() => setSelectedBlog(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className={styles.cancellationDialog} role="dialog" aria-label="تأكيد حذف المشاركة">
          <div
            className={styles.dialogOverlay}
            onClick={toggleDeleteDialog}
            aria-label="إغلاق نافذة التأكيد"
          ></div>
          <div className={styles.dialogContent}>
            <h3 className={styles.dialogTitle}>تأكيد الحذف</h3>
            <p className={styles.dialogMessage}>
              هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className={styles.dialogActions}>
              <button
                className={`btn ${styles.btnSuccess}`}
                onClick={deletePost}
                aria-label="تأكيد حذف المشاركة"
              >
                حذف المنشور
              </button>
              <button
                className={`btn ${styles.btnCancel}`}
                onClick={toggleDeleteDialog}
                aria-label="تراجع"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

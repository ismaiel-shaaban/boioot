'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { communityService } from '@/lib/services/community';
import { useAuth } from '@/lib/contexts/AuthContext';
import { showToast } from '@/lib/utils/toast';
import Breadcrumb from '@/components/community/Breadcrumb';
import Comments from '@/components/community/Comments';
import PopularShares from '@/components/community/PopularShares';
import ShareModal from '@/components/shared/share-modal/ShareModal';
import { environment } from '@/lib/config/environment';
import styles from './PostDetailsClient.module.css';

interface PostDetailsClientProps {
  post: any;
  category: any;
  initialComments: any[];
  popularShares: any[];
  postType: number;
  postId: string;
  error: string | null;
  mainTitle: string;
  mainLink: string;
}

export default function PostDetailsClient({
  post: initialPost,
  category,
  initialComments,
  popularShares,
  postType,
  postId,
  error: initialError,
  mainTitle,
  mainLink,
}: PostDetailsClientProps) {
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState(initialComments);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [isHoveringLike, setIsHoveringLike] = useState(false);
  const [isHoveringShare, setIsHoveringShare] = useState(false);

  const baseUrl = environment.baseApiUrl;

  useEffect(() => {
    if (initialError) {
      showToast(initialError, 'error');
    }
  }, [initialError]);

  useEffect(() => {
    if (post) {
      setIsLiked(post?.UserReaction === 1);
    }
  }, [post]);

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

  const loadPost = async () => {
    setLoading(true);
    try {
      const response = await communityService.getPostDetails(postId, postType);
      if (response?.IsSuccess) {
        setPost(response.Data);
      } else {
        showToast(response?.Error || 'فشل في تحميل المشاركة', 'error');
      }
    } catch (error: any) {
      showToast(error?.message || 'حدث خطأ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await communityService.getComments(postId);
      if (response?.IsSuccess) {
        setComments(Array.isArray(response.Data) ? response.Data : []);
      }
    } catch (error: any) {
      console.error('Error loading comments:', error);
    }
  };

  const handleLikePost = async () => {
    if (!isAuthenticated) {
      showToast('الرجاء تسجيل الدخول أولاً للاعجاب بالمنشورات', 'warning');
      return;
    }

    try {
      const userReaction = post?.UserReaction;
      const newType = userReaction === 1 ? 2 : 1; // 1 = like, 2 = unlike
      const response = await communityService.likePost(postId, newType);
      if (response?.IsSuccess) {
        showToast(
          userReaction === 1 ? 'تم إلغاء الاعجاب بالمنشور بنجاح' : 'تم الإعجاب بالمنشور بنجاح',
          'success'
        );
        loadPost(); // Reload to get updated likes count
      } else {
        showToast(response?.Message || response?.Error || 'فشل العملية', 'error');
      }
    } catch (error: any) {
      showToast(error?.message || 'حدث خطأ', 'error');
    }
  };

  const handleSharePost = async () => {
    try {
      const response = await communityService.sharePost(postId);
      if (response?.IsSuccess) {
        openShareModal();
      } else {
        showToast(response?.Error || 'فشل العملية', 'error');
      }
    } catch (error: any) {
      console.error('Error sharing post:', error);
    }
  };

  const handleAddComment = async (comment: string) => {
    if (!isAuthenticated) {
      showToast('يرجى تسجيل الدخول أولاً', 'warning');
      return;
    }

    try {
      const response = await communityService.addComment(postId, comment);
      if (response?.IsSuccess) {
        showToast('تم إضافة التعليق بنجاح', 'success');
        loadComments();
      } else {
        showToast(response?.Error || 'فشل إضافة التعليق', 'error');
      }
    } catch (error: any) {
      showToast(error?.message || 'حدث خطأ', 'error');
    }
  };

  const openShareModal = () => {
    if (!isAuthenticated) {
      showToast('الرجاء تسجيل الدخول أولاً للمشاركة بالمنشورات', 'warning');
      return;
    }
    setSelectedBlog(post);
    const modalElement = document.getElementById('shareModal');
    if (modalElement && typeof window !== 'undefined' && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  };

  if (!post) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <p>{error || 'لا يمكن تحميل المشاركة'}</p>
        </div>
      </div>
    );
  }

  const processedPost = post ? {
    ...post,
    CreatedAt: post.CreatedAt && !post.CreatedAt.includes('دقيقة') && !post.CreatedAt.includes('ساعة') && !post.CreatedAt.includes('يوم') && !post.CreatedAt.includes('ثواني')
      ? getRelativeTime(post.CreatedAt)
      : post.CreatedAt
  } : null;

  return (
    <div className={styles.blogDetailsPage}>
      <div className="container">
        {/* Breadcrumb */}
        <div className="row mb-3">
          <div className="col-12">
            <Breadcrumb
              main_title={mainTitle}
              main_link={mainLink}
              title={post?.Title || ''}
              category={category?.Name || ''}
              categoryId={category?.Id || ''}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="row">
          {/* Left Sidebar - Popular Subjects */}
          <div className="col-lg-3 order-lg-2 order-3 mb-4">
            <PopularShares
              type={postType}
              categoryId={category?.Id || ''}
              shares={popularShares}
            />
          </div>

          {/* Main Content Area */}
          <div className="col-lg-9 order-lg-1 order-1">
            <div className="row mb-4">
              <div className="col-12">
                <div className="mb-5">
                  <h1 className={styles.blogMainTitle}>{post?.Title}</h1>
                  <div className={styles.blogMeta}>
                    <span className={styles.metaItem}>قبل {processedPost?.CreatedAt}</span>
                    <span className={styles.metaSeparator}>|</span>
                    <span className={styles.metaItem}>{post?.ViewsCount || 0} مشاهدة</span>
                    <span className={styles.metaSeparator}>|</span>
                    <span className={styles.metaItem}>{post?.RepliesCount || 0} تعليق</span>
                  </div>
                </div>

                <div className={styles.blogItems}>
                  <div className={styles.blogItem}>
                    <div className={`${styles.blogHeader} d-flex justify-content-between align-items-center`}>
                      <div className={`${styles.blogUserInfo} d-flex align-items-center`}>
                        <div className={styles.blogAvatar}>
                          <Link href={`/user-posts-list/${post?.AuthorId}`}>
                            <img
                              src={post?.AuthorImageUrl || '/assets/images/blank-profile.png'}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/images/blank-profile.png';
                              }}
                              alt={post?.AuthorFullName || ''}
                              className="rounded-circle"
                              loading="lazy"
                            />
                          </Link>
                        </div>
                        <div>
                          <div className={styles.blogUsername}>
                            {post?.AuthorFullName || post?.AuthorName || 'مستخدم'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.blogContent}>
                      {post?.CoverMediaUrl && (
                        <div className={styles.blogImage}>
                          <img
                            src={post.CoverMediaUrl}
                            alt={post.Title || ''}
                            className="img-fluid rounded mb-3"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div
                        className={styles.blogContent}
                        dangerouslySetInnerHTML={{ __html: post?.Content || '' }}
                      />
                    </div>

                    <div className={`${styles.blogFooter} d-flex justify-content-between align-items-center`}>
                      <div className={`${styles.blogStats} d-flex align-items-center`}>
                        <div
                          className={`${styles.statItem} ${styles.likes} ${post?.UserReaction && post?.UserReaction === 1 ? styles.liked : ''} ${isHoveringLike ? styles.hovered : ''}`}
                          onClick={handleLikePost}
                          onMouseEnter={() => setIsHoveringLike(true)}
                          onMouseLeave={() => setIsHoveringLike(false)}
                        >
                          <i className={`fa-solid fa-thumbs-up ${styles.reactionsIcons} ${post?.UserReaction && post?.UserReaction === 1 ? styles.isLiked : ''}`}></i>
                          <span className={styles.statValue}>{post?.LikesCount || 0}</span>
                        </div>
                        <div className={`${styles.statItem} ${styles.views}`}>
                          <i className={`fa-solid fa-eye ${styles.reactionsIcons}`}></i>
                          <span className={styles.statValue}>{post?.ViewsCount || 0}</span>
                        </div>
                        <div className={`${styles.statItem} ${styles.comments}`}>
                          <i className={`fa-solid fa-comment ${styles.reactionsIcons}`}></i>
                          <span className={styles.statValue}>{post?.RepliesCount || 0}</span>
                        </div>
                      </div>
                      <div className={styles.blogActions}>
                        <a
                          href="javascript:void(0)"
                          className={`${styles.blogActionLink} ${isHoveringShare ? styles.hovered : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            if (!isAuthenticated) {
                              showToast('الرجاء تسجيل الدخول أولاً للمشاركة بالمنشورات', 'warning');
                              return;
                            }
                            openShareModal();
                          }}
                          onMouseEnter={() => setIsHoveringShare(true)}
                          onMouseLeave={() => setIsHoveringShare(false)}
                        >
                          <i className={`fa-solid fa-share ${styles.shareIcon}`}></i> مشاركة
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <Comments
                  postId={postId}
                  comments={comments}
                  onCommentAdded={() => {
                    loadComments();
                    loadPost();
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {selectedBlog && (
          <ShareModal
            shareUrl={`${baseUrl}/post-details/${postType}/${category?.Id}/${selectedBlog?.Id}`}
            shareTitle={selectedBlog?.Title || ''}
            adId={selectedBlog?.Id}
            userId={selectedBlog?.AuthorId}
            onClose={() => setSelectedBlog(null)}
          />
        )}
      </div>
    </div>
  );
}


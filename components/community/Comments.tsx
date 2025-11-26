'use client';

import { useState } from 'react';
import { Comment } from '@/lib/core/models/community.models';
import { communityService } from '@/lib/services/community';
import { useAuth } from '@/lib/contexts/AuthContext';
import { showToast } from '@/lib/utils/toast';
import styles from './Comments.module.css';

interface CommentsProps {
  comments: Comment[];
  postId: string | null;
  onCommentAdded?: () => void;
}

export default function Comments({ comments, postId, onCommentAdded }: CommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isHoveringLike, setIsHoveringLike] = useState(false);
  const { isAuthenticated } = useAuth();

  const submitComment = async () => {
    if (!newComment.trim()) return;

    if (!isAuthenticated) {
      showToast('الرجاء تسجيل الدخول أولاً للتعليق على المنشورات', 'warning');
      return;
    }

    if (!postId) return;

    try {
      const response = await communityService.addComment(postId, newComment);
      if (response?.IsSuccess) {
        showToast('تم إضافة التعليق بنجاح', 'success');
        setNewComment('');
        if (onCommentAdded) {
          onCommentAdded();
        }
      } else {
        showToast(response?.Message || 'حدث خطأ أثناء إضافة التعليق', 'error');
      }
    } catch (error) {
      showToast('حدث خطأ في الاتصال بالخادم', 'error');
    }
  };

  const likeComment = async (commentId: string, userReaction: number) => {
    if (!isAuthenticated) {
      showToast('الرجاء تسجيل الدخول أولاً للاعجاب بالمنشورات', 'warning');
      return;
    }

    try {
      const response = await communityService.likeComment(commentId, userReaction == 1 ? 2 : 1);
      if (response?.IsSuccess) {
        setIsLiked(userReaction == 1 ? true : false);
        showToast(
          userReaction != 1 ? 'تم الإعجاب بالتعليق بنجاح' : 'تم إلغاء الاعجاب بالتعليق بنجاح',
          'success'
        );
        if (onCommentAdded) {
          onCommentAdded();
        }
      }
    } catch (error) {
      showToast('حدث خطأ أثناء الإعجاب بالتعليق', 'error');
    }
  };

  return (
    <div className={styles.container} aria-label="قسم التعليقات">
      {/* Comments List */}
      <div className={styles.commentsList} aria-label="قائمة التعليقات">
        {comments.map((comment) => (
          <div key={comment.Id} className={styles.blogItem} aria-label="تعليق بواسطة">
            <div className={`${styles.blogHeader} d-flex justify-content-between align-items-center`}>
              <div className={`${styles.blogUserInfo} d-flex align-items-center`}>
                <div className={styles.blogAvatar}>
                  <img
                    src={comment?.AuthorImageUrl || '/assets/images/blank-profile.png'}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/blank-profile.png';
                    }}
                    alt={comment?.AuthorFullName || ''}
                    className="rounded-circle"
                    loading="lazy"
                    aria-label="صورة المعلق"
                  />
                </div>
                <div>
                  <div className={styles.blogUsername}>{comment?.AuthorFullName}</div>
                </div>
              </div>
              <div className={styles.blogTime} aria-label="وقت التعليق">
                قبل {comment?.CreatedAt}
              </div>
            </div>
            <div className={styles.blogContent}>
              <div className={styles.blogContent} dangerouslySetInnerHTML={{ __html: comment?.Content || '' }} />
            </div>
            <div className={`${styles.blogFooter} d-flex justify-content-between align-items-center`}>
              <div className={`${styles.blogStats} d-flex align-items-center`}>
                <div
                  className={`${styles.statItem} ${styles.likes} ${isHoveringLike ? styles.hovered : ''}`}
                  onClick={() => likeComment(comment?.Id, comment?.UserReaction || 0)}
                  onMouseEnter={() => setIsHoveringLike(true)}
                  onMouseLeave={() => setIsHoveringLike(false)}
                  aria-label="إعجاب بالتعليق"
                >
                  <i
                    className={`fa-solid fa-thumbs-up ${styles.reactionsIcons} ${comment?.UserReaction && comment?.UserReaction == 1 ? styles.isLiked : ''}`}
                  ></i>
                  <span className={styles.statValue}>{comment?.LikesCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="row">
            <div className="col-12">
              <div className="alert alert-info text-center" role="alert" aria-label="لا توجد تعليقات متاحة حالياً">
                لا توجد تعليقات متاحة حالياً
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Comment Section */}
      <div className={`${styles.addCommentSection} mt-5`} aria-label="إضافة تعليق">
        <h4 className={styles.addCommentTitle}>إضافة تعليق</h4>
        <div className="form-floating">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="form-control"
            rows={3}
            placeholder="اكتب تعليقك"
            aria-label="حقل كتابة التعليق"
          />
          <div className="text-center mt-3">
            <button
              onClick={submitComment}
              className={`btn btn-success ${styles.submitCommentBtn}`}
              disabled={!newComment.trim()}
              aria-label="إرسال التعليق"
            >
              إرسال
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


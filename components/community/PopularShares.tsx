'use client';

import Link from 'next/link';
import { BlogPost } from '@/lib/core/models/community.models';
import styles from './PopularShares.module.css';

interface PopularSharesProps {
  type: number;
  categoryId: string;
  title?: string;
  shares: BlogPost[];
}

export default function PopularShares({ type, categoryId, title = 'أبرز المشاركات', shares }: PopularSharesProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.sharesTitle}>{title}</h3>

      {shares?.length > 0 && shares ? (
        <div className={styles.sharesList}>
          {shares?.map((share) => (
            <div key={share.Id} className={styles.shareItem}>
              <div className={styles.shareTime}>قبل {share?.CreatedAt}</div>

              <div
                className={styles.shareAuthor}
                style={{ cursor: type === 0 ? 'pointer' : 'default' }}
                onClick={() => {
                  if (type === 0) {
                    window.location.href = `/user-posts-list/${share?.AuthorId}`;
                  }
                }}
              >
                {share?.AuthorFullName}
              </div>

              {share?.CategoryName && (
                <Link href={`/list-blogs/${share?.CategoryId}`}>
                  <div className={styles.shareCategory}>{share?.CategoryName}</div>
                </Link>
              )}

              <Link href={`/post-details/${type}/${categoryId}/${share?.Id}`}>
                <div className={styles.shareTitle}>{share?.Title}</div>
              </Link>

              <div className="mb-2 d-flex flex-row justify-content-between align-items-center">
                <div className={styles.shareStats}>
                  <span>
                    {share?.LikesCount || 0} لايك، {share?.ViewsCount || 0} مشاهدة، {share?.RepliesCount || 0} تعليق
                  </span>
                </div>
                <div className={styles.shareAction}>
                  <Link href={`/post-details/${type}/${categoryId}/${share?.Id}`} className="mt-3">
                    <i className={`fa-solid fa-arrow-left ${styles.greenColor}`}></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.sharesList}>
          <div className="row">
            <div className="col-12">
              <div className="alert alert-info text-center" role="alert">
                لايوجد مشاركات
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


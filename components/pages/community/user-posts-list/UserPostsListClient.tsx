'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { showToast } from '@/lib/utils/toast';
import ProfileBrief from '@/components/community/ProfileBrief';
import ShareModal from '@/components/shared/share-modal/ShareModal';
import { environment } from '@/lib/config/environment';

interface UserPostsListClientProps {
  userId: string;
  initialPosts: any[];
  initialProfileData: any;
  error: string | null;
}

export default function UserPostsListClient({
  userId,
  initialPosts,
  initialProfileData,
  error: initialError,
}: UserPostsListClientProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [allPosts, setAllPosts] = useState(initialPosts);
  const [profileData, setProfileData] = useState(initialProfileData);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialPosts.length / 5));
  const [totalItems, setTotalItems] = useState(initialPosts.length);

  const baseUrl = environment.baseApiUrl;

  useEffect(() => {
    if (initialError) {
      showToast(initialError, 'error');
    }
  }, [initialError]);

  useEffect(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPosts(allPosts.slice(startIndex, endIndex));
    setTotalPages(Math.ceil(allPosts.length / pageSize));
  }, [page, allPosts, pageSize]);

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

  const isContentShort = (content: any): boolean => {
    if (!content) return true;
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length <= 200;
  };

  const getTruncatedContent = (content: any, maxLength: number = 200): string => {
    if (!content) return '';
    const textContent = content.replace(/<[^>]*>/g, '');
    if (textContent.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const openShareModal = (blog: any) => {
    setSelectedBlog(blog);
    const modalElement = document.getElementById('shareModal');
    if (modalElement && typeof window !== 'undefined' && (window as any).bootstrap) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  };

  if (!profileData) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <p>{initialError || 'لا يمكن تحميل بيانات المستخدم'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-8">
          <h1 className="mb-4">مشاركات المستخدم</h1>

          <ProfileBrief
            name={profileData.name || ''}
            avatar={profileData.avatar || ''}
            lastSeen={profileData.LastSeen || ''}
            stats={profileData.stats || { posts: 0, replies: 0 }}
            memberSince=""
          />

          <div className="mt-4">
            {posts.map((post) => (
              <div key={post.Id} className="card mb-4">
                <div className="card-body">
                  <div className="d-flex gap-2 align-items-center mb-3">
                    <img
                      src={post.AuthorImageUrl || '/assets/images/blank-profile.png'}
                      alt={post.AuthorName}
                      className="rounded-circle"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                      <div>{post.AuthorName || post.AuthorFullName || 'مستخدم'}</div>
                      <small className="text-muted">{getRelativeTime(post.CreatedAt)}</small>
                    </div>
                    <div className="ms-auto">
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => openShareModal(post)}
                      >
                        <i className="fas fa-share-alt"></i>
                      </button>
                    </div>
                  </div>

                  <Link href={`/post-details/0/${post.CategoryId}/${post.Id}`}>
                    <h5 className="card-title">{post.Title}</h5>
                  </Link>

                  {post.CoverMediaUrl && (
                    <img
                      src={post.CoverMediaUrl}
                      alt={post.Title}
                      className="img-fluid mb-3"
                      style={{ maxHeight: '300px', objectFit: 'cover', width: '100%' }}
                    />
                  )}

                  {post.Content && (
                    <div
                      className="card-text"
                      dangerouslySetInnerHTML={{
                        __html: isContentShort(post.Content)
                          ? post.Content
                          : getTruncatedContent(post.Content),
                      }}
                    />
                  )}

                  <div className="d-flex gap-3 text-muted mt-3">
                    <span>
                      <i className="fas fa-eye"></i> {post.ViewsCount || 0}
                    </span>
                    <span>
                      <i className="fas fa-heart"></i> {post.LikesCount || 0}
                    </span>
                    <span>
                      <i className="fas fa-comments"></i> {post.RepliesCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="d-flex justify-content-center gap-2 mt-4">
                <button
                  className="btn btn-outline-success"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  السابق
                </button>
                <span className="align-self-center">
                  صفحة {page} من {totalPages}
                </span>
                <button
                  className="btn btn-outline-success"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedBlog && (
        <ShareModal
          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/community/post-details/${selectedBlog.PostType || 0}/${selectedBlog.CategoryId || ''}/${selectedBlog.Id}`}
          shareTitle={selectedBlog.Title || ''}
          adId={selectedBlog.Id || ''}
          userId={userId}
          onClose={() => setSelectedBlog(null)}
        />
      )}
    </div>
  );
}


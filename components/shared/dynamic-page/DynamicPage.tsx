'use client';

import { useState, useEffect } from 'react';
import { dynamicPagesService } from '@/lib/services/dynamic-pages';
import styles from './DynamicPage.module.css';

interface DynamicPageProps {
  shortCode: number;
}

export default function DynamicPage({ shortCode }: DynamicPageProps) {
  const [page, setPage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shortCode) {
      loadPage(shortCode);
    } else {
      setError('رمز الصفحة غير محدد');
      setIsLoading(false);
    }
  }, [shortCode]);

  const loadPage = async (code: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const pageData = await dynamicPagesService.getPageByShortCode(code);
      if (pageData) {
        setPage(pageData);
      } else {
        setError('الصفحة غير موجودة');
      }
    } catch (error: any) {
      console.error('Error loading dynamic page:', error);
      setError('حدث خطأ أثناء تحميل المحتوى');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.dynamicPageContainer}>
      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className="container">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">جاري التحميل...</span>
            </div>
            <p className={styles.loadingText}>جاري تحميل المحتوى...</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className={styles.errorContainer}>
          <div className="container">
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle"></i>
              <strong>خطأ:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {page && !isLoading && (
        <div className={styles.pageContent}>
          <div className={styles.pageHeader}>
            <div className={styles.headerOverlay}></div>
            <div className="container">
              <div className={styles.headerContent}>
                <h1 className={styles.pageTitle}>{page.Name}</h1>
                <div className={styles.pageMeta}>
                  <small className="text-muted">آخر تحديث: {formatDate(page.CreatedAt)}</small>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.pageBody}>
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-10 col-xl-8">
                  <div
                    className={styles.contentWrapper}
                    dangerouslySetInnerHTML={{ __html: page.Content }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!page && !isLoading && !error && (
        <div className={styles.defaultContent}>
          <div className="container">
            <div className="alert alert-info" role="alert">
              <i className="fas fa-info-circle"></i>
              المحتوى غير متوفر حالياً. يرجى المحاولة لاحقاً.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


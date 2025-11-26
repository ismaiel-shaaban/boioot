'use client';

import Link from 'next/link';
import styles from './Breadcrumb.module.css';

interface BreadcrumbItem {
  label: string;
  link?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  title?: string | null;
  main_link?: string | null;
  links?: string | null;
  main_title?: string | null;
  category?: string | null;
  categoryId?: string | null;
}

export default function Breadcrumb({
  items = [],
  title = null,
  main_link = null,
  links = null,
  main_title = null,
  category = null,
  categoryId = null,
}: BreadcrumbProps) {
  return (
    <div className={`${styles.container} d-flex align-items-center`}>
      {main_link && main_title && (
        <>
          <div className={styles.mainCategory}>
            <Link href={main_link} className={styles.categoryLink}>
              {main_title}
            </Link>
          </div>
          {category && (
            <div className={`${styles.separator} mx-2`}>
              <i className={`fas fa-chevron-left ${styles.lightGreen}`}></i>
            </div>
          )}
        </>
      )}

      {category && categoryId && links && (
        <>
          <div className={styles.subCategory}>
            <Link href={`${links}/${categoryId}`} className={styles.subCategoryLink}>
              {category}
            </Link>
          </div>
          {title && (
            <div className={`${styles.separator} mx-2`}>
              <i className={`fas fa-chevron-left ${styles.lightGreen}`}></i>
            </div>
          )}
        </>
      )}

      {title && (
        <div className={styles.postTitle}>
          <span className={styles.postTitleText}>{title}</span>
        </div>
      )}
    </div>
  );
}


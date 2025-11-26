'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { projectsService } from '@/lib/services/projects';
import { favoritesService } from '@/lib/services/favorites';
import { showToast } from '@/lib/utils/toast';
import { environment } from '@/lib/config/environment';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: any;
  showActions?: boolean;
  onShare?: (project: any) => void;
  onUpdate?: (project: any) => void;
  onDelete?: (project: any) => void;
}

export default function ProjectCard({ project, showActions = false, onShare, onUpdate, onDelete }: ProjectCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('الرجاء تسجيل الدخول أولاً للاعجاب بالمشروع', 'warning');
      return;
    }

    try {
      const response = await projectsService.likeProject(project.Id);
      if (response?.IsSuccess) {
        project.IsFavorite = !project.IsFavorite;
        showToast(project.IsFavorite ? 'تم الاعجاب بالمشروع بنجاح' : 'تم الغاء الاعجاب بالمشروع', 'success');
      } else {
        showToast('حدث خطأ ما', 'error');
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      showToast('حدث خطأ ما', 'error');
    }
  };

  const shareProject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(project);
    }
  };

  const updateProject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUpdate) {
      onUpdate(project);
    }
  };

  const deleteProject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(project);
    }
  };

  const getProjectLabel = (type: any): string => {
    const unitTypes: { [key: number]: string } = {
      0: 'شقة للإيجار',
      1: 'شقة للبيع',
      2: 'فيلا للإيجار',
      3: 'فيلا للبيع',
    };
    return unitTypes[type] || 'غير محدد';
  };

  const formatPriceWithConversion = (price: number, isUsd: boolean): string => {
    if (!price) return 'غير محدد';
    const formattedPrice = new Intl.NumberFormat('ar-SA').format(price);
    return `${formattedPrice} ${isUsd ? 'دولار' : 'ل.س'}`;
  };

  return (
    <div className={styles.projectCard} aria-label="بطاقة مشروع">
      <div className={styles.projectImage}>
        <Link href={`/project-details/${project?.Id}`}>
          <img
            src={project?.CoverImageUrl || '/assets/images/no_image.png'}
            alt={project?.Name}
            className="img-fluid"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/no_image.png';
            }}
            loading="lazy"
            style={{ cursor: 'pointer' }}
          />
        </Link>

        <button className={`${styles.actionBtn} ${styles.favoriteBtn}`} onClick={toggleFavorite} aria-label="إضافة للمفضلة">
          <i className={project?.IsFavorite ? 'fas fa-heart text-danger' : 'far fa-heart'}></i>
        </button>
        <button className={`${styles.actionBtn} ${styles.shareBtn}`} onClick={shareProject} aria-label="مشاركة المشروع">
          <i className="fas fa-share-alt"></i>
        </button>

        <div className={styles.statusBadges}>
          <span className={`${styles.statusBadge} ${styles.keyBadge}`}>متاح</span>
          <span className={`${styles.statusBadge} ${styles.keyBadge}`}>{project?.UnitsCount || 0}</span>
          <span className={`${styles.statusBadge} ${styles.featuredBadge}`}>وحدات خاصة</span>
        </div>
      </div>

      <div className={styles.projectInfo}>
        <div className={styles.projectTitle}>
          <Link href={`/project-details/${project?.Id}`}>
            <h3 className={styles.title} style={{ cursor: 'pointer' }}>{project?.Name}</h3>
          </Link>
          <div className={styles.projectLogo}>
            <img
              src={project?.OwnerLogoUrl || '/assets/images/no_image.png'}
              alt="Logo"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/images/no_image.png';
              }}
            />
          </div>
        </div>

        <div className={styles.projectLocation}>
          <p>{project?.FullAddress || 'غير محدد'}</p>
        </div>

        <div className={styles.projectFooter}>
          <div className={styles.categoryTag}>
            <span>{getProjectLabel(project?.ProjectTypeLabel)}</span>
          </div>

          <div className={styles.priceButton}>
            <span className={styles.priceLabel}>يبدأ من</span>
            <span className={styles.priceValue}>{formatPriceWithConversion(project?.PriceFrom || 0, project?.IsUsd)}</span>
            <Link href={`/project-details/${project?.Id}`}>
              <i className="fas fa-arrow-left" style={{ cursor: 'pointer' }}></i>
            </Link>
          </div>
        </div>

        {showActions && (
          <div className={styles.profileActionsBottom}>
            <button className={`${styles.actionBtnBottom} ${styles.updateBtn}`} onClick={updateProject} title="تحديث">
              <i className="fas fa-edit ml-2 mr-2"></i> &nbsp; تعديل &nbsp;
            </button>
            <button className={`${styles.actionBtnBottom} ${styles.deleteBtn}`} onClick={deleteProject} title="حذف">
              <i className="fas fa-trash ml-2 mr-2"></i> &nbsp; حذف &nbsp;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


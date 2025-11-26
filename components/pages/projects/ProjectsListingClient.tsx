'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { projectsService } from '@/lib/services/projects';
import ProjectCard from '@/components/shared/cards/project-card/ProjectCard';
import ShareModal from '@/components/shared/share-modal/ShareModal';
import { showToast } from '@/lib/utils/toast';
import { environment } from '@/lib/config/environment';
import styles from './ProjectsListingClient.module.css';

interface City {
  Id: string;
  ArName: string;
}

export default function ProjectsListingClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  const pageSize = 6;
  const maxVisiblePages = 5;
  const selectedCityId = (params?.type as string) || 'all';

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCityId]);

  useEffect(() => {
    if (cities.length > 0 || selectedCityId === 'all') {
      loadProjects();
    }
  }, [currentPage, selectedCityId, cities]);

  const loadCities = async () => {
    try {
      const response = await projectsService.getCities();
      let citiesData: City[] = [];
      
      if (Array.isArray(response)) {
        citiesData = response as City[];
      } else if (response?.IsSuccess && Array.isArray(response.Data)) {
        citiesData = response.Data as City[];
      } else if (response?.IsSuccess && response.Data && typeof response.Data === 'object' && 'Items' in response.Data && Array.isArray((response.Data as any).Items)) {
        citiesData = (response.Data as any).Items as City[];
      }
      
      setCities(citiesData);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      let cityName: string | undefined = undefined;
      
      if (selectedCityId && selectedCityId !== 'all') {
        // Look up city name from cityId
        const city = cities.find((c: City) => c.Id === selectedCityId);
        if (city) {
          cityName = city.ArName;
        } else {
          // If city not found in list, use the ID as fallback (might be a name already)
          cityName = selectedCityId;
        }
      }
      
      const response = await projectsService.getProjects(currentPage, pageSize, selectedCityId, cityName);
      if (response?.IsSuccess) {
        const data = response.Data as any;
        setProjects(data?.Items || []);
        setCurrentPage(data?.PageNumber || currentPage);
        setTotalCount(data?.TotalCount || 0);
        setTotalPages(data?.TotalPages || 0);
      } else {
        setError('فشل في تحميل المشاريع');
        showToast(response?.Error || 'فشل في تحميل المشاريع', 'error');
      }
    } catch (error: any) {
      console.error('Error loading projects:', error);
      setError('حدث خطأ في تحميل المشاريع');
      showToast('حدث خطأ في تحميل المشاريع', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const isFirstPage = (): boolean => {
    return currentPage === 1;
  };

  const isLastPage = (): boolean => {
    return currentPage >= totalPages;
  };

  const openShareModal = (project: any) => {
    setSelectedProject(project);
  };

  const closeShareModal = () => {
    setSelectedProject(null);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className={styles.projectsListingContainer}>
      <div className="container mt-4">
        {loading ? (
          <div className="text-center py-5" aria-live="polite">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">جاري التحميل...</span>
            </div>
            <p className="mt-3">جاري تحميل المشاريع...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        ) : (
          <>
            {/* Projects Grid */}
            <div className={styles.projectsGrid}>
              {projects.length > 0 && (
                <div className="row" style={{ width: '100%' }}>
                  {projects.map((project) => (
                    <div key={project.Id} className="col-12 col-lg-6 mb-4 d-flex justify-content-center">
                      <div style={{ width: '100%' }}>
                        <ProjectCard
                          project={project}
                          showActions={false}
                          onShare={() => openShareModal(project)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {projects.length === 0 && !loading && (
                <div className="row">
                  <div className="col-12">
                    <div className="alert alert-info text-center" role="alert">
                      لا توجد مشاريع متاحة حالياً
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination - Outside Grid */}
            {projects.length > 0 && (
              <div className={styles.paginationContainer}>
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${isFirstPage() ? 'disabled' : ''}`}>
                      <a
                        className="page-link"
                        href="javascript:void(0)"
                        onClick={(e) => {
                          e.preventDefault();
                          goToPreviousPage();
                        }}
                        aria-disabled={isFirstPage()}
                      >
                        <i className="fas fa-chevron-right"></i>
                      </a>
                    </li>

                    {getPageNumbers().map((pageNumber) => (
                      <li key={pageNumber} className={`page-item ${pageNumber === currentPage ? 'active' : ''}`}>
                        <a
                          className="page-link"
                          href="javascript:void(0)"
                          onClick={(e) => {
                            e.preventDefault();
                            goToPage(pageNumber);
                          }}
                        >
                          {pageNumber}
                        </a>
                      </li>
                    ))}

                    <li className={`page-item ${isLastPage() ? 'disabled' : ''}`}>
                      <a
                        className="page-link"
                        href="javascript:void(0)"
                        onClick={(e) => {
                          e.preventDefault();
                          goToNextPage();
                        }}
                        aria-disabled={isLastPage()}
                      >
                        <i className="fas fa-chevron-left"></i>
                      </a>
                    </li>
                  </ul>
                </nav>

                <div className="pagination-info text-center mt-2">
                  <small className="text-muted">
                    صفحة {currentPage} من {totalPages} (إجمالي {totalCount} مشروع)
                  </small>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedProject && (
        <ShareModal
          shareUrl={`${baseUrl}/project-details/${selectedProject.Id}`}
          shareTitle={selectedProject.Name}
          adId={selectedProject.Id}
          userId={null}
          onClose={closeShareModal}
        />
      )}
    </div>
  );
}

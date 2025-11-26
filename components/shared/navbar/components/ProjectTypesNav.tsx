'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { projectsService } from '@/lib/services/projects';
import { City } from '@/components/shared/list/filters/Filters';
import { useRouter } from 'next/navigation';
import styles from './ProjectTypesNav.module.css';

interface ProjectTypesNavProps {
  selectedCityId?: string;
}

export default function ProjectTypesNav({ selectedCityId = 'all' }: ProjectTypesNavProps) {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([{ Id: 'all', ArName: 'الكل' }]);
  const [activeCityId, setActiveCityId] = useState<string>(selectedCityId);
  const [isLoading, setIsLoading] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCities();
  }, []);


  useEffect(() => {
    setActiveCityId(selectedCityId);
  }, [selectedCityId]);

  const loadCities = async () => {
    setIsLoading(true);
    try {
      const response = await projectsService.getCities();
      let citiesData: City[] = [];
      
      // Handle different response formats
      if (Array.isArray(response)) {
        citiesData = response as City[];
      } else if (response?.IsSuccess && Array.isArray(response.Data)) {
        citiesData = response.Data as City[];
      } else if (response?.IsSuccess && response.Data && typeof response.Data === 'object' && 'Items' in response.Data && Array.isArray((response.Data as any).Items)) {
        citiesData = (response.Data as any).Items as City[];
      }
      
      // Remove duplicates based on Id and ensure unique
      const seenIds = new Set<string>();
      const uniqueCities: City[] = [];
      
      // First, add "الكل" if not exists
      const allCityExists = citiesData.some(city => city.Id === 'all' || city.ArName === 'الكل');
      if (!allCityExists) {
        uniqueCities.push({ Id: 'all', ArName: 'الكل' });
        seenIds.add('all');
      }
      
      // Then add other cities, avoiding duplicates
      citiesData.forEach(city => {
        const cityId = String(city.Id || '');
        if (cityId && !seenIds.has(cityId) && cityId !== 'all' && city.ArName !== 'الكل') {
          uniqueCities.push(city);
          seenIds.add(cityId);
        }
      });
      
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkScroll = useCallback(() => {
    const element = scrollContainerRef.current;
    if (element) {
      const hasScroll = element.scrollWidth > element.clientWidth;
      if (!hasScroll) {
        setCanScrollLeft(false);
        setCanScrollRight(false);
        return;
      }
      
      // Simple check like AdTypesNav
      setCanScrollLeft(element.scrollLeft > 0);
      setCanScrollRight(element.scrollLeft < element.scrollWidth - element.clientWidth - 1);
    }
  }, []);

  useEffect(() => {
    checkScroll();
  }, [cities, checkScroll]);

  const scrollLeft = useCallback(() => {
    const element = scrollContainerRef.current;
    if (element) {
      element.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(() => checkScroll(), 300);
    }
  }, [checkScroll]);

  const scrollRight = useCallback(() => {
    const element = scrollContainerRef.current;
    if (element) {
      element.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(() => checkScroll(), 300);
    }
  }, [checkScroll]);

  const selectCity = (cityId: string) => {
    setActiveCityId(cityId);
    if (cityId === 'all') {
      router.push('/projects');
    } else {
      router.push(`/projects/${cityId}`);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.projectTypesContainer}>
        <div className="container">
          <div className="text-center py-2">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.projectTypesContainer}>
      <div className="container">
        <div className={styles.projectTypesNav}>
          {canScrollRight && (
            <button 
              className={`${styles.scrollBtn} ${styles.scrollLeft} ${styles.visible}`} 
              onClick={scrollLeft} 
              aria-label="تمرير لليسار"
              type="button"
            >
              
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          )}
          <div
            className={styles.scrollContainer}
            ref={scrollContainerRef}
            onScroll={checkScroll}
          >
            {cities.map((city) => (
              <button
                key={city.Id}
                className={`${styles.typeBtn} ${activeCityId === city.Id ? styles.active : ''}`}
                onClick={() => selectCity(city.Id)}
                type="button"
              >
                {city.ArName}
              </button>
            ))}
          </div>
         
            <button 
              className={`${styles.scrollBtn} ${styles.scrollRight} ${styles.visible}`} 
              onClick={scrollRight} 
              aria-label="تمرير لليمين"
              type="button"
            >
             <i className="fa-solid fa-chevron-right"></i>
            </button>
          
        </div>
      </div>
    </div>
  );
}

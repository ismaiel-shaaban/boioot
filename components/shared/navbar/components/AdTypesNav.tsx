'use client';

import { useState, useEffect, useRef } from 'react';
import { unitTypesService, AdType } from '@/lib/services/unit-types';
import styles from './AdTypesNav.module.css';

interface AdTypesNavProps {
  onTypeSelected: (event: { name: string; unitType: string | null }) => void;
}

export default function AdTypesNav({ onTypeSelected }: AdTypesNavProps) {
  const [adTypes, setAdTypes] = useState<AdType[]>([{ name: 'الكل', id: 'all', unitType: null }]);
  const [activeType, setActiveType] = useState<string>('الكل');
  const [isLoading, setIsLoading] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAdTypes();
  }, []);

  useEffect(() => {
    checkScroll();
  }, [adTypes]);

  const loadAdTypes = async () => {
    setIsLoading(true);
    try {
      const types = await unitTypesService.getAdTypes();
      setAdTypes(types);
    } catch (error) {
      console.error('Error loading ad types:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkScroll = () => {
    const element = scrollContainerRef.current;
    if (element) {
      setCanScrollLeft(element.scrollLeft > 0);
      setCanScrollRight(element.scrollLeft < element.scrollWidth - element.clientWidth);
    }
  };

  const scrollLeft = () => {
    const element = scrollContainerRef.current;
    if (element) {
      element.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(() => checkScroll(), 300);
    }
  };

  const scrollRight = () => {
    const element = scrollContainerRef.current;
    if (element) {
      element.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(() => checkScroll(), 300);
    }
  };

  const selectType = (type: string, unitType: string | null) => {
    setActiveType(type);
    onTypeSelected({ name: type, unitType });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.adTypesContainer}>
      <div className="container">
        <div className={styles.adTypesNav}>
          {canScrollLeft && (
            <button className={`${styles.scrollBtn} ${styles.scrollLeft} ${styles.visible}`} onClick={scrollLeft} aria-label="تمرير لليسار">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          )}
          <div
            className={styles.scrollContainer}
            ref={scrollContainerRef}
            onScroll={checkScroll}
          >
            {adTypes.map((type) => (
              <button
                key={type.id}
                className={`${styles.typeBtn} ${activeType === type.name ? styles.active : ''}`}
                onClick={() => selectType(type.name, type.unitType)}
              >
                {type.name}
              </button>
            ))}
          </div>
          {canScrollRight && (
            <button className={`${styles.scrollBtn} ${styles.scrollRight} ${styles.visible}`} onClick={scrollRight} aria-label="تمرير لليمين">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

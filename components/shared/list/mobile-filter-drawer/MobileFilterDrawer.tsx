'use client';

import { useEffect, useRef } from 'react';
import Filters, { FilterOptions } from '../filters/Filters';
import styles from './MobileFilterDrawer.module.css';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChanged?: (filters: FilterOptions) => void;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  onFiltersChanged,
}: MobileFilterDrawerProps) {
  const initialEmitCountRef = useRef(0);
  const drawerOpenTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Prevent body scroll when drawer is open (match Angular)
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset when drawer opens - give Filters time to load saved filters
      initialEmitCountRef.current = 0;
      drawerOpenTimeRef.current = Date.now();
    } else {
      document.body.style.overflow = 'auto';
      // Reset when drawer closes
      initialEmitCountRef.current = 0;
      drawerOpenTimeRef.current = null;
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleFiltersChanged = (filters: FilterOptions) => {
    // Always pass filters to parent
    onFiltersChanged?.(filters);
    
    // Don't close on initial load (first emit within 1000ms of drawer opening)
    // Filters component emits when it loads saved filters
    const timeSinceOpen = drawerOpenTimeRef.current ? Date.now() - drawerOpenTimeRef.current : Infinity;
    initialEmitCountRef.current += 1;
    
    // If this is within first 1000ms or first 2 emits, it's likely initial load - don't close
    if (timeSinceOpen < 1000 || initialEmitCountRef.current <= 2) {
      return;
    }

    // This is a user action (apply button clicked) - close drawer
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.drawerOverlay} ${isOpen ? styles.show : ''}`}
      onClick={handleBackdropClick}
      role="presentation"
      aria-label="خلفية درج الفلاتر"
    >
      <div
        className={`${styles.drawerContainer} ${isOpen ? styles.open : ''}`}
        role="dialog"
        aria-label="درج الفلاتر"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <h3>الفلاتر</h3>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="إغلاق درج الفلاتر"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Drawer Content */}
        <div className={styles.drawerContent}>
          <Filters
            parentComponentId="mobile-filter-drawer"
            onFiltersChanged={handleFiltersChanged}
          />
        </div>
      </div>
    </div>
  );
}

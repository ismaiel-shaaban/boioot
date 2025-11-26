'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { useAdTypeFilter } from '@/lib/contexts/AdTypeFilterContext';
import TopNav from './components/TopNav';
import MainNav from './components/MainNav';
import AdTypesNav from './components/AdTypesNav';
import ProjectTypesNav from './components/ProjectTypesNav';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const { setSelectedAdType } = useAdTypeFilter();
  const [isProjectsRoute, setIsProjectsRoute] = useState(false);
  const [isHomeRoute, setIsHomeRoute] = useState(false);
  const [isDailyRentRoute, setIsDailyRentRoute] = useState(false);
  const [isSpecialOrderRoute, setIsSpecialOrderRoute] = useState(false);
  const [showAdTypesNav, setShowAdTypesNav] = useState(false);
  const [showMainNav, setShowMainNav] = useState(false);

  useEffect(() => {
    const isProjects = pathname?.startsWith('/projects') || false;
    const isHome = pathname === '/' || pathname === '/home';
    const isDailyRent = pathname?.startsWith('/daily-rent') || false;
    const isSpecialOrder = pathname?.startsWith('/special-order') || false;
    const isRequests = pathname?.startsWith('/requests') || false;
    setIsProjectsRoute(isProjects);
    setIsHomeRoute(isHome);
    setIsDailyRentRoute(isDailyRent);
    setIsSpecialOrderRoute(isSpecialOrder);
    setShowAdTypesNav(isHome || isDailyRent || isSpecialOrder);
    setShowMainNav(isHome || isDailyRent || isSpecialOrder || isProjects ||isRequests);
    // Reset ad type filter when route changes
    if (!(isHome || isDailyRent || isSpecialOrder)) {
      setSelectedAdType(null);
    }
  }, [pathname, setSelectedAdType]);

  const onAdTypeSelected = (event: { name: string; unitType: string | null }) => {
    setSelectedAdType(event);
  };

  return (
    <header className={styles.navbarContainer}>
      <Suspense fallback={<div style={{ height: '60px' }}></div>}>
        <TopNav />
      </Suspense>
      {showMainNav && <MainNav />}

      {/* Show Project Types Navigation when on projects route */}
      {isProjectsRoute && (
        <ProjectTypesNav 
          selectedCityId={
            pathname && pathname !== '/projects' 
              ? pathname.replace('/projects/', '') 
              : 'all'
          } 
        />
      )}

      {/* Show Ad Types Navigation when not on projects route */}
      {showAdTypesNav && <AdTypesNav onTypeSelected={onAdTypeSelected} />}
    </header>
  );
}


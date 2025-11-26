'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import styles from './MainNav.module.css';

export default function MainNav() {
  const { isAuthenticated } = useAuth();

  const navItems = [
    { name: 'الرئيسية', link: '/' },
    { name: 'الإيجار اليومي', link: '/daily-rent' },
    { name: 'الطلبات', link: '/requests' },
    { name: 'المشاريع', link: '/projects' },
    { name: 'مجتمع بيوت', link: '/community' },
    { name: 'المدونة', link: '/blogs' },
  ];

  return (
    <div className={styles.mainNavContainer}>
      <div className="container">
        <nav className={styles.mainNav} aria-label="Main Navigation">
          <ul>
            {navItems.map((item, i) => (
              <li key={i}>
                <Link href={item.link}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

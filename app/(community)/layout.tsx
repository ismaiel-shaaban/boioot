import { Suspense } from 'react';
import Navbar from '@/components/shared/navbar/Navbar';
import Footer from '@/components/shared/footer/Footer';

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="main-layout">
      <Suspense fallback={<div style={{ height: '60px' }}></div>}>
        <Navbar />
      </Suspense>
      <main className="main-content" aria-label="Community layout">
        {children}
      </main>
      <Footer />
    </div>
  );
}


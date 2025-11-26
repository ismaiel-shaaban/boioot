import { Suspense } from 'react';
import Navbar from '@/components/shared/navbar/Navbar';
import Footer from '@/components/shared/footer/Footer';
import { AdvertisementProvider } from '@/lib/contexts/AdvertisementContext';
import { SpecialOrderProvider } from '@/lib/contexts/SpecialOrderContext';
import { DailyRentProvider } from '@/lib/contexts/DailyRentContext';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdvertisementProvider>
      <SpecialOrderProvider>
        <DailyRentProvider>
          <div className="main-layout">
            <Suspense fallback={<div style={{ height: '60px' }}></div>}>
              <Navbar />
            </Suspense>
            <main className="main-content" aria-label="Profile layout">
              {children}
            </main>
            <Footer />
          </div>
        </DailyRentProvider>
      </SpecialOrderProvider>
    </AdvertisementProvider>
  );
}


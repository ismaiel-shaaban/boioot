'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdvertisementContextType {
  advertisementId: string | null;
  setAdvertisementId: (id: string) => void;
  clearAdvertisementId: () => void;
  hasAdvertisementId: () => boolean;
}

const AdvertisementContext = createContext<AdvertisementContextType | undefined>(undefined);

export function AdvertisementProvider({ children }: { children: ReactNode }) {
  const [advertisementId, setAdvertisementIdState] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const storedAdId = localStorage.getItem('currentAdvertisementId');
      if (storedAdId) {
        setAdvertisementIdState(storedAdId);
      }
    }
  }, []);

  const setAdvertisementId = (id: string) => {
    setAdvertisementIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentAdvertisementId', id);
    }
  };

  const clearAdvertisementId = () => {
    setAdvertisementIdState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentAdvertisementId');
    }
  };

  const hasAdvertisementId = () => {
    return advertisementId !== null;
  };

  return (
    <AdvertisementContext.Provider
      value={{
        advertisementId,
        setAdvertisementId,
        clearAdvertisementId,
        hasAdvertisementId,
      }}
    >
      {children}
    </AdvertisementContext.Provider>
  );
}

export function useAdvertisementState() {
  const context = useContext(AdvertisementContext);
  if (context === undefined) {
    throw new Error('useAdvertisementState must be used within an AdvertisementProvider');
  }
  return context;
}


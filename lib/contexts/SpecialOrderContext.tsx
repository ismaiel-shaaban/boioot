'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SpecialOrderContextType {
  specialOrderId: string | null;
  setSpecialOrderId: (id: string) => void;
  clearSpecialOrderId: () => void;
  hasSpecialOrderId: () => boolean;
}

const SpecialOrderContext = createContext<SpecialOrderContextType | undefined>(undefined);

export function SpecialOrderProvider({ children }: { children: ReactNode }) {
  const [specialOrderId, setSpecialOrderIdState] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('currentSpecialOrderId');
      if (storedId) {
        setSpecialOrderIdState(storedId);
      }
    }
  }, []);

  const setSpecialOrderId = (id: string) => {
    setSpecialOrderIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentSpecialOrderId', id);
    }
  };

  const clearSpecialOrderId = () => {
    setSpecialOrderIdState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentSpecialOrderId');
    }
  };

  const hasSpecialOrderId = () => {
    return specialOrderId !== null;
  };

  return (
    <SpecialOrderContext.Provider
      value={{
        specialOrderId,
        setSpecialOrderId,
        clearSpecialOrderId,
        hasSpecialOrderId,
      }}
    >
      {children}
    </SpecialOrderContext.Provider>
  );
}

export function useSpecialOrderState() {
  const context = useContext(SpecialOrderContext);
  if (context === undefined) {
    throw new Error('useSpecialOrderState must be used within a SpecialOrderProvider');
  }
  return context;
}


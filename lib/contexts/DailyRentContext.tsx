'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DailyRentContextType {
  dailyRentId: string | null;
  setDailyRentId: (id: string) => void;
  clearDailyRentId: () => void;
  hasDailyRentId: () => boolean;
}

const DailyRentContext = createContext<DailyRentContextType | undefined>(undefined);

export function DailyRentProvider({ children }: { children: React.ReactNode }) {
  const [dailyRentId, setDailyRentIdState] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedRentId = localStorage.getItem('currentDailyRentId');
      if (storedRentId) {
        setDailyRentIdState(storedRentId);
      }
    }
  }, []);

  const setDailyRentId = (id: string) => {
    setDailyRentIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentDailyRentId', id);
    }
  };

  const clearDailyRentId = () => {
    setDailyRentIdState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentDailyRentId');
    }
  };

  const hasDailyRentId = () => {
    return !!dailyRentId;
  };

  return (
    <DailyRentContext.Provider
      value={{ dailyRentId, setDailyRentId, clearDailyRentId, hasDailyRentId }}
    >
      {children}
    </DailyRentContext.Provider>
  );
}

export function useDailyRentState() {
  const context = useContext(DailyRentContext);
  if (context === undefined) {
    throw new Error('useDailyRentState must be used within a DailyRentProvider');
  }
  return context;
}


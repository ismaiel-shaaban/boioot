'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdTypeFilterContextType {
  selectedAdType: { name: string; unitType: string | null } | null;
  setSelectedAdType: (type: { name: string; unitType: string | null } | null) => void;
}

const AdTypeFilterContext = createContext<AdTypeFilterContextType | undefined>(undefined);

export function AdTypeFilterProvider({ children }: { children: ReactNode }) {
  const [selectedAdType, setSelectedAdType] = useState<{ name: string; unitType: string | null } | null>(null);

  return (
    <AdTypeFilterContext.Provider value={{ selectedAdType, setSelectedAdType }}>
      {children}
    </AdTypeFilterContext.Provider>
  );
}

export function useAdTypeFilter() {
  const context = useContext(AdTypeFilterContext);
  if (context === undefined) {
    throw new Error('useAdTypeFilter must be used within an AdTypeFilterProvider');
  }
  return context;
}


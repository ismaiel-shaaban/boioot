'use client';

import { useState, useEffect } from 'react';
import { projectsService } from '@/lib/services/projects';
import { showToast } from '@/lib/utils/toast';

interface UnitDetailsClientProps {
  unitId: string;
}

export default function UnitDetailsClient({ unitId }: UnitDetailsClientProps) {
  const [unit, setUnit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load unit details
    // This will need to be implemented based on the API endpoint
    setIsLoading(false);
  }, [unitId]);

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1>تفاصيل الوحدة</h1>
      <p>صفحة تفاصيل الوحدة - قيد التطوير</p>
    </div>
  );
}


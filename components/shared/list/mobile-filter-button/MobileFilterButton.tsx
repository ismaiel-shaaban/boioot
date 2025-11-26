'use client';

// Placeholder component - convert from Angular MobileFilterButtonComponent
interface MobileFilterButtonProps {
  onOpenFilters: () => void;
}

export default function MobileFilterButton({ onOpenFilters }: MobileFilterButtonProps) {
  return (
    <button onClick={onOpenFilters} className="btn btn-primary">
      فتح الفلاتر
    </button>
  );
}


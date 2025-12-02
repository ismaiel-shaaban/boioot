'use client';

import { useState, useRef, useEffect } from 'react';
import { getCountries, getCountryCallingCode, Country } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en.json';
import Image from 'next/image';
import styles from './CountrySelect.module.css';

interface CountrySelectProps {
  value: Country | undefined;
  onChange: (country: Country) => void;
  preferredCountries?: Country[];
  defaultCountry?: Country;
  containerRef?: React.RefObject<HTMLDivElement>;
}

// Arabic country names mapping
const arabicCountryNames: { [key: string]: string } = {
  SA: 'المملكة العربية السعودية',
  SY: 'سوريا',
  AE: 'الإمارات العربية المتحدة',
  EG: 'مصر',
  IQ: 'العراق',
  JO: 'الأردن',
  LB: 'لبنان',
  KW: 'الكويت',
  QA: 'قطر',
  BH: 'البحرين',
  OM: 'عمان',
  YE: 'اليمن',
  PS: 'فلسطين',
  MA: 'المغرب',
  DZ: 'الجزائر',
  TN: 'تونس',
  LY: 'ليبيا',
  SD: 'السودان',
};

export default function CountrySelect({
  value,
  onChange,
  preferredCountries = ['SA', 'SY'],
  defaultCountry = 'SY',
  containerRef,
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>(undefined);

  const allCountries = getCountries();
  const currentCountry = value || defaultCountry;

  // Separate preferred and other countries
  const preferred = preferredCountries.filter((c) => allCountries.includes(c));
  const otherCountries = allCountries.filter((c) => !preferredCountries.includes(c));

  // Get country name (Arabic if available, otherwise English)
  const getCountryName = (country: Country): string => {
    if (arabicCountryNames[country]) {
      return arabicCountryNames[country];
    }
    return (en as any)[country] || country;
  };

  // Get flag image URL - using flag CDN
  const getCountryFlagUrl = (country: Country): string => {
    return `https://flagcdn.com/w20/${country.toLowerCase()}.png`;
  };

  // Convert country code to flag emoji (fallback)
  const getCountryFlagEmoji = (country: Country): string => {
    try {
      const codePoints = country
        .toUpperCase()
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      return country;
    }
  };

  // Filter countries based on search
  const filterCountries = (countries: Country[]) => {
    if (!searchTerm) return countries;
    const term = searchTerm.toLowerCase();
    return countries.filter((country) => {
      const name = getCountryName(country);
      const code = getCountryCallingCode(country);
      return (
        name.toLowerCase().includes(term) ||
        code.includes(term) ||
        country.toLowerCase().includes(term) ||
        (en as any)[country]?.toLowerCase().includes(term)
      );
    });
  };

  const filteredPreferred = filterCountries(preferred);
  const filteredOther = filterCountries(otherCountries);

  // Calculate dropdown width based on container
  useEffect(() => {
    if (isOpen && containerRef?.current) {
      const width = containerRef.current.offsetWidth;
      setDropdownWidth(width);
    }
  }, [isOpen, containerRef]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCountrySelect = (country: Country) => {
    onChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  const renderCountryOption = (country: Country) => {
    const name = getCountryName(country);
    const callingCode = getCountryCallingCode(country);
    const isSelected = country === currentCountry;

    return (
      <div
        key={country}
        className={`${styles.countryOption} ${isSelected ? styles.selected : ''}`}
        onClick={() => handleCountrySelect(country)}
      >
        <div className={styles.flagContainer}>
          <img
            src={getCountryFlagUrl(country)}
            alt={name}
            className={styles.flag}
            onError={(e) => {
              // Fallback to emoji if image fails
              (e.target as HTMLImageElement).style.display = 'none';
              const emojiSpan = document.createElement('span');
              emojiSpan.textContent = getCountryFlagEmoji(country);
              emojiSpan.className = styles.flag;
              (e.target as HTMLElement).parentElement?.appendChild(emojiSpan);
            }}
          />
        </div>
        <span className={styles.countryName}>{name}</span>
        <span className={styles.callingCode}>+{callingCode}</span>
      </div>
    );
  };

  return (
    <div className={styles.countrySelectWrapper} ref={dropdownRef}>
      <button
        type="button"
        className={styles.countrySelectButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="اختر الدولة"
      >
        <div className={styles.flagContainer}>
          <img
            src={getCountryFlagUrl(currentCountry)}
            alt={getCountryName(currentCountry)}
            className={styles.flag}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const emojiSpan = document.createElement('span');
              emojiSpan.textContent = getCountryFlagEmoji(currentCountry);
              emojiSpan.className = styles.flag;
              (e.target as HTMLElement).parentElement?.appendChild(emojiSpan);
            }}
          />
        </div>
        <span className={styles.dialCodeButton}>+{getCountryCallingCode(currentCountry)}</span>
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div 
          className={styles.dropdown}
          style={dropdownWidth ? { width: `${dropdownWidth}px` } : undefined}
        >
          <div className={styles.searchContainer}>
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder="ابحث عن الدولة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className={styles.countryList}>
            {filteredPreferred.length > 0 && (
              <>
                <div className={styles.countryGroup}>
                  {filteredPreferred.map(renderCountryOption)}
                </div>
                {filteredOther.length > 0 && <div className={styles.divider}></div>}
              </>
            )}

            {filteredOther.length > 0 && (
              <div className={styles.countryGroup}>
                {filteredOther.map(renderCountryOption)}
              </div>
            )}

            {filteredPreferred.length === 0 && filteredOther.length === 0 && (
              <div className={styles.noResults}>لا توجد نتائج</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState } from 'react';
import styles from './Search.module.css';

interface SearchProps {
  onSearchChanged: (term: string) => void;
  placeholder?: string;
}

export default function Search({ onSearchChanged, placeholder = 'ابحث بالكلمات' }: SearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearchChanged(searchTerm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChanged(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearchChanged('');
  };

  return (
    <div className={styles.searchWrapper}>
      <input
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      <i className={`fa-solid fa-magnifying-glass ${styles.searchIcon}`} onClick={handleSearch}></i>
      {searchTerm && (
        <i className={`fa-solid fa-times ${styles.clearIcon}`} onClick={clearSearch}></i>
      )}
    </div>
  );
}

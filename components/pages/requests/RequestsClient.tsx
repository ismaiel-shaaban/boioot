'use client';

import { useState } from 'react';
import Search from '@/components/shared/search/Search';
import OrdersList from '@/components/pages/user-profile/tabs/OrdersList';
import styles from './RequestsClient.module.css';

export default function RequestsClient() {
  const [searchTerm, setSearchTerm] = useState('');

  const onSearchChanged = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="container mt-4" aria-label="صفحة الطلبات">
      <div className="row">
        <div className="col-12">
          <h3 className={styles.sectionTitle}>الطلبات</h3>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-12">
          <Search onSearchChanged={onSearchChanged} placeholder="ابحث في الطلبات" />
        </div>
      </div>

      {/* Reuse OrdersList component with empty filters for all requests */}
      <OrdersList filters={{}} searchTerm={searchTerm} />
    </div>
  );
}


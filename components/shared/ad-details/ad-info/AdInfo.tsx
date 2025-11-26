'use client';

import styles from './AdInfo.module.css';

interface AdInfoProps {
  Floor?: number;
  Area?: number;
  Rooms?: number;
  Bathrooms?: number;
  Street?: number;
  Halls?: number;
  Category?: string;
  Title?: string;
  AdAge?: string;
  Description?: string;
  City?: string;
  District?: string;
}

export default function AdInfo({ 
  Floor, 
  Area, 
  Rooms, 
  Bathrooms, 
  Street, 
  Halls, 
  Category, 
  Title, 
  AdAge, 
  Description, 
  City, 
  District 
}: AdInfoProps) {
  return (
    <div className={styles.adInfoContainer}>
      <h1 className={styles.title2}>{Title}</h1>
      <h3 className={styles.title}>
        <span>{District}{City && ','}{City}</span>
      </h3>

      <div className={styles.description}>
        <p>{Description}</p>
      </div>

      <div className="specs-section mt-5">
        <h4 className={styles.sectionTitle}>التفاصيل</h4>

        <div className={styles.specsGrid}>
          {AdAge && (
            <div className={styles.specItem}>
              <div className={styles.specIcon}>
                <i className="fas fa-building"></i>
              </div>
              <div className={styles.specContent}>
                <div className={styles.specLabel}>عمر العقار</div>
                <div className={styles.specValue}>{AdAge}</div>
              </div>
            </div>
          )}

          {Floor !== undefined && Floor !== null && Floor !== 0 && (
            <div className={styles.specItem}>
              <div className={styles.specIcon}>
                <i className="fas fa-stairs"></i>
              </div>
              <div className={styles.specContent}>
                <div className={styles.specLabel}>الدور</div>
                <div className={styles.specValue}>{Floor}</div>
              </div>
            </div>
          )}

          {Area && (
            <div className={styles.specItem}>
              <div className={styles.specIcon}>
                <i className="fas fa-vector-square"></i>
              </div>
              <div className={styles.specContent}>
                <div className={styles.specLabel}>المساحة (م²)</div>
                <div className={styles.specValue}>{Area}</div>
              </div>
            </div>
          )}

          {Bathrooms && (
            <div className={styles.specItem}>
              <div className={styles.specIcon}>
                <i className="fas fa-bath"></i>
              </div>
              <div className={styles.specContent}>
                <div className={styles.specLabel}>دورات المياه</div>
                <div className={styles.specValue}>{Bathrooms}</div>
              </div>
            </div>
          )}

          {Category && (
            <div className={styles.specItem}>
              <div className={styles.specIcon}>
                <i className="fas fa-tag"></i>
              </div>
              <div className={styles.specContent}>
                <div className={styles.specLabel}>الفئة</div>
                <div className={styles.specValue}>{Category}</div>
              </div>
            </div>
          )}

          {Rooms && (
            <div className={styles.specItem}>
              <div className={styles.specIcon}>
                <i className="fas fa-bed"></i>
              </div>
              <div className={styles.specContent}>
                <div className={styles.specLabel}>غرف النوم</div>
                <div className={styles.specValue}>{Rooms}</div>
              </div>
            </div>
          )}

          {Street && Street !== 0 && (
            <div className={styles.specItem}>
              <div className={styles.specIcon}>
                <i className="fas fa-road"></i>
              </div>
              <div className={styles.specContent}>
                <div className={styles.specLabel}>عرض الشارع (م)</div>
                <div className={styles.specValue}>{Street}</div>
              </div>
            </div>
          )}

          {Halls && (
            <div className={styles.specItem}>
              <div className={styles.specIcon}>
                <i className="fas fa-door-open"></i>
              </div>
              <div className={styles.specContent}>
                <div className={styles.specLabel}>الصالات</div>
                <div className={styles.specValue}>{Halls}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


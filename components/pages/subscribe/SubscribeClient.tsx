'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeService } from '@/lib/services/subscribe';
import { showToast } from '@/lib/utils/toast';
import styles from './SubscribeClient.module.css';

interface SubscribeClientProps {
  initialPackages: any[];
  error: string | null;
}

export default function SubscribeClient({ initialPackages, error }: SubscribeClientProps) {
  const router = useRouter();
  const [packages, setPackages] = useState<any[]>(initialPackages);
  const [currentPackage, setCurrentPackage] = useState<any>(initialPackages[0] || null);
  const [selectedPeriod, setSelectedPeriod] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialPackages.length > 0) {
      setPackages(initialPackages);
      setCurrentPackage(initialPackages[0]);
    }
  }, [initialPackages]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error]);

  const selectPackage = (packageCurrent: any) => {
    setCurrentPackage(packageCurrent);
  };

  const selectPeriod = (period: 'Monthly' | 'Yearly') => {
    setSelectedPeriod(period);
  };

  const getPrice = (pkg: any) => {
    return pkg?.Prices?.find((price: any) => price.Period === selectedPeriod);
  };

  const getSelectedPriceId = (pkg: any): string => {
    const price = getPrice(pkg);
    return price?.Id || '';
  };

  const handleSubscribe = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await subscribeService.addSubscribeToUser(id);
      if (response?.IsSuccess) {
        showToast('تم الاشتراك', 'success');
        router.back();
      } else {
        showToast(response?.Error || 'فشل الاشتراك', 'error');
      }
    } catch (error: any) {
      showToast(error?.message || 'حدث خطأ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.userProfilePage} aria-label="صفحة الاشتراك">
      <div className={styles.mainContent}>
        <div className={styles.mainCard}>
          <div className="container">
            {/* Page Title */}
            <div className={styles.pageTitle}>
              <h1 aria-label="اختر الباقة المناسبة للترقية">اختر الباقة المناسبة للترقية</h1>
            </div>

            {/* Packages Section */}
            {packages.length > 0 && (
              <div className={styles.packagesSection} aria-label="قائمة الباقات">
                <div className="row" style={{ justifyContent: 'space-evenly' }}>
                  {packages.map((pkg: any) => (
                    <div
                      key={pkg.Id}
                      className="col-12 col-md-6 col-lg-5 mb-4"
                      onClick={() => selectPackage(pkg)}
                    >
                      <div
                        className={styles.packageCard}
                        style={{ borderColor: pkg?.CardColor }}
                        aria-label="بطاقة الباقة"
                      >
                        <div className={styles.packageTopLineWhite}></div>
                        <div
                          className={styles.packageTopLine}
                          style={{ backgroundColor: pkg?.CardColor }}
                        ></div>
                        {/* Package Header */}
                        <div
                          className={styles.packageHeader}
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${pkg?.CardColor}, ${pkg?.CardColor}80, ${pkg?.CardColor}40)`,
                          }}
                          aria-label="اسم الباقة"
                        >
                          <h3 className={styles.packageName}>{pkg?.Name}</h3>
                        </div>

                        {/* Package Content */}
                        <div className={styles.packageContent}>
                          <div className={styles.packageDetails}>
                            <div className={styles.adsSection}>
                              <div className="row" style={{ textAlign: 'center' }}>
                                <div className="col-lg-6">
                                  <div className={styles.adsLabel}>عدد الإعلانات المتاحة</div>
                                </div>
                                <div className="col-lg-6">
                                  <div className={styles.adsCount}>{pkg?.MaxAdsCount}</div>
                                </div>
                              </div>
                            </div>

                            <div className={styles.priceSection}>
                              <div className={styles.priceInfo}>
                                <div className="row">
                                  <div className="col-lg-6">
                                    <div className={styles.priceLabel}>السعر</div>
                                  </div>
                                  <div className="col-lg-6" style={{ textAlign: 'left' }}>
                                    {getPrice(pkg)?.OriginalPrice && (
                                      <span className={styles.originalPrice}>
                                        {getPrice(pkg)?.OriginalPrice}
                                      </span>
                                    )}
                                    <span className={styles.currentPrice}>
                                      {' '}
                                      {getPrice(pkg)?.FinalPrice}
                                    </span>
                                    <span className={styles.currentPrice}> ليرة </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Packages Message */}
            {(!packages || packages.length === 0) && (
              <div className="row">
                <div className="col-12">
                  <div className="alert alert-info text-center" role="alert" aria-label="لا يوجد باقات">
                    لايوجد باقات
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Options */}
            {currentPackage && (
              <div className={styles.subscriptionOptions} aria-label="خيارات الاشتراك">
                <div className={styles.pricingSection}>
                  <div className={styles.paymentButton}>
                    <button
                      className={styles.btnPayment}
                      onClick={() => handleSubscribe(getSelectedPriceId(currentPackage))}
                      disabled={isLoading}
                      aria-label="الانتقال لبوابة الدفع"
                    >
                      {isLoading ? 'جاري المعالجة...' : 'انتقل لبوابة الدفع'}
                    </button>
                  </div>

                  <div className={`${styles.pricingInfo} d-flex align-items-center`} aria-label="معلومات التسعير">
                    <div>
                      <span className={styles.totalPrice}> ليرة</span>
                    </div>
                    <div>
                      <span className={styles.totalPrice}>
                        &ensp; &ensp;{getPrice(currentPackage)?.FinalPrice}&ensp; &ensp;
                      </span>
                    </div>
                  </div>

                  <div className={styles.periodSection} style={{ direction: 'rtl' }}>
                    <span className={styles.pricingLabel}>
                      السعر الإجمالي ل{currentPackage?.Name} في
                    </span>
                    <div className={styles.periodToggle}>
                      <button
                        className={`${styles.periodBtn} ${selectedPeriod === 'Monthly' ? styles.active : ''}`}
                        onClick={() => selectPeriod('Monthly')}
                        aria-label="اختيار الاشتراك الشهري"
                      >
                        الشهر
                      </button>
                      <button
                        className={`${styles.periodBtn} ${selectedPeriod === 'Yearly' ? styles.active : ''}`}
                        onClick={() => selectPeriod('Yearly')}
                        aria-label="اختيار الاشتراك السنوي"
                      >
                        السنة
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { licensesService } from '@/lib/services/licenses';
import { showToast } from '@/lib/utils/toast';
import styles from './LicenseManagement.module.css';
import Image from 'next/image';

interface License {
  Id: string;
  LicenseNumber?: string;
  AttachmentUrl?: string;
}

interface LicenseManagementProps {
  onChangeTab?: (license: any) => void;
}

export default function LicenseManagement({ onChangeTab }: LicenseManagementProps) {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [licenseIdToDelete, setLicenseIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    getAllLicenses();
  }, []);

  const getAllLicenses = async () => {
    setIsLoading(true);
    try {
      const response = await licensesService.getLicenses();
      if (response?.IsSuccess || response?.Success) {
        const licensesData = Array.isArray(response?.Data) ? response.Data : [];
        setLicenses(licensesData);
      } else {
        showToast(response?.Error || response?.Message || 'فشل في تحميل التراخيص', 'error');
      }
    } catch (error: any) {
      console.error('Error loading licenses:', error);
      showToast('حدث خطأ أثناء تحميل التراخيص', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const editLicense = (license: License) => {
    if (onChangeTab) {
      onChangeTab({
        Id: license.Id,
        LicenseNumber: license.LicenseNumber,
      });
    }
  };

  const openDeleteModal = (licenseId: string) => {
    setLicenseIdToDelete(licenseId);
    setShowDeleteDialog(true);
  };

  const toggleDeleteDialog = () => {
    setShowDeleteDialog(!showDeleteDialog);
    if (showDeleteDialog) {
      setLicenseIdToDelete(null);
    }
  };

  const deleteLicense = async () => {
    if (!licenseIdToDelete) return;

    try {
      const response = await licensesService.deleteLicense(licenseIdToDelete);
      if (response?.IsSuccess || response?.Success) {
        showToast('تم الحذف بنجاح', 'success');
        setLicenseIdToDelete(null);
        toggleDeleteDialog();
        getAllLicenses();
      } else {
        showToast(response?.Error || response?.Message || 'فشل في حذف الرخصة', 'error');
        toggleDeleteDialog();
      }
    } catch (error: any) {
      console.error('Error deleting license:', error);
      showToast('حدث خطأ أثناء حذف الرخصة', 'error');
      toggleDeleteDialog();
    }
  };

  const isPdfFile = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.pdf');
  };

  const isPngFile = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.toLowerCase().endsWith('.png');
  };

  return (
    <div className={styles.licensesList} aria-label="قائمة التراخيص">
      {isLoading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <p className="mt-2">جاري تحميل التراخيص...</p>
        </div>
      )}

      {!isLoading && licenses && licenses.length > 0 && (
        <div className="row">
          {licenses.map((license) => (
            <div key={license.Id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
              <div className={styles.licenseItem} role="article" aria-label="ترخيص">
                {license.AttachmentUrl && (
                  <div className={styles.licensePreview}>
                    <a
                      href={license.AttachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.previewLink}
                      aria-label="عرض الترخيص في نافذة جديدة"
                    >
                      {isPdfFile(license.AttachmentUrl) ? (
                        <div className={styles.pdfPreview}>
                          <Image
                            src="/assets/images/pdf.png"
                            alt="License PDF Preview"
                            width={200}
                            height={200}
                            loading="lazy"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            aria-label="معاينة PDF للترخيص"
                          />
                        </div>
                      ) : (
                        <Image
                          src={license.AttachmentUrl}
                          alt="License Preview"
                          width={200}
                          height={200}
                          loading="lazy"
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          aria-label="معاينة صورة الترخيص"
                        />
                      )}
                    </a>
                    {isPdfFile(license.AttachmentUrl) && (
                      <div className={`${styles.fileType} ${styles.pdf}`} aria-label="نوع الملف PDF">
                        pdf
                      </div>
                    )}
                    {isPngFile(license.AttachmentUrl) && (
                      <div className={`${styles.fileType} ${styles.jpg}`} aria-label="نوع الملف PNG">
                        png
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.cardActionsContainer}>
                <button
                  className={`btn ${styles.btnDelete}`}
                  onClick={() => openDeleteModal(license.Id)}
                  aria-label="حذف الترخيص"
                >
                  <i className="fas fa-trash"></i> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!licenses || licenses.length === 0) && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-info text-center" role="alert" aria-label="لا يوجد تراخيص">
              لايوجد الترخيصات
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className={styles.cancellationDialog} role="dialog" aria-modal="true" aria-label="تأكيد حذف الترخيص">
          <div
            className={styles.dialogOverlay}
            onClick={toggleDeleteDialog}
            aria-label="إغلاق مربع الحوار"
          ></div>
          <div className={styles.dialogContent}>
            <h3 className={styles.dialogTitle}>تأكيد الحذف</h3>
            <p className={styles.dialogMessage}>
              هل أنت متأكد من حذف رخصة النشاط العقرى؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className={styles.dialogActions}>
              <button
                className={`btn ${styles.btnSuccess}`}
                onClick={deleteLicense}
                aria-label="تأكيد حذف الرخصة"
              >
                حذف الرخصه؟
              </button>
              <button
                className={`btn ${styles.btnCancel}`}
                onClick={toggleDeleteDialog}
                aria-label="تراجع عن الحذف"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

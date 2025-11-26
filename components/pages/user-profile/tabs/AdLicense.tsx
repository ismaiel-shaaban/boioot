'use client';

import { useState, useEffect } from 'react';
import { licensesService } from '@/lib/services/licenses';
import { showToast } from '@/lib/utils/toast';
import styles from './AdLicense.module.css';

interface AdLicenseProps {
  license?: any;
  onChangeTab?: () => void;
}

export default function AdLicense({ license, onChangeTab }: AdLicenseProps) {
  const [newLicense, setNewLicense] = useState({
    file: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [licenseId, setLicenseId] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (license) {
      getLicenseById();
    } else {
      resetForm();
    }
  }, [license]);

  const getLicenseById = async () => {
    setIsLoading(true);
    try {
      setLicenseId(license?.Id || null);
    } finally {
      setIsLoading(false);
    }
  };

  const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewLicense({ file });
      setFileName(file.name);
    }
  };

  const saveChange = async () => {
    if (!license) {
      await addNewLicense();
    } else {
      await updateLicense();
    }
  };

  const addNewLicense = async () => {
    if (!newLicense.file) {
      showToast('يرجى اختيار ملف للترخيص', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await licensesService.uploadUserLicense(newLicense.file);
      if (response?.IsSuccess || response?.Success) {
        setNewLicense({ file: null });
        setFileName('');
        showToast(response?.Message || 'تم إضافة الترخيص بنجاح', 'success');
        onChangeTab?.();
      } else {
        showToast(response?.Error || 'فشل في إضافة الترخيص', 'error');
      }
    } catch (error: any) {
      console.error('Error adding license:', error);
      showToast('حدث خطأ أثناء إضافة الترخيص', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateLicense = async () => {
    if (!newLicense.file || !licenseId) {
      showToast('يرجى اختيار ملف للترخيص', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const uploadResponse = await licensesService.uploadUserLicense(newLicense.file);
      if (uploadResponse?.IsSuccess || uploadResponse?.Success) {
        const data = uploadResponse.Data as any;
        const fileId = data?.fileId || data?.Id;
        const updateResponse = await licensesService.updateLicense(licenseId, fileId);
        if (updateResponse?.IsSuccess || updateResponse?.Success) {
          setNewLicense({ file: null });
          setFileName('');
          setLicenseId(null);
          showToast(updateResponse?.Message || 'تم تحديث الترخيص بنجاح', 'success');
          onChangeTab?.();
        } else {
          showToast(updateResponse?.Error || 'فشل في تحديث الترخيص', 'error');
        }
      } else {
        showToast(uploadResponse?.Error || 'فشل في رفع الملف', 'error');
      }
    } catch (error: any) {
      console.error('Error updating license:', error);
      showToast('حدث خطأ أثناء تحديث الترخيص', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewLicense({ file: null });
    setFileName('');
  };

  const cancel = () => {
    resetForm();
    setLicenseId(null);
    onChangeTab?.();
  };

  const isFormValid = !!newLicense.file;

  return (
    <div className={styles.adLicenseTab}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveChange();
        }}
        aria-label="نموذج إضافة ترخيص"
      >
        <div className="form-floating mb-3">
          <div className={styles.fileUploadArea}>
            <input
              type="file"
              id="licenseFile"
              className={styles.fileInput}
              onChange={onFileSelected}
              accept=".pdf,.jpg,.jpeg,.png"
              placeholder="اختر ملف"
              aria-label="رفع صورة أو ملف PDF"
              required={!license}
            />
            <label>اختر رفع صورة أو ملف pdf</label>
            <label htmlFor="licenseFile" className={styles.fileUploadButton} aria-label="زر رفع صورة أو ملف PDF">
              <i className="fas fa-upload"></i>
            </label>
            {fileName && <div className={styles.fileName}>{fileName}</div>}
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={`btn ${styles.btnSave}`}
            disabled={!isFormValid || isLoading}
            aria-label="حفظ الترخيص"
          >
            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button type="button" className={`btn ${styles.btnCancel}`} onClick={cancel} aria-label="إلغاء">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { propertyRequestsService } from '@/lib/services/property-requests';
import { projectsService } from '@/lib/services/projects';
import { showToast } from '@/lib/utils/toast';
import styles from './AddPropertyRequestClient.module.css';

export interface City {
  Id: string | number;
  ArName: string;
  EnName?: string;
  Description?: string;
  CountryId?: string;
}

interface District {
  Id: string | number;
  ArName: string;
  CityId?: string | number;
}

interface PropertyRequestDetails {
  Id?: string;
  Title?: string;
  Description?: string;
  Type?: number;
  City?: string;
  District?: string;
}

type FieldKey = 'title' | 'description' | 'category' | 'city' | 'district';

interface AddPropertyRequestClientProps {
  initialCities: City[];
  error: string | null;
  requestId?: string;
}

const CATEGORIES = [
  { Id: 0, ArName: 'طلب عقار (شراء/بيع)' },
  { Id: 1, ArName: 'طلب وحدة (شقة/فيلا)' },
  { Id: 2, ArName: 'طلب إيجار يومي' },
  { Id: 3, ArName: 'طلب/استفسار خاص بالإعلانات' },
  { Id: 4, ArName: 'طلبات خاصة' },
  { Id: 5, ArName: 'صيانة/خدمة' },
  { Id: 99, ArName: 'أخرى' },
];

const normalizeResponse = <T,>(response: any): T[] => {
  if (Array.isArray(response)) return response as T[];
  if (Array.isArray(response?.Data)) return response.Data as T[];
  if (Array.isArray(response?.Data?.Items)) return response.Data.Items as T[];
  if (Array.isArray(response?.Items)) return response.Items as T[];
  return [];
};

export default function AddPropertyRequestClient({ initialCities, error, requestId }: AddPropertyRequestClientProps) {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>(initialCities || []);
  const [districts, setDistricts] = useState<District[]>([]);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [fieldTouched, setFieldTouched] = useState<Record<FieldKey, boolean>>({
    title: false,
    description: false,
    category: false,
    city: false,
    district: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<FieldKey, string>>({
    title: '',
    description: '',
    category: '',
    city: '',
    district: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [showAddDistrictModal, setShowAddDistrictModal] = useState(false);
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [isAddingDistrict, setIsAddingDistrict] = useState(false);
  const [newCity, setNewCity] = useState({
    ArName: '',
    EnName: '',
    Description: '',
    CountryId: '50b033f3-6652-4ae0-a248-ac7aeb28fed1',
  });
  const [newDistrict, setNewDistrict] = useState({
    ArName: '',
    EnName: '',
    Description: '',
    CityId: '',
  });
  const [pageError, setPageError] = useState<string | null>(error);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(Boolean(requestId));
  const [requestError, setRequestError] = useState<string | null>(null);
  const [pendingCityName, setPendingCityName] = useState<string | null>(null);

  const isEditMode = Boolean(requestId);

  const validateField = useCallback(
    (fieldName: FieldKey) => {
      setFieldErrors((prev) => {
        const errors = { ...prev };
        switch (fieldName) {
          case 'title': {
            const value = formData.title.trim();
            if (!value) {
              errors.title = 'عنوان الطلب مطلوب';
            } else if (value.length < 3) {
              errors.title = 'عنوان الطلب يجب أن يكون 3 أحرف على الأقل';
            } else if (value.length > 100) {
              errors.title = 'عنوان الطلب يجب أن يكون أقل من 100 حرف';
            } else {
              errors.title = '';
            }
            break;
          }
          case 'description': {
            const value = formData.description.trim();
            if (!value) {
              errors.description = 'وصف الطلب مطلوب';
            } else if (value.length < 10) {
              errors.description = 'وصف الطلب يجب أن يكون 10 أحرف على الأقل';
            } else if (value.length > 500) {
              errors.description = 'وصف الطلب يجب أن يكون أقل من 500 حرف';
            } else {
              errors.description = '';
            }
            break;
          }
          case 'category':
            errors.category = selectedCategoryId ? '' : 'يرجى اختيار الفئة';
            break;
          case 'city':
            errors.city = selectedCityId ? '' : 'يرجى اختيار المدينة';
            break;
          case 'district':
            errors.district = '';
            break;
        }
        return errors;
      });
    },
    [formData.description, formData.title, selectedCategoryId, selectedCityId],
  );

  const onFieldBlur = (fieldName: FieldKey) => {
    setFieldTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  const reloadCities = useCallback(async () => {
    setCitiesLoading(true);
    try {
      const response = await projectsService.getCities();
      const fetchedCities = normalizeResponse<City>(response);
      setCities(fetchedCities);
      setPageError(null);
    } catch (err: any) {
      setPageError(err?.message || 'فشل في تحميل المدن، يرجى المحاولة مرة أخرى');
    } finally {
      setCitiesLoading(false);
    }
  }, []);

  const loadDistricts = useCallback(async (cityId: string | number) => {
    if (!cityId) {
      setDistricts([]);
      return;
    }
    try {
      const response = await projectsService.getDistrictsByCity(cityId.toString());
      setDistricts(normalizeResponse<District>(response));
    } catch {
      showToast('فشل في تحميل الأحياء', 'error');
    }
  }, []);

  useEffect(() => {
    if (!initialCities.length && !error) {
      reloadCities();
    }
  }, [initialCities.length, error, reloadCities]);

  useEffect(() => {
    if (!requestId) {
      return;
    }

    const fetchRequest = async () => {
      setRequestLoading(true);
      setRequestError(null);
      try {
        const response = await propertyRequestsService.getPropertyRequestById(requestId);
        const requestData = (response?.Data || response) as PropertyRequestDetails | null;
        if (!requestData) {
          setRequestError('تعذر تحميل بيانات الطلب المطلوب تعديله');
          return;
        }

        setFormData({
          title: requestData.Title || '',
          description: requestData.Description || '',
        });
        setSelectedCategoryId(requestData.Type?.toString() ?? '');
        setSelectedDistrictName(requestData.District || '');

        if (cities.length) {
          const matchedCity = cities.find((city) => city.ArName === requestData.City);
          if (matchedCity) {
            const cityId = matchedCity.Id.toString();
            setSelectedCityId(cityId);
            loadDistricts(cityId);
          } else {
            setPendingCityName(requestData.City || null);
          }
        } else {
          setPendingCityName(requestData.City || null);
        }
      } catch (err: any) {
        setRequestError(err?.message || 'تعذر تحميل بيانات الطلب المطلوب تعديله');
      } finally {
        setRequestLoading(false);
      }
    };

    fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  useEffect(() => {
    if (pendingCityName && cities.length) {
      const matchedCity = cities.find((city) => city.ArName === pendingCityName);
      if (matchedCity) {
        const cityId = matchedCity.Id.toString();
        setSelectedCityId(cityId);
        loadDistricts(cityId);
      }
      setPendingCityName(null);
    }
  }, [pendingCityName, cities, loadDistricts]);

  const onCityChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = event.target.value;
    setSelectedCityId(cityId);
    setSelectedDistrictName('');
    setDistricts([]);

    if (cityId) {
      await loadDistricts(cityId);
    }

    validateField('city');
  };

  const shouldShowFieldFeedback = (field: FieldKey): boolean => fieldTouched[field] && Boolean(fieldErrors[field]);

  const getSelectedName = (id: string, array: { Id: string | number; ArName: string }[]): string => {
    const item = array.find((entry) => entry.Id?.toString() === id);
    return item ? item.ArName : '';
  };

  const isFormValid = useMemo(() => {
    const title = formData.title.trim();
    const description = formData.description.trim();
    return Boolean(
      title &&
        title.length >= 3 &&
        title.length <= 100 &&
        description &&
        description.length >= 10 &&
        description.length <= 500 &&
        selectedCategoryId &&
        selectedCityId,
    );
  }, [formData.description, formData.title, selectedCategoryId, selectedCityId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldTouched({
      title: true,
      description: true,
      category: true,
      city: true,
      district: true,
    });
    ['title', 'description', 'category', 'city'].forEach((field) => validateField(field as FieldKey));

    const title = formData.title.trim();
    const description = formData.description.trim();
    if (
      !title ||
      title.length < 3 ||
      title.length > 100 ||
      !description ||
      description.length < 10 ||
      description.length > 500 ||
      !selectedCategoryId ||
      !selectedCityId
    ) {
      return;
    }

    setIsSubmitting(true);

    const dto = {
      Title: title,
      Description: description,
      Category: getSelectedName(selectedCategoryId, CATEGORIES),
      City: getSelectedName(selectedCityId, cities),
      District: selectedDistrictName || null,
      Type: parseInt(selectedCategoryId, 10) || 0,
    };

    const payload = { Dto: dto };

    try {
      const response = isEditMode && requestId
        ? await propertyRequestsService.updatePropertyRequest(requestId, payload)
        : await propertyRequestsService.createPropertyRequest(payload);

      if (response?.IsSuccess) {
        showToast(isEditMode ? 'تم تعديل الطلب بنجاح' : 'تم إرسال الطلب بنجاح', 'success');
        router.push('/profile');
      } else {
        showToast(response?.Error || 'حدث خطأ أثناء حفظ الطلب', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'حدث خطأ أثناء حفظ الطلب', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCity = async () => {
    if (!newCity.ArName.trim()) {
      showToast('يرجى إدخال اسم المدينة', 'error');
      return;
    }

    setIsAddingCity(true);
    const cityData = {
      ...newCity,
      EnName: newCity.ArName,
      Description: 'مدينة جديدة',
    };

    try {
      const response: any = await projectsService.addNewCity(cityData);
      if (response && response.IsSuccess !== false) {
        showToast('تم إضافة المدينة بنجاح', 'success');
        const newCityItem = {
          Id: response?.Id || response?.id || Date.now().toString(),
          ArName: newCity.ArName,
          EnName: newCity.ArName,
          Description: cityData.Description,
          CountryId: cityData.CountryId,
        };
        setCities((prev) => [...prev, newCityItem]);
        setSelectedCityId(newCityItem.Id.toString());
        setShowAddCityModal(false);
        setNewCity({ ArName: '', EnName: '', Description: '', CountryId: '50b033f3-6652-4ae0-a248-ac7aeb28fed1' });
        validateField('city');
      } else {
        showToast(response?.Error || 'فشل في إضافة المدينة', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'فشل في إضافة المدينة', 'error');
    } finally {
      setIsAddingCity(false);
    }
  };

  const handleAddDistrict = async () => {
    if (!newDistrict.ArName.trim()) {
      showToast('يرجى إدخال اسم الحي', 'error');
      return;
    }

    if (!selectedCityId) {
      showToast('يرجى اختيار المدينة أولاً', 'error');
      return;
    }

    setIsAddingDistrict(true);
    const districtData = {
      ...newDistrict,
      CityId: selectedCityId,
      EnName: newDistrict.ArName,
    };

    try {
      const response: any = await projectsService.addNewDistrict(districtData);
      if (response && response.IsSuccess !== false) {
        showToast('تم إضافة الحي بنجاح', 'success');
        const newDistrictItem = {
          Id: response?.Id || response?.id || Date.now().toString(),
          ArName: newDistrict.ArName,
          EnName: newDistrict.EnName,
          Description: newDistrict.Description,
          CityId: selectedCityId,
        };
        setDistricts((prev) => [...prev, newDistrictItem]);
        setSelectedDistrictName(newDistrict.ArName);
        setShowAddDistrictModal(false);
        setNewDistrict({ ArName: '', EnName: '', Description: '', CityId: '' });
      } else {
        showToast(response?.Error || 'فشل في إضافة الحي', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'فشل في إضافة الحي', 'error');
    } finally {
      setIsAddingDistrict(false);
    }
  };

  const pageTitle = isEditMode ? 'تعديل طلب عقار' : 'إضافة طلب عقار';
  const buttonLabel = isSubmitting
    ? isEditMode
      ? 'جاري حفظ التعديلات...'
      : 'جاري الإرسال...'
    : isEditMode
      ? 'حفظ التعديلات'
      : 'حفظ ونشر';

  const showCustomDistrictOption =
    Boolean(selectedDistrictName) &&
    !districts.some((district) => district.ArName === selectedDistrictName);

  return (
    <div className={styles.marketingRequestPage}>
      <div className={styles.contentContainer}>
        <div className={styles.pageHeader}>
          <p className={styles.pageSubtitle}>منطقة إدارة الطلبات</p>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
          <p className={styles.pageDescription}>املأ تفاصيل طلب العقار بدقة للوصول إلى أفضل العروض في بوابة العقارات.</p>
        </div>

        <div className={styles.contentArea}>
          {(pageError || requestError) && (
            <div className={`${styles.inlineAlert} ${styles.requestError}`}>
              <span>{requestError || pageError}</span>
              {!requestError && (
                <button type="button" className={styles.alertRetry} onClick={reloadCities}>
                  إعادة التحميل
                </button>
              )}
            </div>
          )}

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>تفاصيل الطلب</h2>
            <p className={styles.sectionHint}>الحقل المميز بعلامة * يعتبر إلزامياً لإكمال الطلب.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className={styles.formCol}>
                <div className={styles.formFloating}>
                  <input
                    type="text"
                    id="title"
                    className={`${styles.formControl} ${
                      shouldShowFieldFeedback('title') ? styles.invalid : fieldTouched.title ? styles.valid : ''
                    }`}
                    placeholder=" "
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    onBlur={() => onFieldBlur('title')}
                  />
                  <label htmlFor="title">عنوان الطلب *</label>
                </div>
                {shouldShowFieldFeedback('title') && <div className={styles.invalidFeedback}>{fieldErrors.title}</div>}
              </div>

              <div className={styles.formCol}>
                <div className={styles.formFloating}>
                  <select
                    id="category"
                    className={`${styles.formControl} ${
                      shouldShowFieldFeedback('category') ? styles.invalid : fieldTouched.category ? styles.valid : ''
                    }`}
                    value={selectedCategoryId}
                    data-has-value={selectedCategoryId ? 'true' : 'false'}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value);
                      validateField('category');
                    }}
                    onBlur={() => onFieldBlur('category')}
                  >
                    <option value="">اختر الفئة</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.Id} value={cat.Id}>
                        {cat.ArName}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="category">الفئة *</label>
                </div>
                {shouldShowFieldFeedback('category') && <div className={styles.invalidFeedback}>{fieldErrors.category}</div>}
              </div>
            </div>

            <div className={styles.formFloating}>
              <textarea
                id="description"
                className={`${styles.formControl} ${styles.textareaControl} ${
                  shouldShowFieldFeedback('description') ? styles.invalid : fieldTouched.description ? styles.valid : ''
                }`}
                placeholder=" "
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                onBlur={() => onFieldBlur('description')}
              />
              <label htmlFor="description">وصف الطلب *</label>
            </div>
            {shouldShowFieldFeedback('description') && (
              <div className={styles.invalidFeedback}>{fieldErrors.description}</div>
            )}

            <div className={styles.locationSection}>
              <h3 className={styles.locationTitle}>موقع العقار</h3>
              <div className={styles.formRow}>
                <div className={styles.formCol}>
                  <div className={styles.inputWithAdd}>
                    <div className={styles.formFloating}>
                      <select
                        id="city"
                        className={`${styles.formControl} ${
                          shouldShowFieldFeedback('city') ? styles.invalid : fieldTouched.city ? styles.valid : ''
                        }`}
                        value={selectedCityId}
                        data-has-value={selectedCityId ? 'true' : 'false'}
                        onChange={onCityChange}
                        onBlur={() => onFieldBlur('city')}
                        disabled={citiesLoading}
                      >
                        <option value="">المدينة</option>
                        {cities.map((city) => (
                          <option key={city.Id} value={city.Id}>
                            {city.ArName}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="city">المدينة *</label>
                    </div>
                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={() => setShowAddCityModal(true)}
                      aria-label="إضافة مدينة جديدة"
                      disabled={citiesLoading}
                    >
                      +
                      <span className={styles.addButtonTooltip}>إضافة مدينة جديدة</span>
                    </button>
                  </div>
                  {shouldShowFieldFeedback('city') && <div className={styles.invalidFeedback}>{fieldErrors.city}</div>}
                </div>

                <div className={styles.formCol}>
                  <div className={styles.inputWithAdd}>
                    <div className={styles.formFloating}>
                      <select
                        id="district"
                        className={styles.formControl}
                        value={selectedDistrictName}
                        data-has-value={selectedDistrictName ? 'true' : 'false'}
                        onChange={(e) => setSelectedDistrictName(e.target.value)}
                        disabled={!selectedCityId}
                      >
                        <option value="">الحي</option>
                        {districts.map((district) => (
                          <option key={district.Id} value={district.ArName}>
                            {district.ArName}
                          </option>
                        ))}
                        {showCustomDistrictOption && (
                          <option value={selectedDistrictName}>{selectedDistrictName}</option>
                        )}
                      </select>
                      <label htmlFor="district">الحي (اختياري)</label>
                    </div>
                    <button
                      type="button"
                      className={styles.addButton}
                      onClick={() => {
                        if (!selectedCityId) {
                          showToast('يرجى اختيار المدينة أولاً', 'error');
                          return;
                        }
                        setNewDistrict((prev) => ({ ...prev, CityId: selectedCityId }));
                        setShowAddDistrictModal(true);
                      }}
                      aria-label="إضافة حي جديد"
                      disabled={!selectedCityId}
                    >
                      +
                      <span className={styles.addButtonTooltip}>إضافة حي جديد</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.stepNavigation}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={!isFormValid || isSubmitting || requestLoading}
              >
                {isSubmitting && <span className={styles.spinner} />}
                {buttonLabel}
              </button>
            </div>
          </form>

          {requestLoading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingSpinner} />
            </div>
          )}
        </div>
      </div>

      {showAddCityModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddCityModal(false)}>
          <div
            className={styles.modal}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>إضافة مدينة جديدة</h5>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowAddCityModal(false)}
                aria-label="إغلاق النافذة"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.formLabel} htmlFor="newCityName">
                اسم المدينة <span className={styles.required}>*</span>
              </label>
              <input
                id="newCityName"
                className={styles.modalInput}
                type="text"
                value={newCity.ArName}
                onChange={(e) => setNewCity((prev) => ({ ...prev, ArName: e.target.value }))}
                placeholder="أدخل اسم المدينة"
              />
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setShowAddCityModal(false)}>
                إلغاء
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleAddCity}
                disabled={isAddingCity || !newCity.ArName.trim()}
              >
                {isAddingCity ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddDistrictModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddDistrictModal(false)}>
          <div
            className={styles.modal}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>إضافة حي جديد</h5>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setShowAddDistrictModal(false)}
                aria-label="إغلاق النافذة"
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.formLabel} htmlFor="newDistrictName">
                اسم الحي <span className={styles.required}>*</span>
              </label>
              <input
                id="newDistrictName"
                className={styles.modalInput}
                type="text"
                value={newDistrict.ArName}
                onChange={(e) => setNewDistrict((prev) => ({ ...prev, ArName: e.target.value }))}
                placeholder="أدخل اسم الحي"
              />
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={() => setShowAddDistrictModal(false)}>
                إلغاء
              </button>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleAddDistrict}
                disabled={isAddingDistrict || !newDistrict.ArName.trim()}
              >
                {isAddingDistrict ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

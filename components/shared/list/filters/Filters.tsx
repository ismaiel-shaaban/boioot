'use client';

import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { usePathname } from 'next/navigation';
import { projectsService } from '@/lib/services/projects';
import { unitTypesService, PropertyType } from '@/lib/services/unit-types';
import { showToast } from '@/lib/utils/toast';
import styles from './Filters.module.css';

export interface City {
  Id: string;
  ArName: string;
  EnName?: string;
  Description?: string;
  CountryId?: string;
}

export interface District {
  Id: string;
  ArName: string;
  CityId?: string;
}

export interface Feature {
  Id: string;
  Name: string;
}

export interface FilterOptions {
  city?: string | null;
  district?: string;
  rooms?: string | null;
  halls?: string | null;
  audience?: string | null;
  contractDuration?: string | null;
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  bathrooms?: string | null;
  floor?: string | null;
  unitType?: string | null;
  services?: string | null;
  adAge?: string | null;
}

interface FiltersProps {
  parentComponentId: string;
  onFiltersChanged: (filters: FilterOptions) => void;
  externalUnitType?: string | null; // Sync with navbar filter
}

function Filters({ parentComponentId, onFiltersChanged, externalUnitType }: FiltersProps) {
  const pathname = usePathname();
  const [hasChanges, setHasChanges] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    unitType: null,
    city: null,
    halls: null,
    adAge: null,
    rooms: null,
    bathrooms: null,
    audience: null,
    contractDuration: null,
    services: null,
  });
  const isInitialLoadRef = useRef(true);
  const previousExternalUnitTypeRef = useRef<string | null | undefined>(undefined);

  const contractDurations = [
    { label: 'شهري', value: '1' },
    { label: 'سنوي', value: '3' },
  ];
  const categories = [
    { id: '0', label: 'عوائل' },
    { id: '1', label: 'عزاب' },
    { id: '2', label: 'الكل' },
  ];
  const propertyAgeOptions = [
    { id: '0', label: 'جديد' },
    { id: '1', label: '1-5 سنوات' },
    { id: '2', label: '6-10 سنوات' },
    { id: '3', label: 'أكثر من 10 سنوات' },
  ];

  const [propertyTypes, setPropertyTypes] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingPropertyTypes, setIsLoadingPropertyTypes] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    unitType: false,
    city: false,
    direction: false,
    district: false,
    rooms: true,
    halls: true,
    audience: true,
    contractDuration: true,
    price: true,
    bathrooms: true,
    floor: false,
    services: true,
    adAge: false,
  });

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [priceValidationError, setPriceValidationError] = useState('');
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [newCity, setNewCity] = useState({
    ArName: '',
    EnName: '',
    Description: '',
    CountryId: '50b033f3-6652-4ae0-a248-ac7aeb28fed1',
  });
  const lastEmittedFiltersRef = useRef<string>('');

  useEffect(() => {
    loadPropertyTypes();
    loadCities();
    getFeatures();
  }, []);

  // Sync with external unitType from navbar
  useEffect(() => {
    if (externalUnitType !== undefined && externalUnitType !== previousExternalUnitTypeRef.current) {
      previousExternalUnitTypeRef.current = externalUnitType;
      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters };
        if (externalUnitType === null) {
          delete newFilters.unitType;
        } else {
          newFilters.unitType = externalUnitType;
        }
        return newFilters;
      });
      // Don't emit here - let the user apply filters manually
      setHasChanges(true);
      saveFilters();
    }
  }, [externalUnitType]);

  useEffect(() => {
    // Load saved filters after cities are loaded
    if (cities.length > 0) {
      loadSavedFilters();
    }
  }, [cities]);

  useEffect(() => {
    // Detect route changes
    const currentPath = pathname?.split('?')[0] || '';
    const savedPath = localStorage.getItem(`filter_path_${parentComponentId}`);
    if (savedPath && savedPath !== currentPath) {
      resetFiltersWithoutEmitting();
    }
    localStorage.setItem(`filter_path_${parentComponentId}`, currentPath);
  }, [pathname, parentComponentId]);

  const loadPropertyTypes = async () => {
    setIsLoadingPropertyTypes(true);
    try {
      const propertyTypesData = await unitTypesService.getPropertyTypes();
      setPropertyTypes(
        propertyTypesData.map((pt) => ({
          value: pt.value.toString(),
          label: pt.label,
        }))
      );
    } catch (error) {
      console.error('Error loading property types:', error);
    } finally {
      setIsLoadingPropertyTypes(false);
    }
  };

  const loadCities = async () => {
    try {
      const response = await projectsService.getCities();
      let citiesData: City[] = [];
      
      if (Array.isArray(response)) {
        citiesData = response as City[];
      } else if (response?.IsSuccess && Array.isArray(response.Data)) {
        citiesData = response.Data as City[];
      } else if (response?.Data && Array.isArray(response.Data)) {
        citiesData = response.Data as City[];
      }
      
      if (citiesData.length > 0) {
        setCities(citiesData);

        // If we have a saved city, load its districts
        if (filters.city) {
          const savedCity = citiesData.find((city: City) => city.ArName === filters.city);
          if (savedCity) {
            loadDistrictsForCity(savedCity.Id);
          }
        }
      }
    } catch (error) {
      showToast('فشل في تحميل المدن', 'error');
    }
  };

  const getFeatures = async () => {
    try {
      const response = await projectsService.getFeaturesUnits();
      if (response?.IsSuccess) {
        setFeatures((response.Data || []) as Feature[]);
      } else {
        showToast(response?.Error || 'فشل في جلب المميزات', 'error');
      }
    } catch (error) {
      showToast('فشل في جلب المميزات', 'error');
    }
  };

  const loadDistrictsForCity = async (cityId: string) => {
    if (cityId) {
      try {
        const response = await projectsService.getDistrictsByCity(cityId);
        if (Array.isArray(response)) {
          setDistricts(response as District[]);
        } else if (response?.IsSuccess) {
          setDistricts((response.Data || []) as District[]);
        }
      } catch (error) {
        showToast('فشل في تحميل المناطق', 'error');
      }
    }
  };

  const loadSavedFilters = async () => {
    const storageKey = `filters_${parentComponentId || 'default'}`;
    const savedFilters = localStorage.getItem(storageKey);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFilters(parsed);
        if (parsed.city) {
          const savedCity = cities.find((c: City) => c.ArName === parsed.city);
          if (savedCity) {
            await loadDistrictsForCity(savedCity.Id);
          }
        }
        // Emit filters after loading to apply them (like Angular)
        // Only emit on initial load, and only once
        if (isInitialLoadRef.current && lastEmittedFiltersRef.current === '') {
          isInitialLoadRef.current = false;
          setTimeout(() => {
            emitFilters();
          }, 100);
        }
      } catch (error) {
        console.error('Error parsing saved filters:', error);
        // Still emit empty filters if parsing fails
        if (isInitialLoadRef.current && lastEmittedFiltersRef.current === '') {
          isInitialLoadRef.current = false;
          setTimeout(() => {
            emitFilters();
          }, 100);
        }
      }
    } else {
      // If no saved filters, emit empty filters on initial load only once
      if (isInitialLoadRef.current && lastEmittedFiltersRef.current === '') {
        isInitialLoadRef.current = false;
        setTimeout(() => {
          emitFilters();
        }, 100);
      }
    }
  };

  const saveFilters = () => {
    const storageKey = `filters_${parentComponentId || 'default'}`;
    localStorage.setItem(storageKey, JSON.stringify(filters));
  };

  const resetFiltersWithoutEmitting = () => {
    setFilters({
      unitType: null,
      city: null,
      halls: null,
      adAge: null,
      rooms: null,
      bathrooms: null,
      audience: null,
      contractDuration: null,
      services: null,
      minPrice: null,
      maxPrice: null,
      floor: null,
    });
    setDistricts([]);
    setHasChanges(false);
    lastEmittedFiltersRef.current = '';
    saveFilters();
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const markAsChanged = () => {
    setHasChanges(true);
    saveFilters();
  };

  const setAdAge = (age: string | null) => {
    const newFilters = { ...filters };
    if (age === null) {
      newFilters.adAge = null;
    } else {
      newFilters.adAge = newFilters.adAge === age ? '0' : age;
    }
    setFilters(newFilters);
    markAsChanged();
  };

  const setCity = async (cityId: string | null) => {
    const newFilters = { ...filters };
    if (cityId === null) {
      newFilters.city = null;
    } else {
      const city = cities.find((c: City) => c.Id === cityId);
      if (city) {
        newFilters.city = city.ArName;
      }
    }
    newFilters.district = '';
    setDistricts([]);
    setFilters(newFilters);

    if (newFilters.city && cityId) {
      await loadDistrictsForCity(cityId);
    }
    markAsChanged();
  };

  const setDistrict = (districtName: string) => {
    const newFilters = { ...filters };
    newFilters.district = newFilters.district === districtName ? '' : districtName;
    setFilters(newFilters);
    markAsChanged();
  };

  const setunitType = (unitType: string | null) => {
    const newFilters = { ...filters };
    if (unitType === null) {
      newFilters.unitType = null;
    } else {
      newFilters.unitType = newFilters.unitType === unitType ? '0' : unitType;
    }
    setFilters(newFilters);
    markAsChanged();
  };

  const setRooms = (rooms: number | null) => {
    const newFilters = { ...filters };
    if (rooms === null) {
      newFilters.rooms = null;
    } else {
      newFilters.rooms = newFilters.rooms === rooms.toString() ? '0' : rooms.toString();
    }
    setFilters(newFilters);
    markAsChanged();
  };

  const setAudience = (audience: string | null) => {
    const newFilters = { ...filters };
    if (audience === null) {
      newFilters.audience = null;
    } else {
      newFilters.audience = newFilters.audience === audience ? '0' : audience;
    }
    setFilters(newFilters);
    markAsChanged();
  };

  const setContractDuration = (duration: string | null) => {
    const newFilters = { ...filters };
    if (duration === null) {
      newFilters.contractDuration = null;
    } else {
      newFilters.contractDuration = newFilters.contractDuration === duration ? '0' : duration;
    }
    setFilters(newFilters);
    markAsChanged();
  };

  const setBathrooms = (bathrooms: number | null) => {
    const newFilters = { ...filters };
    if (bathrooms === null) {
      newFilters.bathrooms = null;
    } else {
      newFilters.bathrooms = newFilters.bathrooms === bathrooms.toString() ? '0' : bathrooms.toString();
    }
    setFilters(newFilters);
    markAsChanged();
  };

  const setHall = (hall: number | null) => {
    const newFilters = { ...filters };
    if (hall === null) {
      newFilters.halls = null;
    } else {
      newFilters.halls = newFilters.halls === hall.toString() ? '0' : hall.toString();
    }
    setFilters(newFilters);
    markAsChanged();
  };

  const toggleService = (service: Feature | { Id: string | null }) => {
    const newFilters = { ...filters };
    const serviceId = service.Id;
    
    if (serviceId === null) {
      newFilters.services = null;
      setFilters(newFilters);
      markAsChanged();
      return;
    }
    
    if (!newFilters.services) {
      newFilters.services = '';
    }

    const servicesArray = newFilters.services ? newFilters.services.split(',') : [];
    const serviceIndex = servicesArray.indexOf(serviceId);

    if (serviceIndex > -1) {
      servicesArray.splice(serviceIndex, 1);
    } else {
      servicesArray.push(serviceId);
    }

    newFilters.services = servicesArray.join(',');
    setFilters(newFilters);
    markAsChanged();
  };

  const isServiceSelected = (serviceId: string | null): boolean => {
    if (serviceId === null) {
      return filters.services === null;
    }
    if (!filters.services) {
      return false;
    }
    const servicesArray = filters.services.split(',');
    return servicesArray.includes(serviceId);
  };

  const validatePrices = () => {
    setPriceValidationError('');
    if (filters.minPrice && filters.maxPrice) {
      const minPriceNum = typeof filters.minPrice === 'string' ? parseFloat(filters.minPrice) : filters.minPrice;
      const maxPriceNum = typeof filters.maxPrice === 'string' ? parseFloat(filters.maxPrice) : filters.maxPrice;
      if (minPriceNum && maxPriceNum && maxPriceNum <= minPriceNum) {
        setPriceValidationError('السعر الأعلى يجب أن يكون أكبر من السعر الأدنى');
        const newFilters = { ...filters };
        newFilters.maxPrice = (minPriceNum + 1).toString();
        setFilters(newFilters);
      }
    }
  };

  const onMinPriceChange = (value: string) => {
    const newFilters = { ...filters };
    newFilters.minPrice = value ? parseFloat(value) : null;
    setFilters(newFilters);
    validatePrices();
    markAsChanged();
  };

  const onMaxPriceChange = (value: string) => {
    const newFilters = { ...filters };
    newFilters.maxPrice = value ? parseFloat(value) : null;
    setFilters(newFilters);
    validatePrices();
    markAsChanged();
  };

  const onFloorChange = (value: string) => {
    const newFilters = { ...filters };
    newFilters.floor = value ? value : null;
    setFilters(newFilters);
    markAsChanged();
  };

  const getMinPriceForMax = (): number => {
    if (!filters.minPrice) return 1;
    const minPriceNum = typeof filters.minPrice === 'string' ? parseFloat(filters.minPrice) : filters.minPrice;
    return minPriceNum ? minPriceNum + 1 : 1;
  };

  const validateEnglishNumber = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const englishNumberRegex = /[0-9.]/;
    if (!englishNumberRegex.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const normalizeValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    return `${value}`;
  };

  const emitFilters = useCallback(() => {
    const filtersToEmit = { ...filters };
    // Convert minPrice, maxPrice, floor to strings like Angular
    filtersToEmit.minPrice = filtersToEmit.minPrice !== null ? filtersToEmit.minPrice + "" : null;
    filtersToEmit.maxPrice = filtersToEmit.maxPrice !== null ? filtersToEmit.maxPrice + "" : null;
    filtersToEmit.floor = filtersToEmit.floor !== null ? filtersToEmit.floor + "" : null;

    // Remove empty/null/undefined/0 values like Angular
    Object.keys(filtersToEmit).forEach((key) => {
      const value = filtersToEmit[key as keyof FilterOptions];
      if (
        value === 'undefined' ||
        value === undefined ||
        value === null ||
        value === '' ||
        value === '0'
      ) {
        delete filtersToEmit[key as keyof FilterOptions];
      }
    });

    const serialized = JSON.stringify(filtersToEmit);
    if (lastEmittedFiltersRef.current === serialized) {
      return;
    }
    lastEmittedFiltersRef.current = serialized;
    onFiltersChanged(filtersToEmit);
  }, [filters, onFiltersChanged]);

  const applyFilters = useCallback(() => {
    setHasChanges(false);
    saveFilters();
    emitFilters(); // This emits when user clicks apply button
  }, [emitFilters]);

  const clearFilters = () => {
    // Reset filters like Angular: set to { services: '' } then emit
    setFilters({
      unitType: null,
      city: null,
      halls: null,
      adAge: null,
      rooms: null,
      bathrooms: null,
      audience: null,
      contractDuration: null,
      services: '',
      minPrice: null,
      maxPrice: null,
      floor: null,
      district: '',
    });
    setDistricts([]);
    setHasChanges(false);
    
    // Clear saved filters from localStorage
    const storageKey = `filters_${parentComponentId || 'default'}`;
    localStorage.removeItem(storageKey);
    
    // Emit empty filters
    lastEmittedFiltersRef.current = '';
    onFiltersChanged({});
  };

  const openAddCityModal = () => {
    setNewCity({
      ArName: '',
      EnName: '',
      Description: '',
      CountryId: '50b033f3-6652-4ae0-a248-ac7aeb28fed1',
    });
    setShowAddCityModal(true);
  };

  const closeAddCityModal = () => {
    setShowAddCityModal(false);
    setNewCity({
      ArName: '',
      EnName: '',
      Description: '',
      CountryId: '50b033f3-6652-4ae0-a248-ac7aeb28fed1',
    });
  };

  const addNewCity = async () => {
    if (!newCity.ArName) {
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
      const response = await projectsService.addNewCity(cityData);
      if (response && (response.IsSuccess !== false)) {
        showToast('تم إضافة المدينة بنجاح', 'success');

        const newCityItem: City = {
          Id: (response as any)?.Id || (response as any)?.id || '',
          ArName: newCity.ArName,
          EnName: newCity.ArName,
          Description: newCity.Description,
          CountryId: newCity.CountryId,
        };

        setCities([...cities, newCityItem]);
        closeAddCityModal();
      } else {
        showToast((response as any)?.Error || 'فشل في إضافة المدينة', 'error');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'فشل في إضافة المدينة';
      showToast(errorMessage, 'error');
    } finally {
      setIsAddingCity(false);
    }
  };

  return (
    <div className={styles.filtersContainer} aria-label="خيارات الفلاتر">
      <div className={styles.filterHeader}>
        <h6>فلتر بحث</h6>
      </div>

      {/* Ad Section */}
      <div className={styles.filterSection} aria-label="قسم العقار">
        <div className={styles.sectionHeader} onClick={() => toggleSection('unitType')}>
          <span>قسم العقار</span>
          <button className={styles.scrollBtn}>
            <i className={`fas fa-arrow-down ${!expandedSections.unitType ? styles.collapsed : ''}`}></i>
          </button>
        </div>
        {expandedSections.unitType && (
          <div className={styles.sectionContent}>
            <div className={styles.adSectionOptions}>
              <button
                className={`${styles.propertyTypeBtn} ${filters.unitType === null ? styles.active : ''}`}
                onClick={() => setunitType(null)}
              >
                الكل
              </button>
              {propertyTypes.map((type) => (
                <button
                  key={type.value}
                  className={`${styles.propertyTypeBtn} ${filters.unitType === type.value ? styles.active : ''}`}
                  onClick={() => setunitType(type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* City */}
      <div className={styles.filterSection} aria-label="المدينة">
        <div className={styles.sectionHeader} onClick={() => toggleSection('city')}>
          <span>المدينة</span>
          <button className={styles.scrollBtn}>
            <i className={`fas fa-arrow-down ${!expandedSections.city ? styles.collapsed : ''}`}></i>
          </button>
        </div>
        {expandedSections.city && (
          <div className={styles.sectionContent}>
            <div className={styles.cityOptions}>
              <button
                className={`${styles.cityBtn} ${filters.city === null ? styles.active : ''}`}
                onClick={() => setCity(null)}
              >
                الكل
              </button>
              {cities.map((city: City) => (
                <button
                  key={city.Id}
                  className={`${styles.cityBtn} ${filters.city === city.ArName ? styles.active : ''}`}
                  onClick={() => setCity(city.Id)}
                >
                  {city.ArName}
                </button>
              ))}
              <button
                type="button"
                className={styles.addCityBtn}
                onClick={openAddCityModal}
                title="إضافة مدينة جديدة"
                aria-label="إضافة مدينة جديدة"
              >
                <i className="fa-solid fa-plus"></i>
                إضافة مدينة
              </button>
            </div>
          </div>
        )}
      </div>

      {/* District */}
      <div className={styles.filterSection}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('district')}>
          <span>الحي</span>
          <button className={styles.scrollBtn}>
            <i className={`fas fa-arrow-down ${!expandedSections.district ? styles.collapsed : ''}`}></i>
          </button>
        </div>
        {expandedSections.district && (
          <div className={styles.sectionContent}>
            <div className={styles.districtOptions}>
              {!filters.city && <div className={styles.disabledMessage}>يرجى اختيار المدينة أولاً</div>}
              {districts.map((district: District) => (
                <button
                  key={district.Id}
                  className={`${styles.districtBtn} ${filters.district === district.ArName ? styles.active : ''}`}
                  onClick={() => setDistrict(district.ArName)}
                  disabled={!filters.city}
                >
                  {district.ArName}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rooms */}
      <div className={styles.filterSection}>
        <div className={styles.sectionHeader}>
          <span>عدد الغرف</span>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.numberOptions}>
            <button
              style={{ fontSize: '12px' }}
              className={`${styles.numberBtn} ${filters.rooms === null ? styles.active : ''}`}
              onClick={() => setRooms(null)}
            >
              الكل
            </button>
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                className={`${styles.numberBtn} ${filters.rooms === num.toString() ? styles.active : ''}`}
                onClick={() => setRooms(num)}
              >
                {num}
              </button>
            ))}
            <button
              className={`${styles.numberBtn} ${filters.rooms === '5' ? styles.active : ''}`}
              onClick={() => setRooms(5)}
            >
              +5
            </button>
          </div>
        </div>
      </div>

      {/* Audience */}
      <div className={styles.filterSection}>
        <div className={styles.sectionHeader}>
          <span>الفئة</span>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.categoryOptions}>
            <button
              className={`${styles.categoryBtn} ${filters.audience === null ? styles.active : ''}`}
              onClick={() => setAudience(null)}
            >
              الكل
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryBtn} ${filters.audience === category.id ? styles.active : ''}`}
                onClick={() => setAudience(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contract Duration */}
      <div className={styles.filterSection}>
        <div className={styles.sectionHeader}>
          <span>مدة العقد</span>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.durationOptions}>
            <button
              className={`${styles.durationBtn} ${filters.contractDuration === null ? styles.active : ''}`}
              onClick={() => setContractDuration(null)}
            >
              الكل
            </button>
            {contractDurations.map((duration) => (
              <button
                key={duration.value}
                className={`${styles.durationBtn} ${filters.contractDuration === duration.value ? styles.active : ''}`}
                onClick={() => setContractDuration(duration.value)}
              >
                {duration.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Price Range */}
      <div className={styles.filterSection}>
        <div className={styles.sectionHeader}>
          <span>السعر</span>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.priceRange}>
            <div className={styles.priceInput}>
              <span>السعر الأدنى</span>
              <div className={styles.inputWithCurrency}>
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => onMinPriceChange(e.target.value)}
                  onKeyDown={validateEnglishNumber}
                  min="0"
                />
                <span className={styles.currency}>ليرة</span>
              </div>
              {priceValidationError && priceValidationError.includes('أدنى') && (
                <div className={styles.priceError}>{priceValidationError}</div>
              )}
            </div>
            <div className={styles.priceInput}>
              <span>السعر الأعلى</span>
              <div className={styles.inputWithCurrency}>
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => onMaxPriceChange(e.target.value)}
                  onKeyDown={validateEnglishNumber}
                  min={getMinPriceForMax()}
                />
                <span className={styles.currency}>ليرة</span>
              </div>
              {priceValidationError && priceValidationError.includes('أعلى') && (
                <div className={styles.priceError}>{priceValidationError}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bathrooms */}
      <div className={styles.filterSection}>
        <div className={styles.sectionHeader}>
          <span>عدد الصالات</span>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.numberOptions}>
            <button
              style={{ fontSize: '12px' }}
              className={`${styles.numberBtn} ${filters.halls === null ? styles.active : ''}`}
              onClick={() => setHall(null)}
            >
              الكل
            </button>
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                className={`${styles.numberBtn} ${filters.halls === num.toString() ? styles.active : ''}`}
                onClick={() => setHall(num)}
              >
                {num}
              </button>
            ))}
            <button
              className={`${styles.numberBtn} ${filters.halls === '5' ? styles.active : ''}`}
              onClick={() => setHall(5)}
            >
              +5
            </button>
          </div>
        </div>
      </div>

      {/* Water Cycles */}
      <div className={styles.filterSection}>
        <div className={styles.sectionHeader}>
          <span>عدد دورات المياه</span>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.numberOptions}>
            <button
              style={{ fontSize: '12px' }}
              className={`${styles.numberBtn} ${filters.bathrooms === null ? styles.active : ''}`}
              onClick={() => setBathrooms(null)}
            >
              الكل
            </button>
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                className={`${styles.numberBtn} ${filters.bathrooms === num.toString() ? styles.active : ''}`}
                onClick={() => setBathrooms(num)}
              >
                {num}
              </button>
            ))}
            <button
              className={`${styles.numberBtn} ${filters.bathrooms === '5' ? styles.active : ''}`}
              onClick={() => setBathrooms(5)}
            >
              +5
            </button>
          </div>
        </div>
      </div>

      {/* Floor */}
      <div className={styles.filterSection}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('floor')}>
          <span>الدور</span>
          <button className={styles.scrollBtn}>
            <i className={`fas fa-arrow-down ${!expandedSections.floor ? styles.collapsed : ''}`}></i>
          </button>
        </div>
        {expandedSections.floor && (
          <div className={styles.sectionContent}>
            <div className={styles.floorInput}>
              <span>رقم الدور</span>
              <div className={styles.inputWithCurrency}>
                <input
                  type="number"
                  value={filters.floor || ''}
                  onChange={(e) => onFloorChange(e.target.value)}
                  onKeyDown={validateEnglishNumber}
                  min="1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ad Age */}
      <div className={styles.filterSection}>
        <div className={styles.sectionHeader} onClick={() => toggleSection('adAge')}>
          <span>عمر العقار</span>
          <button className={styles.scrollBtn}>
            <i className={`fas fa-arrow-down ${!expandedSections.adAge ? styles.collapsed : ''}`}></i>
          </button>
        </div>
        {expandedSections.adAge && (
          <div className={styles.sectionContent}>
            <div className={styles.categoryOptions}>
              <button
                className={`${styles.categoryBtn} ${filters.adAge === null ? styles.active : ''}`}
                onClick={() => setAdAge(null)}
              >
                الكل
              </button>
              {propertyAgeOptions.map((age) => (
                <button
                  key={age.id}
                  className={`${styles.categoryBtn} ${filters.adAge === age.id ? styles.active : ''}`}
                  onClick={() => setAdAge(age.id)}
                >
                  {age.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Services */}
      <div className={styles.filterSection}>
        <div className={styles.sectionHeader}>
          <span>الخدمات</span>
        </div>
        <div className={styles.sectionContent}>
          <div className={styles.servicesGrid}>
            <button
              className={`${styles.serviceBtn} ${isServiceSelected(null) ? styles.active : ''}`}
              onClick={() => toggleService({ Id: null })}
            >
              الكل
            </button>
            {features.map((service) => (
              <button
                key={service.Id}
                className={`${styles.serviceBtn} ${isServiceSelected(service.Id) ? styles.active : ''}`}
                onClick={() => toggleService(service)}
              >
                {service.Name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Action Buttons */}
      <div className={styles.filterActions}>
        <button className={styles.clearBtn} onClick={clearFilters} aria-label="إعادة تعيين الفلاتر">
          <i className="fa-solid fa-refresh"></i>
          إعادة تعيين
        </button>
        <button
          className={`${styles.applyBtn} ${hasChanges ? styles.hasChanges : ''}`}
          onClick={applyFilters}
          aria-label="تطبيق الفلاتر"
        >
          <i className="fa-solid fa-check"></i>
          تطبيق الفلاتر
        </button>
      </div>

      {/* Add City Modal */}
      {showAddCityModal && (
        <div className={styles.customModalOverlay} onClick={closeAddCityModal}>
          <div className={styles.customModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>إضافة مدينة جديدة</h5>
              <button type="button" className={styles.btnClose} onClick={closeAddCityModal} aria-label="إغلاق">
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className={styles.modalBody}>
              <form>
                <div className="mb-3">
                  <label htmlFor="newCityArName" className={styles.formLabel}>
                    اسم المدينة <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formControl}
                    id="newCityArName"
                    value={newCity.ArName}
                    onChange={(e) => setNewCity({ ...newCity, ArName: e.target.value })}
                    placeholder="أدخل اسم المدينة"
                  />
                </div>
              </form>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.btnSecondary} onClick={closeAddCityModal}>
                إلغاء
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={addNewCity}
                disabled={isAddingCity || !newCity.ArName}
              >
                {isAddingCity && <span className={`${styles.spinnerBorder} ${styles.spinnerBorderSm} me-1`} role="status"></span>}
                {isAddingCity ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when props don't change
export default memo(Filters, (prevProps, nextProps) => {
  // Only re-render if parentComponentId or externalUnitType changes
  // onFiltersChanged is a function and should be stable (memoized by parent)
  return (
    prevProps.parentComponentId === nextProps.parentComponentId &&
    prevProps.externalUnitType === nextProps.externalUnitType &&
    prevProps.onFiltersChanged === nextProps.onFiltersChanged
  );
});

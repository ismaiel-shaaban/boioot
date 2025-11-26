'use client';

import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { AdvertisementLocation, AdvertisementFormState } from '@/lib/core/models/advertisement.models';
import { specialOrderService } from '@/lib/services/special-order';
import { projectsService } from '@/lib/services/projects';
import { useSpecialOrderState } from '@/lib/contexts/SpecialOrderContext';
import { showToast } from '@/lib/utils/toast';
import { environment } from '@/lib/config/environment';
import styles from '../AddSpecialOrderClient.module.css';

interface Step6Props {
  isSubmitting: boolean;
  advertisementFormState: AdvertisementFormState;
  onStepCompleted: (data: { advertisementData: AdvertisementLocation }) => void;
  onValidationStatusChanged: (data: { isValid: boolean; errors: string[] }) => void;
}

export interface Step6Handle {
  saveStep: () => Promise<{ advertisementData: AdvertisementLocation }>;
  checkIfInputsAreValid: () => boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

const Step6 = forwardRef<Step6Handle, Step6Props>(
  ({ isSubmitting, advertisementFormState, onStepCompleted, onValidationStatusChanged }, ref) => {
    const [locationForm, setLocationForm] = useState<AdvertisementLocation>({
      step: 6,
      id: '',
      city: '',
      district: '',
      latitude: null,
      longitude: null,
    });

    const [selectedCityId, setSelectedCityId] = useState<string>('');
    const [cities, setCities] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [fieldInteractionStates, setFieldInteractionStates] = useState<{ [key: string]: boolean }>({});
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [showAddDistrictModal, setShowAddDistrictModal] = useState(false);
    const [showAddCityModal, setShowAddCityModal] = useState(false);
    const [isAddingDistrict, setIsAddingDistrict] = useState(false);
    const [isAddingCity, setIsAddingCity] = useState(false);
    const [newDistrict, setNewDistrict] = useState({ ArName: '', EnName: '', Description: '', CityId: '' });
    const [newCity, setNewCity] = useState({ ArName: '', EnName: '', Description: '', CountryId: '50b033f3-6652-4ae0-a248-ac7aeb28fed1' });

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const geocoderRef = useRef<any>(null);

    const { specialOrderId: advertisementId } = useSpecialOrderState();

    useEffect(() => {
      updateValidationStatus();
      loadCities();
      loadGoogleMapsScript();
    }, []);

    useEffect(() => {
      if (advertisementFormState?.step6) {
        populateFormWithSavedData(advertisementFormState.step6);
      }
    }, [advertisementFormState?.step6]);

    useEffect(() => {
      if (isMapLoaded && mapRef.current) {
        initializeMap();
      }
    }, [isMapLoaded, locationForm.latitude, locationForm.longitude]);

    const populateFormWithSavedData = (savedData: any) => {
      if (savedData) {
        setLocationForm((prev) => ({
          ...prev,
          ...savedData,
        }));

        if (savedData.city && cities.length > 0) {
          selectCityByName(savedData.city);
        }

        if (savedData.latitude && savedData.longitude) {
          setTimeout(() => {
            if (isMapLoaded) {
              initializeMap();
              addMarker(savedData.latitude, savedData.longitude);
            }
          }, 1000);
        }

        updateValidationStatus();
      }
    };

    const loadCities = async () => {
      try {
        const res = await projectsService.getCities();
        let citiesData: any[] = [];
        
        if (Array.isArray(res)) {
          citiesData = res;
        } else if (res?.IsSuccess && Array.isArray(res.Data)) {
          citiesData = res.Data;
        } else if (res?.Data && Array.isArray(res.Data)) {
          citiesData = res.Data;
        }
        
        setCities(citiesData);

        if (locationForm.city) {
          selectCityByName(locationForm.city);
        }
      } catch (error: any) {
        showToast('فشل في تحميل المدن', 'error');
      }
    };

    const selectCityByName = (cityName: string) => {
      if (!cityName || !cities.length) return;

      const city = cities.find((c) => c.ArName === cityName);
      if (city) {
        setSelectedCityId(city.Id);
        loadDistrictsForCity(city.Id);
        setLocationForm((prev) => ({ ...prev, city: cityName }));
      }
    };

    const loadDistrictsForCity = async (cityId: string) => {
      try {
        const res = await projectsService.getDistrictsByCity(cityId);
        let districtsData: any[] = [];
        
        if (Array.isArray(res)) {
          districtsData = res;
        } else if (res?.IsSuccess && Array.isArray(res.Data)) {
          districtsData = res.Data;
        } else if (res?.Data && Array.isArray(res.Data)) {
          districtsData = res.Data;
        }
        
        setDistricts(districtsData);
      } catch (error: any) {
        showToast('فشل في تحميل المناطق', 'error');
      }
    };

    const onCityChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
      const cityId = event.target.value;
      const city = cities.find((c) => c.Id === cityId);
      if (city) {
        setSelectedCityId(cityId);
        setLocationForm((prev) => ({ ...prev, city: city.ArName, district: '' }));
        await loadDistrictsForCity(cityId);
      }
    };

    const onDistrictChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const districtName = event.target.value;
      setLocationForm((prev) => ({ ...prev, district: districtName }));
      validateField('district');
      updateValidationStatus();
    };

    const loadGoogleMapsScript = () => {
      if (typeof window.google !== 'undefined') {
        setIsMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsMapLoaded(true);
      };
      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!isMapLoaded || typeof window.google === 'undefined' || !mapRef.current) {
        return;
      }

      const hasExistingCoords = locationForm.latitude && locationForm.longitude && locationForm.latitude !== 0 && locationForm.longitude !== 0;

      let initialLat = 33.5138; // Damascus default
      let initialLng = 36.2765; // Damascus default

      if (hasExistingCoords) {
        initialLat = locationForm.latitude || 33.5138;
        initialLng = locationForm.longitude || 36.2765;
      }

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      geocoderRef.current = new window.google.maps.Geocoder();

      if (hasExistingCoords) {
        addMarker(initialLat, initialLng);
      }

      mapInstanceRef.current.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        handleMapClick(lat, lng);
      });
    };

    const addMarker = (lat: number, lng: number) => {
      if (!mapInstanceRef.current || typeof window.google === 'undefined') return;

      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        draggable: true,
        title: 'موقع الطلب الخاص',
      });

      markerRef.current.addListener('dragend', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        handleMapClick(lat, lng);
      });
    };

    const handleMapClick = (lat: number, lng: number) => {
      setLocationForm((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));

      geocodeCoordinates(lat, lng);
      addMarker(lat, lng);
      validateField('latitude');
      validateField('longitude');
      updateValidationStatus();
    };

    const geocodeCoordinates = (lat: number, lng: number) => {
      if (!geocoderRef.current) return;

      geocoderRef.current.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          // Address is available in results[0].formatted_address
        }
      });
    };

    const updateMapLocation = () => {
      if (!locationForm.latitude || !locationForm.longitude) return;

      const lat = parseFloat(locationForm.latitude.toString());
      const lng = parseFloat(locationForm.longitude.toString());

      if (!isNaN(lat) && !isNaN(lng) && mapInstanceRef.current) {
        mapInstanceRef.current.setCenter({ lat, lng });
        addMarker(lat, lng);
        geocodeCoordinates(lat, lng);
        showToast('تم تحديث موقع الخريطة', 'success');
      } else {
        showToast('يرجى إدخال إحداثيات صحيحة', 'error');
      }
    };

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            handleMapClick(lat, lng);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setCenter({ lat, lng });
            }
            showToast('تم تحديد موقعك الحالي', 'success');
          },
          (error) => {
            showToast('فشل في تحديد موقعك الحالي', 'error');
          }
        );
      } else {
        showToast('متصفحك لا يدعم تحديد الموقع', 'error');
      }
    };

    const validateEnglishNumber = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const englishNumberRegex = /[0-9.]/;
      if (!englishNumberRegex.test(event.key)) {
        event.preventDefault();
      }
    };

    const onFieldFocus = (fieldName: string) => {
      setFieldInteractionStates((prev) => ({ ...prev, [fieldName]: false }));
    };

    const onFieldBlur = (fieldName: string) => {
      setFieldInteractionStates((prev) => ({ ...prev, [fieldName]: true }));
      validateField(fieldName);
      updateValidationStatus();
    };

    const shouldShowFieldFeedback = (fieldName: string): boolean => {
      return fieldInteractionStates[fieldName] === true;
    };

    const getFieldError = (fieldName: string): string => {
      return fieldErrors[fieldName] || '';
    };

    const validateField = (fieldName: string) => {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        newErrors[fieldName] = '';

        switch (fieldName) {
          case 'city':
            if (!locationForm.city) {
              newErrors[fieldName] = 'المدينة مطلوبة';
            }
            break;

          case 'district':
            if (!locationForm.district) {
              newErrors[fieldName] = 'الحي مطلوب';
            }
            break;

          case 'latitude':
            if (!locationForm.latitude || locationForm.latitude === 0) {
              newErrors[fieldName] = 'خط الطول مطلوب';
            } else if (locationForm.latitude < 0) {
              newErrors[fieldName] = 'خط الطول لا يمكن أن يكون أقل من 0';
            }
            break;

          case 'longitude':
            if (!locationForm.longitude || locationForm.longitude === 0) {
              newErrors[fieldName] = 'خط العرض مطلوب';
            } else if (locationForm.longitude < 0) {
              newErrors[fieldName] = 'خط العرض لا يمكن أن يكون أقل من 0';
            }
            break;
        }

        return newErrors;
      });
    };

    const updateValidationStatus = () => {
      const isValid = Object.keys(fieldErrors).every((key) => !fieldErrors[key]);
      const errors = Object.values(fieldErrors).filter((error) => error);
      onValidationStatusChanged({ isValid, errors });
    };

    const onLatitudeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setLocationForm((prev) => ({ ...prev, latitude: value ? parseFloat(value) : null }));
      validateField('latitude');
      updateValidationStatus();
    };

    const onLongitudeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setLocationForm((prev) => ({ ...prev, longitude: value ? parseFloat(value) : null }));
      validateField('longitude');
      updateValidationStatus();
    };

    const openAddDistrictModal = () => {
      setShowAddDistrictModal(true);
      setNewDistrict({ ArName: '', EnName: '', Description: '', CityId: selectedCityId });
    };

    const closeAddDistrictModal = () => {
      setShowAddDistrictModal(false);
      setNewDistrict({ ArName: '', EnName: '', Description: '', CityId: '' });
    };

    const addNewDistrict = async () => {
      if (!newDistrict.ArName.trim()) {
        showToast('يجب إدخال اسم الحي', 'error');
        return;
      }

      setIsAddingDistrict(true);
      try {
        const response = await projectsService.addNewDistrict(newDistrict);
        if (response.IsSuccess) {
          showToast('تم إضافة الحي بنجاح', 'success');
          closeAddDistrictModal();
          await loadDistrictsForCity(selectedCityId);
        } else {
          showToast(response.Error || 'فشل في إضافة الحي', 'error');
        }
      } catch (error: any) {
        showToast(error.message || 'فشل في إضافة الحي', 'error');
      } finally {
        setIsAddingDistrict(false);
      }
    };

    const openAddCityModal = () => {
      setShowAddCityModal(true);
    };

    const closeAddCityModal = () => {
      setShowAddCityModal(false);
      setNewCity({ ArName: '', EnName: '', Description: '', CountryId: '50b033f3-6652-4ae0-a248-ac7aeb28fed1' });
    };

    const addNewCity = async () => {
      if (!newCity.ArName.trim()) {
        showToast('يجب إدخال اسم المدينة', 'error');
        return;
      }

      setIsAddingCity(true);
      try {
        const response = await projectsService.addNewCity(newCity);
        if (response.IsSuccess) {
          showToast('تم إضافة المدينة بنجاح', 'success');
          closeAddCityModal();
          await loadCities();
        } else {
          showToast(response.Error || 'فشل في إضافة المدينة', 'error');
        }
      } catch (error: any) {
        showToast(error.message || 'فشل في إضافة المدينة', 'error');
      } finally {
        setIsAddingCity(false);
      }
    };

    const saveStep = async (): Promise<{ advertisementData: AdvertisementLocation }> => {
      ['city', 'district', 'latitude', 'longitude'].forEach((field) => {
        validateField(field);
        setFieldInteractionStates((prev) => ({ ...prev, [field]: true }));
      });

      updateValidationStatus();

      const isValid = Object.keys(fieldErrors).every((key) => !fieldErrors[key]);

      if (!isValid) {
        throw new Error('الرجاء تصحيح الأخطاء قبل المتابعة');
      }

      if (!advertisementId) {
        throw new Error('لم يتم العثور على معرف الطلب الخاص');
      }

      try {
        const response = await specialOrderService.updateAdvertisementLocation({
          Order: {
            Id: advertisementId,
            Step: 6,
            City: locationForm.city,
            District: locationForm.district,
            Latitude: locationForm.latitude,
            Longitude: locationForm.longitude,
          },
        });

        if (response.IsSuccess) {
          showToast('تم حفظ موقع الطلب الخاص بنجاح', 'success');
          const locationData = {
            ...locationForm,
            mapLocation: {
              lat: locationForm.latitude || 0,
              lng: locationForm.longitude || 0,
            },
          };
          onStepCompleted({ advertisementData: locationData });
          return { advertisementData: locationData };
        } else {
          showToast(response.Error || 'فشل في حفظ موقع الطلب الخاص', 'error');
          throw new Error(response.Error || 'فشل في حفظ موقع الطلب الخاص');
        }
      } catch (error: any) {
        showToast(error.message || 'فشل في حفظ موقع الطلب الخاص', 'error');
        throw error;
      }
    };

    const checkIfInputsAreValid = (): boolean => {
      return !!locationForm.city && !!locationForm.district && !!locationForm.latitude && locationForm.latitude !== 0 && !!locationForm.longitude && locationForm.longitude !== 0;
    };

    useImperativeHandle(ref, () => ({
      saveStep,
      checkIfInputsAreValid,
    }));

    return (
      <div className={styles.stepContent}>
        <h3 className="mb-4">موقع الطلب الخاص</h3>

        <div className="row">
          <div className="col-md-6">
            <div className="form-floating mb-4">
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ zIndex: 10 }}>
                  <i className="fa-solid fa-arrow-down"></i>
                </span>
                <select
                  className="form-control"
                  style={{ paddingLeft: '2rem' }}
                  value={selectedCityId}
                  onChange={onCityChange}
                  onFocus={() => onFieldFocus('city')}
                  onBlur={() => onFieldBlur('city')}
                >
                  <option value="">اختر المدينة</option>
                  {cities.map((city) => (
                    <option key={city.Id} value={city.Id}>
                      {city.ArName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary position-absolute top-0 end-0 m-2"
                onClick={openAddCityModal}
                title="إضافة مدينة جديدة"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
              {shouldShowFieldFeedback('city') && (
                <div className="text-danger small mt-1">{getFieldError('city')}</div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-floating mb-4">
              <div className="position-relative">
                <span className="position-absolute top-50 start-0 translate-middle-y ms-3" style={{ zIndex: 10 }}>
                  <i className="fa-solid fa-arrow-down"></i>
                </span>
                <select
                  className="form-control"
                  style={{ paddingLeft: '2rem' }}
                  value={locationForm.district}
                  onChange={onDistrictChange}
                  onFocus={() => onFieldFocus('district')}
                  onBlur={() => onFieldBlur('district')}
                  disabled={!selectedCityId}
                >
                  <option value="">اختر الحي</option>
                  {districts.map((neighborhood) => (
                    <option key={neighborhood.Id} value={neighborhood.ArName}>
                      {neighborhood.ArName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary position-absolute top-0 end-0 m-2"
                onClick={openAddDistrictModal}
                disabled={!selectedCityId}
                title={!selectedCityId ? 'يرجى اختيار المدينة أولاً' : 'إضافة حي/منطقة جديدة'}
              >
                <i className="fa-solid fa-plus"></i>
              </button>
              {shouldShowFieldFeedback('district') && (
                <div className="text-danger small mt-1">{getFieldError('district')}</div>
              )}
            </div>
          </div>
        </div>

        <div className="map-section mb-4">
          <div ref={mapRef} id="google-map" style={{ width: '100%', height: '400px', borderRadius: '12px' }}></div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-floating mb-3">
              <input
                type="number"
                id="latitude"
                className={`form-control ${shouldShowFieldFeedback('latitude') ? 'is-invalid' : ''}`}
                value={locationForm.latitude || ''}
                onChange={onLatitudeChange}
                onBlur={() => onFieldBlur('latitude')}
                onFocus={() => onFieldFocus('latitude')}
                onKeyPress={validateEnglishNumber}
                step="0.000001"
                placeholder="خط الطول"
              />
              <label htmlFor="latitude">خط الطول</label>
              {shouldShowFieldFeedback('latitude') && (
                <div className="text-danger small mt-1">{getFieldError('latitude')}</div>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-floating mb-3">
              <input
                type="number"
                id="longitude"
                className={`form-control ${shouldShowFieldFeedback('longitude') ? 'is-invalid' : ''}`}
                value={locationForm.longitude || ''}
                onChange={onLongitudeChange}
                onBlur={() => onFieldBlur('longitude')}
                onFocus={() => onFieldFocus('longitude')}
                onKeyPress={validateEnglishNumber}
                step="0.000001"
                placeholder="خط العرض"
              />
              <label htmlFor="longitude">خط العرض</label>
              {shouldShowFieldFeedback('longitude') && (
                <div className="text-danger small mt-1">{getFieldError('longitude')}</div>
              )}
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 mb-3">
          <button className="btn btn-secondary" onClick={updateMapLocation}>
            <i className="fa-solid fa-map-marker-alt me-1"></i>
            تحديث الخريطة
          </button>
          <button className="btn btn-info" onClick={getCurrentLocation}>
            <i className="fa-solid fa-location-crosshairs me-1"></i>
            موقعي الحالي
          </button>
        </div>

        {/* Add District Modal */}
        {showAddDistrictModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">إضافة حي/منطقة جديدة</h5>
                  <button type="button" className="btn-close" onClick={closeAddDistrictModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">اسم الحي/المنطقة *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newDistrict.ArName}
                      onChange={(e) => setNewDistrict((prev) => ({ ...prev, ArName: e.target.value }))}
                      placeholder="أدخل اسم الحي أو المنطقة"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeAddDistrictModal}>
                    إلغاء
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={addNewDistrict}
                    disabled={isAddingDistrict || !newDistrict.ArName}
                  >
                    {isAddingDistrict ? 'جاري الإضافة...' : 'إضافة'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add City Modal */}
        {showAddCityModal && (
          <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">إضافة مدينة جديدة</h5>
                  <button type="button" className="btn-close" onClick={closeAddCityModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">اسم المدينة *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newCity.ArName}
                      onChange={(e) => setNewCity((prev) => ({ ...prev, ArName: e.target.value }))}
                      placeholder="أدخل اسم المدينة"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeAddCityModal}>
                    إلغاء
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={addNewCity}
                    disabled={isAddingCity || !newCity.ArName}
                  >
                    {isAddingCity ? 'جاري الإضافة...' : 'إضافة'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

Step6.displayName = 'Step6';

export default Step6;


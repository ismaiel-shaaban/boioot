import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export const projectsService = {
  async getFeaturesProjects() {
    const url = `${environment.realestateApiUrl}/ProjectsFeatures/features/projects`;
    return apiClient.get(url);
  },

  async getFeaturesUnits() {
    const url = `${environment.realestateApiUrl}/ProjectsFeatures/features/units`;
    return apiClient.get(url);
  },

  async addNewFeature(featureData: any) {
    const url = `${environment.realestateApiUrl}/ProjectsFeatures/features/projects`;
    return apiClient.post(url, featureData);
  },

  async addNewUnitFeature(featureData: any) {
    const url = `${environment.realestateApiUrl}/ProjectsFeatures/features/units`;
    return apiClient.post(url, featureData);
  },

  async uploadMedia(projectId: string, mediaFiles: File) {
    const formData = new FormData();
    formData.append('Media.BucketName', projectId);
    formData.append('Media.file', mediaFiles);
    const url = `${environment.realestateApiUrl}/MediaUpload/media/upload`;
    return apiClient.post(url, formData);
  },

  async getProjects(pageNumber: number, pageSize: number, cityId?: string, cityName?: string) {
    const url = `${environment.realestateApiUrl}/RealEstateProject/projects/paginated`;
    const requestBody: any = {
      Pagination: {
        PageNumber: pageNumber,
        PageSize: pageSize,
        SortBy: '',
        IsDescending: true,
        Filters: {},
      },
    };

    // Use city name if provided, otherwise try to use cityId as name
    if (cityName && cityName !== 'all') {
      requestBody.Pagination.Filters.city = cityName;
    } else if (cityId && cityId !== 'all') {
      // If only cityId is provided, use it as the city name
      requestBody.Pagination.Filters.city = cityId;
    }

    return apiClient.post(url, requestBody);
  },

  async getProjectById(projectId: string) {
    const url = `${environment.realestateApiUrl}/RealEstateProject/projects-by-id`;
    return apiClient.post(url, { ProjectId: projectId });
  },

  async likeProject(projectId: string) {
    const url = `${environment.realestateApiUrl}/ProjectsFavorite/favorite/toggle`;
    return apiClient.post(url, { ProjectId: projectId });
  },

  async likeUnit(unitId: string) {
    const url = `${environment.realestateApiUrl}/RealEstateProject/favorite/toggle`;
    return apiClient.post(url, { UnitId: unitId });
  },

  async getUnitById(unitId: string) {
    const url = `${environment.realestateApiUrl}/RealEstateProject/units/${unitId}`;
    return apiClient.get(url);
  },

  async createProjectBasicInfo(projectData: any) {
    const url = `${environment.realestateApiUrl}/ProjectWizard/wizard/project-info`;
    return apiClient.post(url, projectData);
  },

  async updateProjectBasicInfo(projectData: any) {
    const url = `${environment.realestateApiUrl}/ProjectWizard/wizard/project-info`;
    return apiClient.put(url, projectData);
  },

  async updateProjectLocation(locationData: any) {
    const url = `${environment.realestateApiUrl}/ProjectWizard/wizard/project-location`;
    return apiClient.put(url, locationData);
  },

  async updateUnitLocation(locationData: any) {
    const url = `${environment.realestateApiUrl}/Ad/wizard/unit-location`;
    return apiClient.put(url, locationData);
  },

  async updateProjectFeatures(featuresData: any) {
    const url = `${environment.realestateApiUrl}/ProjectWizard/wizard/project-features`;
    return apiClient.put(url, featuresData);
  },

  async updateProjectWarranty(warrantyData: any) {
    const url = `${environment.realestateApiUrl}/ProjectWizard/wizard/project-warranty`;
    return apiClient.put(url, warrantyData);
  },

  async uploadProjectMedia(mediaFiles: any) {
    const url = `${environment.realestateApiUrl}/ProjectWizard/wizard/project-media`;
    return apiClient.put(url, mediaFiles);
  },

  async deleteProject(projectId: string) {
    const url = `${environment.realestateApiUrl}/RealEstateProject/projects/${projectId}`;
    return apiClient.delete(url);
  },

  async createUnitBasicInfo(unitData: any) {
    const url = `${environment.realestateApiUrl}/UnitWizard/wizard/unit-info`;
    return apiClient.post(url, unitData);
  },

  async updateUnitBasicInfo(unitData: any) {
    const url = `${environment.realestateApiUrl}/UnitWizard/wizard/unit-info`;
    return apiClient.put(url, unitData);
  },

  async updateUnitOwnerInfo(ownerData: any) {
    const url = `${environment.realestateApiUrl}/UnitWizard/wizard/unit-owner`;
    return apiClient.put(url, ownerData);
  },

  async updateUnitDepartment(departmentData: any) {
    const url = `${environment.realestateApiUrl}/UnitWizard/wizard/unit-type`;
    return apiClient.put(url, departmentData);
  },

  async updateUnitInformation(unitInfoData: any) {
    const url = `${environment.realestateApiUrl}/UnitWizard/wizard/unit-details`;
    return apiClient.put(url, unitInfoData);
  },

  async saveUnitMedia(unitMediaData: any) {
    const url = `${environment.realestateApiUrl}/UnitWizard/wizard/unit-media`;
    return apiClient.put(url, unitMediaData);
  },

  async updateUnitDetails(detailsData: any) {
    const url = `${environment.realestateApiUrl}/UnitWizard/wizard/unit-info-details`;
    return apiClient.put(url, detailsData);
  },

  async updateUnitAmenities(amenitiesData: any) {
    const url = `${environment.realestateApiUrl}/UnitWizard/wizard/unit-feature`;
    return apiClient.put(url, amenitiesData);
  },

  async getCompanyProfile() {
    const url = `${environment.realestateApiUrl}/RealEstateProject/projects/by-owner`;
    return apiClient.post(url, {});
  },

  async getCompanyProjectsWithPagination(pageNumber: number, pageSize: number) {
    const url = `${environment.realestateApiUrl}/RealEstateProject/projects/by-owner`;
    const requestBody = {
      Pagination: {
        PageNumber: pageNumber,
        PageSize: pageSize,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
    };
    return apiClient.post(url, requestBody);
  },

  async getCompanyProfileById(companyId: string) {
    const url = `${environment.realestateApiUrl}/RealEstateProject/owner-details`;
    return apiClient.post(url, { ownerId: companyId });
  },

  async updateCompanyProfile(companyId: string, profileData: FormData) {
    const url = `${environment.realestateApiUrl}/Owners/${companyId}`;
    return apiClient.put(url, profileData);
  },

  async getCities() {
    const url = `${environment.identityApiUrl}/Cities/all`;
    return apiClient.get(url, { skipAuth: true });
  },

  async getAllDistricts() {
    const url = `${environment.identityApiUrl}/Districts/all`;
    return apiClient.get(url, { skipAuth: true });
  },

  async getDistrictsByCity(cityId: string) {
    const url = `${environment.identityApiUrl}/Districts/by-city/${cityId}`;
    return apiClient.get(url, { skipAuth: true });
  },

  async addNewDistrict(districtData: any) {
    const url = `${environment.identityApiUrl}/Districts`;
    return apiClient.post(url, districtData);
  },

  async addNewCity(cityData: any) {
    const url = `${environment.identityApiUrl}/Cities`;
    return apiClient.post(url, cityData);
  },
};


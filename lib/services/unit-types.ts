import { apiClient, ApiResponse } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export interface UnitType {
  Id: number;
  Name: string;
  CreatedAt: string;
  CreatedBy: string;
}

export interface UnitTypesData {
  Items: UnitType[];
  TotalCount: number;
  PageNumber: number;
  PageSize: number;
  TotalPages: number;
  HasPreviousPage: boolean;
  HasNextPage: boolean;
}

export interface AdType {
  name: string;
  id: string;
  unitType: string | null;
}

export interface PropertyType {
  value: number;
  label: string;
}

const generateIdFromName = (name: string): string => {
  const nameMap: { [key: string]: string } = {
    'شقة للبيع': 'apartments-for-sale',
    'شقة للإيجار': 'apartments-for-rent',
    'منزل للبيع': 'houses-for-sale',
    'منزل للإيجار': 'houses-for-rent',
    'محل للبيع': 'shops-for-sale',
    'محل للإيجار': 'shops-for-rent',
    'عمارة للبيع': 'buildings-for-sale',
    'عمارة للإيجار': 'buildings-for-rent',
    'فيلا للبيع': 'villas-for-sale',
    'فيلا للإيجار': 'villas-for-rent',
    'مزرعة للبيع': 'farms-for-sale',
    'مزرعة للإيجار': 'farms-for-rent',
    'مستودع للبيع': 'warehouses-for-sale',
    'مستودع للإيجار': 'warehouses-for-rent',
    'مكتب للبيع': 'offices-for-sale',
    'مكتب للإيجار': 'offices-for-rent',
    'أرض للبيع': 'lands-for-sale',
  };

  return nameMap[name] || name.toLowerCase().replace(/\s+/g, '-');
};

// Cache for unit types to prevent multiple API calls
let unitTypesCache: ApiResponse<UnitTypesData> | null = null;
let unitTypesPromise: Promise<ApiResponse<UnitTypesData>> | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cacheTimestamp = 0;

export const unitTypesService = {
  async getUnitTypes(forceRefresh = false): Promise<ApiResponse<UnitTypesData>> {
    const now = Date.now();
    
    // Return cached data if still valid and not forcing refresh
    if (!forceRefresh && unitTypesCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return unitTypesCache;
    }

    // If there's already a pending request, return that promise
    if (unitTypesPromise) {
      return unitTypesPromise;
    }

    // Create new request
    const payload = {
      Pagination: {
        PageNumber: 1,
        PageSize: 20,
        SortBy: '',
        IsDescending: true,
        SearchTerm: '',
        Filters: {},
      },
    };

    unitTypesPromise = apiClient.post<UnitTypesData>(`${environment.realestateApiUrl}/UnitTypes/paginated`, payload)
      .then((response) => {
        unitTypesCache = response;
        cacheTimestamp = now;
        unitTypesPromise = null; // Clear promise after completion
        return response;
      })
      .catch((error) => {
        unitTypesPromise = null; // Clear promise on error
        throw error;
      });

    return unitTypesPromise;
  },

  async getAdTypes(): Promise<AdType[]> {
    try {
      const response = await this.getUnitTypes();
      if (!response || !response.IsSuccess || !response.Data?.Items) {
        return [{ name: 'الكل', id: 'all', unitType: null }];
      }

      const adTypes: AdType[] = [{ name: 'الكل', id: 'all', unitType: null }];

      if (response.Data && response.Data.Items) {
        response.Data.Items.forEach((item) => {
          const id = generateIdFromName(item.Name);
          adTypes.push({
            name: item.Name,
            id: id,
            unitType: item.Id.toString(),
          });
        });
      }

      return adTypes;
    } catch (error) {
      console.error('Error loading ad types:', error);
      return [{ name: 'الكل', id: 'all', unitType: null }];
    }
  },

  async getPropertyTypes(): Promise<PropertyType[]> {
    try {
      const response = await this.getUnitTypes();
      if (!response || !response.IsSuccess || !response.Data?.Items) {
        return [];
      }

      if (response.Data && response.Data.Items) {
        return response.Data.Items.map((item) => ({
          value: item.Id,
          label: item.Name,
        }));
      }

      return [];
    } catch (error) {
      console.error('Error loading property types:', error);
      return [];
    }
  },
};


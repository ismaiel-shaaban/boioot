// Helper function to check if we're on localhost (client-side only)
const getIsLocalhost = (): boolean => {
  if (typeof window !== 'undefined') {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );
  }
  return false;
};

export const environment = {
  production: process.env.NODE_ENV === 'production',
  appVersion: 'v8.1.7',
  USERDATA_KEY: 'authf649fc9a5f55',
  isMockEnabled: false,

  googleMapsApiKey: 'AIzaSyAKdfvHs5YyEgwrRqWf2VSPnuJ_LohY404',

  // Base URLs - always use production API URL
  get baseApiUrl() {
    const envUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
    if (envUrl) return envUrl;
    
    // Always use production API URL
    return 'https://boioot.com';
  },

  // Dynamic API URLs - always use production API with path-based format
  get BaseCoreApiUrl() {
    return `${this.baseApiUrl}/baseCore/api/v1`;
  },

  get identityApiUrl() {
    return `${this.baseApiUrl}/identityApi/api/v1`;
  },

  get communityApiUrl() {
    return `${this.baseApiUrl}/communityApi/api/v1`;
  },

  get realestateApiUrl() {
    return `${this.baseApiUrl}/realestateApi/api/v1`;
  },

  get isLocalhost(): boolean {
    return getIsLocalhost();
  },

  get uploadApiUrl() {
    return `${this.baseApiUrl}/baseCore/api/v1`;
  },
};


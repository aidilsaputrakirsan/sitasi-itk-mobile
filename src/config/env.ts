const ENV = {
  development: {
    API_BASE_URL: 'http://10.0.2.2:8000/api/v1', // Android emulator → localhost
    API_BASE_URL_IOS: 'http://127.0.0.1:8000/api/v1',
  },
  production: {
    API_BASE_URL: 'https://sitasi-itk.myst-tech.com/api/v1',
    API_BASE_URL_IOS: 'https://sitasi-itk.myst-tech.com/api/v1',
  },
};

const isDev = __DEV__;

const config = {
  API_BASE_URL: isDev ? ENV.development.API_BASE_URL : ENV.production.API_BASE_URL,
  TOKEN_REFRESH_THRESHOLD_MS: 60 * 60 * 1000, // 1 hour before expiry
  NOTIFICATION_POLL_INTERVAL_MS: 30 * 1000, // 30 seconds
  MAX_PER_PAGE: 100,
  DEFAULT_PER_PAGE: 15,
};

export default config;

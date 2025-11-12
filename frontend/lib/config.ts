import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API Configuration for different environments
export const getApiUrl = (): string => {
  // Read from env or Expo extra
  const extra = (Constants as any).expoConfig?.extra || (Constants as any)?.manifest?.extra || {};
  const API_URL_ENV = process.env.EXPO_PUBLIC_API_URL || extra?.apiUrl;

  // If environment variable or extra is set, use it
  if (API_URL_ENV) {
    return API_URL_ENV;
  }

  // Try to infer LAN IP from Expo host for physical devices
  const hostUri: string | undefined = (Constants as any)?.expoConfig?.hostUri || (Constants as any)?.manifest?.debuggerHost;
  const lanHost = hostUri ? hostUri.split(':')[0] : undefined;
  const isLanIp = !!lanHost && /^\d{1,3}(?:\.\d{1,3}){3}$/.test(lanHost);
  if (isLanIp) {
    return `http://${lanHost}:5000/api`;
  }

  // Default configurations based on platform
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access localhost
    return 'http://10.0.2.2:5000/api';
  } else if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return 'http://localhost:5000/api';
  } else {
    // Web or other platforms
    return 'http://localhost:5000/api';
  }
};

// Base URL without /api
export const getBaseUrl = (): string => {
  return getApiUrl().replace('/api', '');
};

// Network configuration
export const networkConfig = {
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
};

// Development helpers
export const isDevelopment = (): boolean => {
  return process.env.EXPO_PUBLIC_ENVIRONMENT !== 'production';
};

// Debug logging
export const debugLog = (message: string, data?: any): void => {
  if (isDevelopment()) {
    console.log(`[Amazon Group API] ${message}`, data || '');
  }
};

// API endpoints
export const endpoints = {
  // Auth
  login: '/users/login',
  register: '/users/register',
  googleLogin: '/users/oauth/google',
  forgotPassword: '/users/forgot-password',
  resetPassword: '/users/reset-password',
  me: '/users/me',

  // Categories
  categories: '/categories',

  // Services
  services: '/services',

  // Orders
  orders: '/orders',

  // Uploads
  uploadImage: '/uploads/image',
  uploadDocument: '/uploads/document',
  deleteUpload: '/uploads/delete',

  // Health
  health: '/health',
};

// Export configuration object
export const apiConfig = {
  baseUrl: getBaseUrl(),
  apiUrl: getApiUrl(),
  timeout: networkConfig.timeout,
  retries: networkConfig.retries,
  isDevelopment: isDevelopment(),
  endpoints,
};

export default apiConfig;

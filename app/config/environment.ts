/**
 * Environment configuration for the frontend application
 * 
 * This file centralizes all environment-specific configuration,
 * making it easier to deploy to different environments.
 */

// Set the base API URL based on the environment
const getApiUrl = () => {
  // When running in development, use localhost
  if (__DEV__) {
    // Use different URLs based on platform
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api'; // Android emulator needs this special IP
    } else {
      return 'http://localhost:3000/api'; // iOS simulator and web can use localhost
    }
  }
  
  // For production builds, use your actual API domain
  return 'https://api.yourdomain.com/api';
};

// Export configuration object
export const Config = {
  API_URL: getApiUrl(),
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    ONBOARDING_COMPLETED: 'onboarding_completed',
  },
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  PROFILE_PHOTO_SIZE_LIMIT: 5 * 1024 * 1024, // 5MB
};

// Import Platform at the beginning
import { Platform } from 'react-native';

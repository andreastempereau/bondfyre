/**
 * API service for handling network requests
 *
 * This service centralizes all API calls and provides consistent
 * error handling, authentication, and request formatting.
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "../config/environment";
import { EventRegister } from "react-native-event-listeners";

// Event names for global notification
export const API_EVENTS = {
  NETWORK_ERROR: "api:networkError",
  AUTH_ERROR: "api:authError",
  SERVER_ERROR: "api:serverError",
};

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: Config.API_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Simple request interceptor for auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(
          Config.STORAGE_KEYS.AUTH_TOKEN
        );
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        const responseData = error.response?.data as Record<string, any>;

        // Handle authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          // Emit an authentication error event that will be caught by AuthContext
          EventRegister.emit(API_EVENTS.AUTH_ERROR, {
            message: responseData?.message || "Authentication failed",
            status: error.response?.status,
          });
        }

        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }
}

// Export a singleton instance
export const apiService = new ApiService();

// Adding default export to prevent Expo Router warning
export default function ApiServiceModule() {
  return null;
}

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

class ApiService {
  private api: AxiosInstance;

  constructor() {
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: Config.API_URL,
      timeout: Config.DEFAULT_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Set up request interceptor for auth tokens
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

    // Set up response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      this.handleApiError
    );
  }

  /**
   * Handles API errors in a consistent way
   */
  private handleApiError = (error: AxiosError) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject({
        status: 0,
        message: "Network error. Please check your connection.",
      });
    }

    // Handle API errors with response
    const status = error.response.status;
    const data = error.response.data as { message?: string };

    // Authentication errors
    if (status === 401) {
      // Clear stored credentials on auth errors
      this.clearAuthData();
    }

    return Promise.reject({
      status,
      message: data?.message || "An unexpected error occurred",
      data: data || null,
    });
  };

  /**
   * Clears authentication data from storage
   */
  private clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove([
        Config.STORAGE_KEYS.AUTH_TOKEN,
        Config.STORAGE_KEYS.USER_DATA,
      ]);
      // You could emit an event here to notify the app about logout
    } catch (error) {
      console.error(
        "Failed to clear auth data:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  /**
   * Makes a GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  /**
   * Makes a POST request
   */
  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    return response.data;
  }

  /**
   * Makes a PUT request
   */
  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  /**
   * Makes a DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }
}

// Export a singleton instance
export const apiService = new ApiService();

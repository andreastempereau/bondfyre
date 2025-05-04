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
  private retryAttempts: Record<string, number> = {};
  private maxRetries = 2;

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
  private handleApiError = async (error: AxiosError) => {
    // Generate a unique key for this request to track retry attempts
    const requestKey = `${error.config?.method || ""}-${
      error.config?.url || ""
    }`;

    // Handle timeout errors specifically
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      console.error("Request timeout:", error.message);

      // Check if we should retry
      if (
        !this.retryAttempts[requestKey] ||
        this.retryAttempts[requestKey] < this.maxRetries
      ) {
        this.retryAttempts[requestKey] =
          (this.retryAttempts[requestKey] || 0) + 1;

        // Use exponential backoff for retries
        const delay = Math.pow(2, this.retryAttempts[requestKey]) * 500;

        console.log(
          `Retrying request (${this.retryAttempts[requestKey]}/${this.maxRetries}) after ${delay}ms`
        );

        await new Promise((resolve) => setTimeout(resolve, delay));

        // Retry the request
        try {
          if (error.config) {
            return this.api(error.config);
          }
        } catch (retryError) {
          // If retry fails, continue with normal error handling
        }
      }

      // If we've exhausted retries or can't retry, emit a network error event
      EventRegister.emit(API_EVENTS.NETWORK_ERROR, {
        message: "Network request timed out. Please check your connection.",
      });
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);

      // Emit event for global notification
      EventRegister.emit(API_EVENTS.NETWORK_ERROR, {
        message: "Network error. Please check your connection.",
      });

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

      // Emit auth error event
      EventRegister.emit(API_EVENTS.AUTH_ERROR, {
        message: data?.message || "Authentication error",
      });
    }
    // Server errors
    else if (status >= 500) {
      EventRegister.emit(API_EVENTS.SERVER_ERROR, {
        message: data?.message || "Server error. Please try again later.",
      });
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
    try {
      const response: AxiosResponse<T> = await this.api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Makes a POST request
   */
  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Makes a PUT request
   */
  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Makes a DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService, API_EVENTS } from "../services/apiService";
import { Config } from "../config/environment";
import { Alert } from "react-native";
import { router } from "expo-router";
import { EventRegister } from "react-native-event-listeners";

export interface Profile {
  bio?: string;
  age?: number;
  gender?: string;
  interests?: string[];
  photos?: string[];
  phoneNumber?: string;
  username?: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  bio?: string;
  age?: number;
  gender?: string;
  interests?: string[];
  photos?: string[];
  phoneNumber?: string;
  username?: string;
  profile?: Profile; // Keep for backward compatibility
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    profile: Profile
  ) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();

    // Listen for auth errors that might happen in API service
    const authErrorListener = EventRegister.addEventListener(
      API_EVENTS.AUTH_ERROR,
      (data: { message: string }) => {
        console.log("Auth error detected:", data.message);
        // Force sign out and display message
        signOut();
        Alert.alert("Session Expired", data.message || "Please sign in again");
      }
    );

    // Listen for network errors
    const networkErrorListener = EventRegister.addEventListener(
      API_EVENTS.NETWORK_ERROR,
      (data: { message: string }) => {
        console.log("Network error detected:", data.message);
        Alert.alert(
          "Connection Error",
          data.message || "Please check your internet connection"
        );
      }
    );

    // Listen for server errors
    const serverErrorListener = EventRegister.addEventListener(
      API_EVENTS.SERVER_ERROR,
      (data: { message: string }) => {
        console.log("Server error detected:", data.message);
        Alert.alert("Server Error", data.message || "Please try again later");
      }
    );

    return () => {
      // Clean up listeners when component unmounts
      if (typeof authErrorListener === "string") {
        EventRegister.removeEventListener(authErrorListener);
      }
      if (typeof networkErrorListener === "string") {
        EventRegister.removeEventListener(networkErrorListener);
      }
      if (typeof serverErrorListener === "string") {
        EventRegister.removeEventListener(serverErrorListener);
      }
    };
  }, []);

  // Add effect to navigate based on auth state
  useEffect(() => {
    if (!loading) {
      try {
        if (token && user) {
          // User is authenticated, navigate to main app if not already there
          router.replace("/(tabs)");
        } else {
          // User is not authenticated
          router.replace("/auth");
        }
      } catch (error) {
        console.error("Navigation error:", error);
        // Fallback to authentication screen if navigation fails
        router.replace("/auth");
      }
    }
  }, [token, user, loading]);

  const loadStoredData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(
        Config.STORAGE_KEYS.AUTH_TOKEN
      );
      const storedUser = await AsyncStorage.getItem(
        Config.STORAGE_KEYS.USER_DATA
      );

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          console.log("Auth state loaded from storage:", !!storedToken);
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          // Clear invalid data
          await AsyncStorage.removeItem(Config.STORAGE_KEYS.AUTH_TOKEN);
          await AsyncStorage.removeItem(Config.STORAGE_KEYS.USER_DATA);
        }
      }
    } catch (error) {
      console.error("Error loading stored data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAuthData = async (authToken: string, userData: User) => {
    try {
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, authToken);
      await AsyncStorage.setItem(
        Config.STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData)
      );

      setToken(authToken);
      setUser(userData);
      console.log("Auth data saved successfully");
    } catch (error) {
      console.error("Failed to save auth data:", error);
      Alert.alert("Error", "Failed to save login information");
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with email:", email);
      const response = await apiService.post<{ token: string; user: User }>(
        "/auth/login",
        { email, password }
      );

      console.log("Sign in successful, saving auth data");

      // Normalize the user data structure
      const normalizedUser = normalizeUserData(response.user);

      await saveAuthData(response.token, normalizedUser);
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Failed to sign in");
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    profile: Profile
  ) => {
    try {
      console.log("Attempting to register with email:", email);
      const response = await apiService.post<{ token: string; user: User }>(
        "/auth/register",
        {
          email,
          password,
          name,
          profile,
          phoneNumber: profile.phoneNumber,
          username: profile.username,
        }
      );

      console.log("Registration successful, saving auth data");

      // Normalize the user data structure
      const normalizedUser = normalizeUserData(response.user);

      await saveAuthData(response.token, normalizedUser);
    } catch (error: any) {
      console.error("Registration error:", error);

      // Provide more specific error messages based on the error type
      if (error.message === "Network Error") {
        console.error("Network Error details:", error);
        throw new Error(
          "Connection failed. Please check your internet connection and try again."
        );
      } else if (error.response?.status === 400) {
        const message =
          error.response.data?.message || "Invalid registration data";
        throw new Error(message);
      } else if (
        error.response?.status === 409 ||
        (error.response?.data?.message &&
          error.response.data.message.includes("already exists"))
      ) {
        throw new Error("This email or username is already registered");
      } else if (error.response?.status && error.response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(error.message || "Failed to sign up");
      }
    }
  };

  // Helper function to normalize user data structure
  const normalizeUserData = (userData: User): User => {
    const normalizedUser: User = { ...userData };

    // If profile exists, merge its properties to the top level
    if (userData.profile) {
      normalizedUser.bio = userData.bio || userData.profile.bio;
      normalizedUser.age = userData.age || userData.profile.age;
      normalizedUser.gender = userData.gender || userData.profile.gender;
      normalizedUser.interests =
        userData.interests || userData.profile.interests || [];
      normalizedUser.photos = userData.photos || userData.profile.photos || [];
      normalizedUser.phoneNumber =
        userData.phoneNumber || userData.profile.phoneNumber;
      normalizedUser.username = userData.username || userData.profile.username;
    }

    return normalizedUser;
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user?._id) {
        throw new Error("Not authenticated");
      }

      const updatedUser = await apiService.put<User>(
        `/users/profile`,
        userData
      );

      // Update local storage with merged user data
      const normalizedUser = normalizeUserData({ ...user, ...updatedUser });
      await AsyncStorage.setItem(
        Config.STORAGE_KEYS.USER_DATA,
        JSON.stringify(normalizedUser)
      );
      setUser(normalizedUser);
    } catch (error: any) {
      console.error("Update user error:", error);
      throw new Error(error.message || "Failed to update user data");
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(Config.STORAGE_KEYS.USER_DATA);
      setToken(null);
      setUser(null);
      console.log("User signed out");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Refresh token method - attempt to get a new token if the current one is invalid
  const refreshToken = async (): Promise<boolean> => {
    try {
      console.log("Attempting to refresh auth token...");
      if (!user) return false;

      // Make API call to refresh endpoint
      const response = await apiService.post<{ token: string }>(
        "/auth/token/refresh"
      );

      if (response.token) {
        console.log("Token refreshed successfully");

        // Update stored token
        await AsyncStorage.setItem(
          Config.STORAGE_KEYS.AUTH_TOKEN,
          response.token
        );
        setToken(response.token);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        signIn,
        signUp,
        updateUser,
        signOut,
        refreshToken, // Add the refresh token method to the context
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;

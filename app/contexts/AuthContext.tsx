import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "../services/apiService";
import { Config } from "../config/environment";
import { Alert } from "react-native";
import { router } from "expo-router";

export interface Profile {
  bio?: string;
  age?: number;
  gender?: string;
  interests?: string[];
  photos?: string[];
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
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  // Add effect to navigate based on auth state
  useEffect(() => {
    if (!loading) {
      if (token && user) {
        // User is authenticated, navigate to main app if not already there
        router.replace("/(tabs)");
      } else {
        // User is not authenticated
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
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log("Auth state loaded from storage:", !!storedToken);
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
        }
      );

      console.log("Registration successful, saving auth data");

      // Normalize the user data structure
      const normalizedUser = normalizeUserData(response.user);

      await saveAuthData(response.token, normalizedUser);
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Failed to sign up");
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
      await AsyncStorage.multiRemove([
        Config.STORAGE_KEYS.AUTH_TOKEN,
        Config.STORAGE_KEYS.USER_DATA,
      ]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw new Error("Failed to sign out");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, signIn, signUp, updateUser, signOut, loading }}
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

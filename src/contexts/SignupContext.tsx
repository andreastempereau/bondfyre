import React, { createContext, useCallback, useContext, useState } from "react";
import { apiService } from "../services/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "../config/environment";

// Define the signup data structure
interface SignupData {
  name: string;
  email: string;
  password: string;
  age: string;
  gender: string;
  bio: string;
  interests: string[];
  photos: string[];
  phoneNumber?: string;
  username?: string;
  friends?: string[];
}

interface RegisterResponse {
  data: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

// Define step type with proper typing for component paths
export type SignupStepName =
  | "email"
  | "name"
  | "password"
  | "age"
  | "gender"
  | "bio"
  | "interests"
  | "photos"
  | "username"
  | "friends"
  | "complete";

export interface SignupStep {
  id: number;
  name: SignupStepName;
  path: string;
  title: string;
  subtitle: string;
  isOptional?: boolean;
}

// Define the steps for signup flow with more metadata - reordering to put name first
export const SIGNUP_STEPS: SignupStep[] = [
  {
    id: 1,
    name: "name",
    path: "/auth/signup-steps/name",
    title: "What's your name?",
    subtitle: "Let us know what to call you",
  },
  {
    id: 2,
    name: "email",
    path: "/auth/signup-steps/email",
    title: "What's your email?",
    subtitle: "We'll use this for logging in",
  },
  {
    id: 3,
    name: "password",
    path: "/auth/signup-steps/password",
    title: "Create a password",
    subtitle: "Make it strong and secure",
  },
  {
    id: 4,
    name: "age",
    path: "/auth/signup-steps/age",
    title: "How old are you?",
    subtitle: "You must be at least 18 years old",
  },
  {
    id: 5,
    name: "gender",
    path: "/auth/signup-steps/gender",
    title: "What's your gender?",
    subtitle: "Select the option that best describes you",
  },
  {
    id: 6,
    name: "bio",
    path: "/auth/signup-steps/bio",
    title: "Tell us about yourself",
    subtitle: "Write a short bio (optional)",
    isOptional: true,
  },
  {
    id: 7,
    name: "interests",
    path: "/auth/signup-steps/interests",
    title: "What are your interests?",
    subtitle: "Add some tags to help us find your matches (optional)",
    isOptional: true,
  },
  {
    id: 8,
    name: "photos",
    path: "/auth/signup-steps/photos",
    title: "Add some photos",
    subtitle: "Show others who you are (optional)",
    isOptional: true,
  },
  {
    id: 9,
    name: "username",
    path: "/auth/signup-steps/username",
    title: "Choose a username",
    subtitle: "This will be your unique identifier on Bondfyre",
    isOptional: false,
  },
  {
    id: 10,
    name: "friends",
    path: "/auth/signup-steps/friends",
    title: "Add your friends",
    subtitle: "Connect with up to 3 friends to form a group",
    isOptional: true,
  },
  {
    id: 11,
    name: "complete",
    path: "/auth/signup-steps/complete",
    title: "You're all set!",
    subtitle: "Your profile is now complete",
  },
];

// Define the context shape with improved typing
interface SignupContextType {
  signupData: SignupData;
  updateSignupData: (field: keyof SignupData, value: any) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  currentStepInfo: SignupStep;
  totalSteps: number;
  getNextStep: () => string;
  getPreviousStep: () => string;
  getStepByName: (name: SignupStepName) => SignupStep;
  completeSignup: (data?: SignupData) => Promise<any>;
}

// Create the default values
const defaultSignupData: SignupData = {
  name: "",
  email: "",
  password: "",
  age: "",
  gender: "",
  bio: "Hello, I'm new here!",
  interests: [],
  photos: [],
  phoneNumber: "",
  username: "",
  friends: [],
};

// Create the context
const SignupContext = createContext<SignupContextType | undefined>(undefined);

// Provider component
export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [signupData, setSignupData] = useState<SignupData>(defaultSignupData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = SIGNUP_STEPS.length;

  // Get the current step info based on currentStep state
  const currentStepInfo =
    SIGNUP_STEPS.find((step) => step.id === currentStep) || SIGNUP_STEPS[0];

  const updateSignupData = useCallback(
    (field: keyof SignupData, value: any) => {
      setSignupData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Get step info by name
  const getStepByName = useCallback((name: SignupStepName): SignupStep => {
    try {
      const step = SIGNUP_STEPS.find((s) => s.name === name);
      if (!step) {
        console.error(`Step with name ${name} not found`);
        // Return a default step instead of throwing an error
        return SIGNUP_STEPS[0]; // Return the first step as fallback
      }
      return step;
    } catch (error) {
      console.error(`Error in getStepByName for ${name}:`, error);
      return SIGNUP_STEPS[0]; // Return the first step as fallback
    }
  }, []);

  // Get the next step path
  const getNextStep = useCallback(() => {
    try {
      // Make sure currentStep is valid
      if (typeof currentStep !== "number" || isNaN(currentStep)) {
        console.warn("Invalid currentStep in getNextStep:", currentStep);
        // Return a safe default step path
        return "/auth/signup-steps/name";
      }

      const currentIndex = SIGNUP_STEPS.findIndex(
        (step) => step.id === currentStep
      );

      // If we found the current step and it's not the last step
      if (currentIndex >= 0 && currentIndex < SIGNUP_STEPS.length - 1) {
        const nextStep = SIGNUP_STEPS[currentIndex + 1];
        return nextStep.path;
      }

      // If it's the last step or something went wrong, return to the complete step
      return "/auth/signup-steps/complete";
    } catch (error) {
      console.error("Error in getNextStep:", error);
      return "/auth/signup-steps/name"; // Safe default
    }
  }, [currentStep]);

  // Get the previous step path
  const getPreviousStep = useCallback(() => {
    const currentIndex = SIGNUP_STEPS.findIndex(
      (step) => step.id === currentStep
    );
    if (currentIndex > 0) {
      return SIGNUP_STEPS[currentIndex - 1].path;
    }
    // If it's the first step or something went wrong, return to the first step
    return SIGNUP_STEPS[0].path;
  }, [currentStep]);

  const completeSignup = async (data?: SignupData) => {
    // Use provided data or current signup data
    const finalData = data || signupData;

    try {
      // Format data for API
      const apiData = {
        email: finalData.email,
        password: finalData.password,
        name: finalData.name,
        profile: {
          bio: finalData.bio,
          age: parseInt(finalData.age),
          gender: finalData.gender,
          interests: finalData.interests,
          photos: finalData.photos,
        },
        phoneNumber: finalData.phoneNumber,
        username: finalData.username,
      };

      console.log("Attempting to register with email:", finalData.email);
      const response = await apiService.post<RegisterResponse>(
        "/auth/register",
        apiData
      );

      console.log("Registration successful");

      // If friends were selected, add them after registration
      if (finalData.friends && finalData.friends.length > 0) {
        // Set the auth token from registration
        // Store token in AsyncStorage instead of using a non-existent setAuthToken method
        await AsyncStorage.setItem(
          Config.STORAGE_KEYS.AUTH_TOKEN,
          response.data.token
        );

        // Send friend requests to each selected friend
        for (const friendId of finalData.friends) {
          await apiService.post("/friends/request", { friendId });
        }
      }

      return response.data;
    } catch (error: any) {
      // Provide detailed error information
      const isAxiosError = error.isAxiosError || false;
      const status = error.response?.status;
      const responseData = error.response?.data;
      const errorMessage =
        responseData?.message || error.message || "Unknown error occurred";

      console.error("Signup error:", {
        message: errorMessage,
        isAxiosError,
        status,
        responseData,
        originalError: error,
      });

      if (error.message === "Network Error") {
        console.error("Network Error details:", error);
        throw new Error(
          "Connection failed. Please check your internet connection and try again."
        );
      } else if (status === 400) {
        throw new Error(errorMessage || "Invalid registration data");
      } else if (status === 409) {
        throw new Error(errorMessage || "User already exists");
      } else if (status && status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(errorMessage || "Failed to sign up");
      }
    }
  };

  return (
    <SignupContext.Provider
      value={{
        signupData,
        updateSignupData,
        currentStep,
        setCurrentStep,
        currentStepInfo,
        totalSteps,
        getNextStep,
        getPreviousStep,
        getStepByName,
        completeSignup,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
}

// Custom hook to use the signup context
export function useSignup() {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error("useSignup must be used within a SignupProvider");
  }
  return context;
}

export default SignupContext;

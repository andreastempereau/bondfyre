import React, { createContext, useContext, useState } from "react";

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
}

// Define the steps for signup flow
export const SIGNUP_STEPS = [
  {
    id: 1,
    name: "name",
    path: "/auth/signup-steps/name",
  },
  {
    id: 2,
    name: "gender",
    path: "/auth/signup-steps/gender",
  },
  {
    id: 3,
    name: "age",
    path: "/auth/signup-steps/age",
  },
  {
    id: 4,
    name: "bio",
    path: "/auth/signup-steps/bio",
  },
  {
    id: 5,
    name: "interests",
    path: "/auth/signup-steps/interests",
  },
  {
    id: 6,
    name: "email",
    path: "/auth/signup-steps/email",
  },
  {
    id: 7,
    name: "password",
    path: "/auth/signup-steps/password",
  },
  {
    id: 8,
    name: "photos",
    path: "/auth/signup-steps/photos",
  },
  {
    id: 9,
    name: "complete",
    path: "/auth/signup-steps/complete",
  },
];

// Define the context shape
interface SignupContextType {
  data: SignupData;
  updateData: (field: keyof SignupData, value: any) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  getNextStep: (currentStepId: number) => string;
}

// Create the default values
const defaultSignupData: SignupData = {
  name: "",
  email: "",
  password: "",
  age: "",
  gender: "",
  bio: "Hello, I'm new here!",
  interests: ["technology", "travel", "music"],
  photos: [],
};

// Create the context
const SignupContext = createContext<SignupContextType | undefined>(undefined);

// Provider component
export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SignupData>(defaultSignupData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = SIGNUP_STEPS.length;

  const updateData = (field: keyof SignupData, value: any) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getNextStep = (currentStepId: number) => {
    const currentIndex = SIGNUP_STEPS.findIndex(
      (step) => step.id === currentStepId
    );
    if (currentIndex >= 0 && currentIndex < SIGNUP_STEPS.length - 1) {
      return SIGNUP_STEPS[currentIndex + 1].path;
    }
    // If it's the last step or something went wrong, return to the complete step
    return "/auth/signup-steps/complete";
  };

  return (
    <SignupContext.Provider
      value={{
        data,
        updateData,
        currentStep,
        setCurrentStep,
        totalSteps,
        getNextStep,
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

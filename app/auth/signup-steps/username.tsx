import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSignup } from "../../../src/contexts/SignupContext";
import { useRouter } from "expo-router";
import { StepContainer } from "../../../src/components/forms/StepContainer";
import * as yup from "yup";
import { apiService } from "../../../src/services/apiService";

// Validation schema for username
const usernameSchema = yup.object({
  username: yup
    .string()
    .required("Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .matches(
      /^[a-zA-Z0-9._]+$/,
      "Username can only contain letters, numbers, dots and underscores"
    ),
});

export default function UsernameStep() {
  const {
    signupData,
    updateSignupData,
    setCurrentStep,
    getNextStep,
    getStepByName,
  } = useSignup();
  const [username, setUsername] = useState(signupData.username || "");
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  // Animation values
  const iconAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;
  const inputScaleAnim = useRef(new Animated.Value(1)).current;

  // Debounce timer for username availability check
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    // Set current step using the step ID from context
    const usernameStep = getStepByName("username");
    setCurrentStep(usernameStep.id);
  }, [setCurrentStep, getStepByName]);

  useEffect(() => {
    Animated.spring(iconAnim, {
      toValue: isFocused ? 1 : 0,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  useEffect(() => {
    Animated.timing(errorAnim, {
      toValue: error ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [error]);

  // Check if username is available
  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.trim() === "") {
      return;
    }

    try {
      setIsChecking(true);
      // Call API to check if username is available
      const response = await apiService.get<{
        available: boolean;
        message: string;
      }>(
        `/auth/check-username?username=${encodeURIComponent(usernameToCheck)}`
      );

      // Check if the response data has the available property
      if (response && response.available) {
        setError(null);
      } else if (response) {
        setError("Username is already taken");
      } else {
        // If response structure is unexpected
        setError("Could not verify username availability");
      }
    } catch (error) {
      console.error("Failed to check username availability:", error);
      // For development, allow continuing without the API check
      if (__DEV__) {
        setError(null);
      } else {
        setError("Error checking username. Please try again.");
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Handle username change with debounce for availability check
  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setError(null);

    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Only check availability if username is valid
    try {
      usernameSchema.validateSync({ username: value });

      // Set a new timeout for checking availability
      debounceTimeout.current = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
    } catch (validationError: any) {
      setError(validationError.message);
    }
  };

  const handleNext = async () => {
    try {
      if (isChecking) {
        // Wait for the check to complete
        return;
      }

      // Validate username
      await usernameSchema.validate({ username });

      // In development mode, we can skip the availability check if the API is offline
      if (!__DEV__) {
        // Check availability one last time before proceeding
        await checkUsernameAvailability(username);
      }

      // In development, allow proceeding even with errors related to API unavailability
      const canProceed = __DEV__ || !error;

      if (canProceed) {
        // Save username to signup data
        updateSignupData("username", username);

        // Navigate to next step
        router.push(getNextStep());
      }
    } catch (validationError: any) {
      setError(validationError.message);

      // Shake animation for error
      Animated.sequence([
        Animated.timing(inputScaleAnim, {
          toValue: 1.03,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(inputScaleAnim, {
          toValue: 0.97,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(inputScaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const iconStyle = {
    transform: [
      {
        scale: iconAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <StepContainer
        title="Choose a username"
        subtitle="This will be your unique identifier on Bondfyre"
        nextButtonText="Continue"
        onNext={handleNext}
        nextDisabled={!username || !!error || isChecking}
      >
        <Animated.View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            error && styles.inputContainerError,
            { transform: [{ scale: inputScaleAnim }] },
          ]}
        >
          <View style={styles.iconContainer}>
            <Animated.View style={iconStyle}>
              <MaterialCommunityIcons
                name="account"
                size={24}
                color={isFocused ? "#FF6B6B" : "#999"}
              />
            </Animated.View>
          </View>

          <TextInput
            style={[styles.input, isFocused && styles.inputFocused]}
            placeholder="Enter a username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={handleUsernameChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {isChecking && (
            <ActivityIndicator
              size="small"
              color="#FF6B6B"
              style={styles.loadingIndicator}
            />
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.errorContainer,
            {
              opacity: errorAnim,
              transform: [
                {
                  translateY: errorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {error && (
            <>
              <MaterialCommunityIcons
                name="alert-circle"
                size={16}
                color="#FF3B30"
              />
              <Text style={styles.errorText}>{error}</Text>
            </>
          )}
        </Animated.View>

        <View style={styles.tipContainer}>
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={24}
            color="#666"
          />
          <View style={styles.tipTextContainer}>
            <Text style={styles.tipText}>
              Your username is how others will find you on Bondfyre. Choose
              something unique that represents you.
            </Text>
          </View>
        </View>
      </StepContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F8F8F8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputContainerFocused: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFFFFF",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  inputContainerError: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF8F8",
  },
  iconContainer: {
    marginRight: 10,
    padding: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 15,
    color: "#333",
  },
  inputFocused: {
    color: "#FF6B6B",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 15,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginLeft: 5,
  },
  tipContainer: {
    flexDirection: "row",
    marginTop: 20,
    padding: 15,
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    alignItems: "flex-start",
  },
  tipTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  loadingIndicator: {
    marginLeft: 10,
  },
});

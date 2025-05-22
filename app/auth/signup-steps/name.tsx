import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useSignup } from "../../../src/contexts/SignupContext";
import { StepContainer } from "../../../src/components/forms/StepContainer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as yup from "yup";
import { MotiView } from "moti";
import {
  safeAnimationConfig,
  safeOutputRange,
} from "../../../src/utils/animationUtils";

// Validation schema for just the name field
const nameSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
});

export default function NameStep() {
  const {
    signupData,
    updateSignupData,
    setCurrentStep,
    getNextStep,
    getStepByName,
  } = useSignup();
  const [name, setName] = useState(signupData.name);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Animation values
  const iconAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;
  const inputScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Set current step using the step ID from context
    const nameStep = getStepByName("name");
    setCurrentStep(nameStep.id);
  }, [setCurrentStep, getStepByName]);

  useEffect(() => {
    Animated.spring(
      iconAnim,
      safeAnimationConfig({
        toValue: isFocused ? 1 : 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      })
    ).start();

    Animated.spring(
      inputScaleAnim,
      safeAnimationConfig({
        toValue: isFocused ? 1.02 : 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      })
    ).start();
  }, [isFocused]);

  useEffect(() => {
    Animated.timing(
      errorAnim,
      safeAnimationConfig({
        toValue: error ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      })
    ).start();
  }, [error]);

  const handleNext = async () => {
    Keyboard.dismiss();
    try {
      await nameSchema.validateAt("name", { name });
      updateSignupData("name", name);

      // Create a bounce effect before navigation
      Animated.sequence([
        Animated.timing(
          inputScaleAnim,
          safeAnimationConfig({
            toValue: 0.98,
            duration: 100,
            useNativeDriver: true,
          })
        ),
        Animated.spring(
          inputScaleAnim,
          safeAnimationConfig({
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          })
        ),
      ]).start(() => {
        // Use getNextStep to navigate to the next step - no need to specify current step ID
        router.push(getNextStep());
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <StepContainer
          onNext={handleNext}
          nextDisabled={!name.trim()}
          showBackButton={false}
        >
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 100 }}
          >
            <Animated.View
              style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
                error && styles.inputContainerError,
                { transform: [{ scale: inputScaleAnim }] },
              ]}
            >
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [
                      {
                        scale: iconAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.2],
                        }),
                      },
                      {
                        rotate: iconAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "10deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={22}
                  color={isFocused ? "#FF6B6B" : error ? "#FF3B30" : "#666"}
                />
              </Animated.View>

              <TextInput
                style={[styles.input, isFocused && styles.inputFocused]}
                placeholder="Your full name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (error) setError(null);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (name.trim()) {
                    handleNext();
                  }
                }}
                autoCapitalize="words"
              />
            </Animated.View>
          </MotiView>

          <Animated.View
            style={{
              opacity: errorAnim,
              transform: [
                {
                  translateY: errorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10, 0],
                  }),
                },
              ],
            }}
          >
            {error && (
              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
                style={styles.errorContainer}
              >
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={16}
                  color="#FF3B30"
                />
                <Animated.Text style={styles.errorText}>{error}</Animated.Text>
              </MotiView>
            )}
          </Animated.View>
        </StepContainer>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
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
});

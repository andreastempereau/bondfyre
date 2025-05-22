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
  Text,
} from "react-native";
import { router } from "expo-router";
import { useSignup } from "../../../src/contexts/SignupContext";
import { StepContainer } from "../../../src/components/forms/StepContainer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as yup from "yup";
import { MotiView } from "moti";
import Slider from "@react-native-community/slider";
import {
  safeAnimationConfig,
  safeOutputRange,
} from "../../../src/utils/animationUtils";

// Validation schema for just the age field
const ageSchema = yup.object({
  age: yup
    .string()
    .required("Age is required")
    .matches(/^\d+$/, "Age must be a number")
    .test("is-valid-age", "Age must be between 18 and 99", (value) => {
      const age = parseInt(value);
      return age >= 18 && age <= 99;
    }),
});

export default function AgeStep() {
  const {
    signupData,
    updateSignupData,
    setCurrentStep,
    getNextStep,
    getStepByName,
  } = useSignup();
  const [age, setAge] = useState(signupData.age || "");
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Animation values
  const iconAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;
  const inputScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Set current step using the step ID from context
    const ageStep = getStepByName("age");
    setCurrentStep(ageStep.id);
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

  // Convert string age to number for slider
  const numericAge = age ? parseInt(age) : 18;

  const handleAgeChange = (value: string) => {
    // Only allow numeric input
    if (/^\d*$/.test(value)) {
      setAge(value);
      if (error) setError(null);
    }
  };

  const handleSliderChange = (value: number) => {
    setAge(String(Math.round(value)));
    if (error) setError(null);
  };

  const handleNext = async () => {
    Keyboard.dismiss();
    try {
      // Parse age as number for validation
      await ageSchema.validateAt("age", { age });
      updateSignupData("age", age);

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
          nextDisabled={!age.trim() || parseInt(age) < 18 || parseInt(age) > 99}
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
                          outputRange: safeOutputRange([1, 1.2]),
                        }),
                      },
                      {
                        rotate: iconAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["0deg", "10deg"], // String rotation values don't need the safeOutputRange
                        }),
                      },
                    ],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={22}
                  color={isFocused ? "#FF6B6B" : error ? "#FF3B30" : "#666"}
                />
              </Animated.View>

              <TextInput
                style={[styles.input, isFocused && styles.inputFocused]}
                placeholder="Your age"
                placeholderTextColor="#999"
                value={age}
                onChangeText={handleAgeChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
                returnKeyType="next"
                keyboardType="number-pad"
                maxLength={3}
                onSubmitEditing={() => {
                  if (
                    age.trim() &&
                    parseInt(age) >= 18 &&
                    parseInt(age) <= 99
                  ) {
                    handleNext();
                  }
                }}
              />
            </Animated.View>

            {/* Age slider for more interactive input */}
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Or use the slider:</Text>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={80}
                step={1}
                value={numericAge >= 18 && numericAge <= 80 ? numericAge : 18}
                onValueChange={handleSliderChange}
                minimumTrackTintColor="#FF6B6B"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#FF6B6B"
              />
              <View style={styles.sliderMarkers}>
                <Text style={styles.sliderMarkerText}>18</Text>
                <Text style={styles.sliderMarkerText}>30</Text>
                <Text style={styles.sliderMarkerText}>45</Text>
                <Text style={styles.sliderMarkerText}>60</Text>
                <Text style={styles.sliderMarkerText}>80+</Text>
              </View>
            </View>
          </MotiView>

          <Animated.View
            style={{
              opacity: errorAnim,
              transform: [
                {
                  translateY: errorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: safeOutputRange([-10, 0]),
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

          {/* Age display indicator */}
          {age && (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              style={styles.ageDisplayContainer}
            >
              <Text style={styles.ageDisplay}>{age}</Text>
              <Text style={styles.ageDisplayLabel}>years old</Text>
            </MotiView>
          )}
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
  sliderContainer: {
    marginTop: 30,
    paddingHorizontal: 5,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderMarkers: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  sliderMarkerText: {
    fontSize: 12,
    color: "#999",
  },
  ageDisplayContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  ageDisplay: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  ageDisplayLabel: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
});

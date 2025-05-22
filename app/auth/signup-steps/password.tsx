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
  TouchableOpacity,
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

// Validation schema for just the password field
const passwordSchema = yup.object({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export default function PasswordStep() {
  const {
    signupData,
    updateSignupData,
    setCurrentStep,
    getNextStep,
    getStepByName,
  } = useSignup();
  const [password, setPassword] = useState(signupData.password);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Animation values
  const iconAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;
  const inputScaleAnim = useRef(new Animated.Value(1)).current;
  const visibilityIconAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Set current step using the step ID from context
    const passwordStep = getStepByName("password");
    setCurrentStep(passwordStep.id);
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

  useEffect(() => {
    Animated.timing(
      visibilityIconAnim,
      safeAnimationConfig({
        toValue: isPasswordVisible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      })
    ).start();
  }, [isPasswordVisible]);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleNext = async () => {
    Keyboard.dismiss();
    try {
      await passwordSchema.validateAt("password", { password });
      updateSignupData("password", password);

      // Create a bounce effect before navigation
      Animated.sequence([
        Animated.timing(inputScaleAnim, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(inputScaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Use getNextStep to navigate to the next step in the sequence
        router.push(getNextStep());
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Password strength indicators
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let strength = 0;

    // Length check
    if (pwd.length >= 8) strength += 1;

    // Character variety checks
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;

    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = [
    "#E0E0E0",
    "#FF3B30",
    "#FF9500",
    "#FFCC00",
    "#34C759",
    "#30B0FF",
  ];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <StepContainer
          onNext={handleNext}
          nextDisabled={!password.trim() || passwordStrength < 3}
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
                  name="lock"
                  size={22}
                  color={isFocused ? "#FF6B6B" : error ? "#FF3B30" : "#666"}
                />
              </Animated.View>

              <TextInput
                style={[styles.input, isFocused && styles.inputFocused]}
                placeholder="Create a strong password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(null);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
                returnKeyType="next"
                secureTextEntry={!isPasswordVisible}
                onSubmitEditing={() => {
                  if (password.trim() && passwordStrength >= 3) {
                    handleNext();
                  }
                }}
              />

              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.visibilityToggle}
              >
                <Animated.View
                  style={{
                    opacity: visibilityIconAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0],
                    }),
                    position: "absolute",
                    width: 24,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons name="eye" size={22} color="#666" />
                </Animated.View>
                <Animated.View
                  style={{
                    opacity: visibilityIconAnim,
                    width: 24,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="eye-off"
                    size={22}
                    color="#666"
                  />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>

            {/* Password strength indicator */}
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBars}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <View
                    key={`strength-${level}`}
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          passwordStrength >= level
                            ? strengthColors[passwordStrength]
                            : "#E0E0E0",
                      },
                    ]}
                  />
                ))}
              </View>
              {password && (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "timing", duration: 300 }}
                  style={styles.strengthLabelContainer}
                >
                  <MaterialCommunityIcons
                    name={
                      passwordStrength >= 4 ? "shield-check" : "shield-alert"
                    }
                    size={16}
                    color={strengthColors[passwordStrength]}
                  />
                  <Animated.Text
                    style={[
                      styles.strengthLabel,
                      { color: strengthColors[passwordStrength] },
                    ]}
                  >
                    {strengthLabels[passwordStrength]}
                  </Animated.Text>
                </MotiView>
              )}
            </View>
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

          {/* Password requirements */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{
              opacity: password ? 1 : 0,
              translateY: password ? 0 : 10,
            }}
            transition={{ type: "timing", duration: 300 }}
            style={styles.requirementsContainer}
          >
            <View style={styles.requirementRow}>
              <MaterialCommunityIcons
                name={
                  /^.{8,}$/.test(password) ? "check-circle" : "circle-outline"
                }
                size={16}
                color={/^.{8,}$/.test(password) ? "#34C759" : "#666"}
              />
              <Animated.Text
                style={[
                  styles.requirementText,
                  { color: /^.{8,}$/.test(password) ? "#34C759" : "#666" },
                ]}
              >
                At least 8 characters
              </Animated.Text>
            </View>

            <View style={styles.requirementRow}>
              <MaterialCommunityIcons
                name={
                  /[A-Z]/.test(password) ? "check-circle" : "circle-outline"
                }
                size={16}
                color={/[A-Z]/.test(password) ? "#34C759" : "#666"}
              />
              <Animated.Text
                style={[
                  styles.requirementText,
                  { color: /[A-Z]/.test(password) ? "#34C759" : "#666" },
                ]}
              >
                Has uppercase letter
              </Animated.Text>
            </View>

            <View style={styles.requirementRow}>
              <MaterialCommunityIcons
                name={
                  /[a-z]/.test(password) ? "check-circle" : "circle-outline"
                }
                size={16}
                color={/[a-z]/.test(password) ? "#34C759" : "#666"}
              />
              <Animated.Text
                style={[
                  styles.requirementText,
                  { color: /[a-z]/.test(password) ? "#34C759" : "#666" },
                ]}
              >
                Has lowercase letter
              </Animated.Text>
            </View>

            <View style={styles.requirementRow}>
              <MaterialCommunityIcons
                name={
                  /[0-9]/.test(password) ? "check-circle" : "circle-outline"
                }
                size={16}
                color={/[0-9]/.test(password) ? "#34C759" : "#666"}
              />
              <Animated.Text
                style={[
                  styles.requirementText,
                  { color: /[0-9]/.test(password) ? "#34C759" : "#666" },
                ]}
              >
                Has number
              </Animated.Text>
            </View>

            <View style={styles.requirementRow}>
              <MaterialCommunityIcons
                name={
                  /[^A-Za-z0-9]/.test(password)
                    ? "check-circle"
                    : "circle-outline"
                }
                size={16}
                color={/[^A-Za-z0-9]/.test(password) ? "#34C759" : "#666"}
              />
              <Animated.Text
                style={[
                  styles.requirementText,
                  { color: /[^A-Za-z0-9]/.test(password) ? "#34C759" : "#666" },
                ]}
              >
                Has special character
              </Animated.Text>
            </View>
          </MotiView>
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
  visibilityToggle: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    width: 40,
  },
  strengthContainer: {
    marginTop: 15,
  },
  strengthBars: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  strengthBar: {
    height: 4,
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  strengthLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  strengthLabel: {
    fontSize: 12,
    marginLeft: 5,
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
  requirementsContainer: {
    marginTop: 25,
    marginBottom: 10,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    marginLeft: 8,
  },
});

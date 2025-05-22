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
} from "react-native";
import { router } from "expo-router";
import { useSignup } from "../../../src/contexts/SignupContext";
import { StepContainer } from "../../../src/components/forms/StepContainer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import {
  safeAnimationConfig,
  safeOutputRange,
} from "../../../src/utils/animationUtils";

export default function BioStep() {
  const {
    signupData,
    updateSignupData,
    setCurrentStep,
    getNextStep,
    getStepByName,
  } = useSignup();
  const [bio, setBio] = useState(signupData.bio || "");
  const [isFocused, setIsFocused] = useState(false);

  // Animation values
  const iconAnim = useRef(new Animated.Value(0)).current;
  const inputScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Set current step using the step ID from context
    const bioStep = getStepByName("bio");
    setCurrentStep(bioStep.id);
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

  const handleNext = async () => {
    Keyboard.dismiss();
    updateSignupData("bio", bio);

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
          nextDisabled={false} // Bio is optional
          nextButtonText="Continue"
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
                  name="text"
                  size={22}
                  color={isFocused ? "#FF6B6B" : "#666"}
                />
              </Animated.View>

              <TextInput
                style={[styles.input, isFocused && styles.inputFocused]}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#999"
                value={bio}
                onChangeText={setBio}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </Animated.View>
          </MotiView>

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 500, delay: 300 }}
            style={styles.tipContainer}
          >
            <MaterialCommunityIcons name="information" size={18} color="#666" />
            <View style={styles.tipTextContainer}>
              <Animated.Text style={styles.tipText}>
                Your bio helps others get to know you better. You can skip this
                step and add more details later.
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
    alignItems: "flex-start",
  },
  inputContainerFocused: {
    borderColor: "#FF6B6B",
    backgroundColor: "#FFFFFF",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  iconContainer: {
    marginRight: 10,
    paddingTop: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 15,
    color: "#333",
    minHeight: 120,
  },
  inputFocused: {
    color: "#FF6B6B",
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
});

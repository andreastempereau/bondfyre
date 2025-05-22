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
  ScrollView,
  TouchableOpacity,
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

// Sample interest suggestions
const interestSuggestions = [
  "Music",
  "Movies",
  "Travel",
  "Food",
  "Photography",
  "Reading",
  "Sports",
  "Technology",
  "Gaming",
  "Art",
  "Hiking",
  "Yoga",
  "Cooking",
  "Dancing",
  "Fashion",
];

export default function InterestsStep() {
  const {
    signupData,
    updateSignupData,
    setCurrentStep,
    getNextStep,
    getStepByName,
  } = useSignup();
  const [interests, setInterests] = useState<string[]>(
    signupData.interests || []
  );
  const [currentInput, setCurrentInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Animation values
  const iconAnim = useRef(new Animated.Value(0)).current;
  const inputScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Set current step using the step ID from context
    const interestsStep = getStepByName("interests");
    setCurrentStep(interestsStep.id);
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

  const addInterest = (interest: string) => {
    const trimmedInterest = interest.trim();
    if (trimmedInterest && !interests.includes(trimmedInterest)) {
      setInterests([...interests, trimmedInterest]);
      setCurrentInput("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((item) => item !== interest));
  };

  const handleAddSuggestion = (suggestion: string) => {
    if (!interests.includes(suggestion)) {
      setInterests([...interests, suggestion]);
    }
  };

  const handleNext = async () => {
    Keyboard.dismiss();
    try {
      // First update the data
      updateSignupData("interests", interests);

      // Make sure the correct step is set
      const interestsStep = getStepByName("interests");
      setCurrentStep(interestsStep.id);

      // Get the next path before animation
      const nextPath = getNextStep();

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
        try {
          // Use explicit path instead of getNextStep() which might be affected by state changes
          if (nextPath) {
            router.push(nextPath);
          } else {
            // Fallback to explicit path if getNextStep fails
            router.push("/auth/signup-steps/photos");
          }
        } catch (navError) {
          console.error("Navigation error:", navError);
          // Fallback navigation
          router.push("/auth/signup-steps/photos");
        }
      });
    } catch (error) {
      console.error("Error in handleNext:", error);
      // Fallback navigation without animation
      router.push("/auth/signup-steps/photos");
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
          nextDisabled={false} // Interests are optional
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
                  name="tag-multiple"
                  size={22}
                  color={isFocused ? "#FF6B6B" : "#666"}
                />
              </Animated.View>

              <TextInput
                style={[styles.input, isFocused && styles.inputFocused]}
                placeholder="Type an interest and press enter"
                placeholderTextColor="#999"
                value={currentInput}
                onChangeText={setCurrentInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (currentInput) {
                    addInterest(currentInput);
                  }
                }}
              />
            </Animated.View>
          </MotiView>

          {/* Interest tags */}
          {interests.length > 0 && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 500 }}
              style={styles.tagsContainer}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagsScrollContainer}
              >
                {interests.map((interest, index) => (
                  <MotiView
                    key={`${interest}-${index}`}
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      type: "spring",
                      delay: index * 50,
                      damping: 15,
                    }}
                    style={styles.tagItem}
                  >
                    <Text style={styles.tagText}>{interest}</Text>
                    <TouchableOpacity
                      style={styles.tagRemove}
                      onPress={() => removeInterest(interest)}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={16}
                        color="#FF6B6B"
                      />
                    </TouchableOpacity>
                  </MotiView>
                ))}
              </ScrollView>
            </MotiView>
          )}

          {/* Suggestions */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 500, delay: 300 }}
            style={styles.suggestionsContainer}
          >
            <Text style={styles.suggestionsTitle}>Suggestions:</Text>
            <View style={styles.suggestionTags}>
              {interestSuggestions
                .filter((suggestion) => !interests.includes(suggestion))
                .map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionTag}
                    onPress={() => handleAddSuggestion(suggestion)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                    <MaterialCommunityIcons
                      name="plus"
                      size={14}
                      color="#666"
                    />
                  </TouchableOpacity>
                ))}
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
  tagsContainer: {
    marginTop: 15,
  },
  tagsScrollContainer: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginVertical: 4,
  },
  tagText: {
    fontSize: 14,
    color: "#FF6B6B",
  },
  tagRemove: {
    marginLeft: 5,
    padding: 2,
  },
  suggestionsContainer: {
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 10,
  },
  suggestionTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  suggestionTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: "#666",
    marginRight: 5,
  },
});

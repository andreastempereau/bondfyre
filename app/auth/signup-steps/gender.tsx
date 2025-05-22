import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSignup } from "../../../src/contexts/SignupContext";
import { StepContainer } from "../../../src/components/forms/StepContainer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  runOnJS,
} from "react-native-reanimated";
import {
  safeAnimationConfig,
  safeOutputRange,
} from "../../../src/utils/animationUtils";
import {
  safeSpringConfig,
  safeTimingConfig,
} from "../../../src/utils/reanimatedUtils";

// Define gender options
const genderOptions = [
  { value: "male", label: "Male", icon: "gender-male" },
  { value: "female", label: "Female", icon: "gender-female" },
  { value: "non-binary", label: "Non-Binary", icon: "gender-non-binary" },
  { value: "other", label: "Other", icon: "gender-transgender" },
  {
    value: "prefer-not-to-say",
    label: "Prefer not to say",
    icon: "gender-male-female",
  },
];

type Gender =
  | "male"
  | "female"
  | "non-binary"
  | "other"
  | "prefer-not-to-say"
  | "";

export default function GenderStep() {
  const {
    signupData,
    updateSignupData,
    setCurrentStep,
    getNextStep,
    getStepByName,
  } = useSignup();
  const [selectedGender, setSelectedGender] = useState<Gender>(
    (signupData.gender as Gender) || ""
  );

  useEffect(() => {
    // Set current step using the step ID from context
    const genderStep = getStepByName("gender");
    setCurrentStep(genderStep.id);
  }, [setCurrentStep, getStepByName]);

  const handleSelectGender = (gender: Gender) => {
    setSelectedGender(gender);
  };

  const handleNext = async () => {
    if (!selectedGender) return;

    updateSignupData("gender", selectedGender);

    // Navigate to the next step in sequence - no need to specify current step ID
    router.push(getNextStep());
  };

  return (
    <View style={styles.container}>
      <StepContainer onNext={handleNext} nextDisabled={!selectedGender}>
        <View style={styles.genderGrid}>
          {genderOptions.map((option, index) => (
            <GenderOption
              key={option.value}
              value={option.value}
              label={option.label}
              icon={option.icon}
              isSelected={selectedGender === option.value}
              onSelect={handleSelectGender}
              delay={index * 100}
            />
          ))}
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{
            opacity: selectedGender ? 1 : 0,
            translateY: selectedGender ? 0 : 20,
          }}
          transition={{ type: "timing", duration: 500 }}
          style={styles.selectionConfirmation}
        >
          {selectedGender && (
            <>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="#34C759"
              />
              <Text style={styles.selectionConfirmationText}>
                You selected{" "}
                {genderOptions.find((g) => g.value === selectedGender)?.label}
              </Text>
            </>
          )}
        </MotiView>
      </StepContainer>
    </View>
  );
}

interface GenderOptionProps {
  value: string;
  label: string;
  icon: string;
  isSelected: boolean;
  onSelect: (value: Gender) => void;
  delay: number;
}

const GenderOption = ({
  value,
  label,
  icon,
  isSelected,
  onSelect,
  delay,
}: GenderOptionProps) => {
  // Animation values
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(0);
  const borderColor = useSharedValue(0);

  // Animate when selection changes
  useEffect(() => {
    if (isSelected) {
      scale.value = withSpring(
        1.05,
        safeSpringConfig({ mass: 0.5, damping: 10 })
      );
      backgroundColor.value = withTiming(
        1,
        safeTimingConfig({ duration: 300 })
      );
      borderColor.value = withTiming(1, safeTimingConfig({ duration: 300 }));
    } else {
      scale.value = withSpring(1, safeSpringConfig({}));
      backgroundColor.value = withTiming(
        0,
        safeTimingConfig({ duration: 300 })
      );
      borderColor.value = withTiming(0, safeTimingConfig({ duration: 300 }));
    }
  }, [isSelected]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: interpolateColor(
        backgroundColor.value,
        [0, 1],
        ["#F8F8F8", "#FFF0F0"]
      ),
      borderColor: interpolateColor(
        borderColor.value,
        [0, 1],
        ["#E0E0E0", "#FF6B6B"]
      ),
    };
  });

  const iconColor = isSelected ? "#FF6B6B" : "#666";

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        delay,
        damping: 15,
      }}
      style={styles.genderOptionContainer}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onSelect(value as Gender)}
      >
        <Animated.View style={[styles.genderOption, animatedStyles]}>
          {/* @ts-ignore */}
          <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
          <Text
            style={[
              styles.genderLabel,
              isSelected && styles.selectedGenderLabel,
            ]}
          >
            {label}
          </Text>
          {isSelected && (
            <MotiView
              from={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              style={styles.selectedIcon}
            >
              <MaterialCommunityIcons name="check" size={14} color="#FFF" />
            </MotiView>
          )}
        </Animated.View>
      </TouchableOpacity>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  genderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 20,
  },
  genderOptionContainer: {
    width: "45%",
    marginBottom: 16,
  },
  genderOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    position: "relative",
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
  selectedGenderLabel: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  selectionConfirmation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    padding: 10,
    backgroundColor: "#F9FFF9",
    borderRadius: 8,
  },
  selectionConfirmationText: {
    marginLeft: 8,
    color: "#34C759",
    fontWeight: "500",
  },
  selectedIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

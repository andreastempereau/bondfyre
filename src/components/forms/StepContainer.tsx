import React, { ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { useSignup } from "../../contexts/SignupContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

interface StepContainerProps {
  children: ReactNode;
  showBackButton?: boolean;
  onNext?: () => void | Promise<void>;
  nextDisabled?: boolean;
  nextButtonText?: string;
  title?: string; // Made optional since we'll use step info from context
  subtitle?: string; // Made optional since we'll use step info from context
}

const { width } = Dimensions.get("window");

export function StepContainer({
  title: propTitle,
  subtitle: propSubtitle,
  children,
  showBackButton = true,
  onNext,
  nextDisabled = false,
  nextButtonText = "Next",
}: StepContainerProps) {
  const { currentStep, totalSteps, currentStepInfo, getPreviousStep } =
    useSignup();
  const progressWidth = width * 0.8 * (currentStep / totalSteps);

  // Use props if provided, otherwise use titles from currentStepInfo
  const title = propTitle || currentStepInfo.title;
  const subtitle = propSubtitle || currentStepInfo.subtitle;

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleBack = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const previousPath = getPreviousStep();
      router.push(previousPath);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
        )}
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps - 1}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </View>
      </View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

        <View style={styles.childrenContainer}>{children}</View>

        {onNext && (
          <TouchableOpacity
            style={[
              styles.nextButton,
              nextDisabled && styles.nextButtonDisabled,
            ]}
            onPress={onNext}
            disabled={nextDisabled}
          >
            <Text style={styles.nextButtonText}>{nextButtonText}</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="white"
            />
          </TouchableOpacity>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 20,
    padding: 5,
  },
  stepText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  progressBackground: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#FF6B6B",
    borderRadius: 3,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  childrenContainer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: "row",
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  nextButtonDisabled: {
    backgroundColor: "#FFAAAA",
  },
  nextButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 10,
  },
});

export default StepContainer;

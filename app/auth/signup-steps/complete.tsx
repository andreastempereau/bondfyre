import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import { MotiView } from "moti";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { StepContainer } from "../../components/forms/StepContainer";
import { useAuth } from "../../contexts/AuthContext";
import { useSignup } from "../../contexts/SignupContext";

const { width } = Dimensions.get("window");

export default function CompleteStep() {
  const { data, setCurrentStep } = useSignup();
  const { signUp } = useAuth();
  const animationRef = useRef<LottieView>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    setCurrentStep(9); // Update to match step ID in SIGNUP_STEPS

    // Initial animation
    cardOpacity.value = withTiming(1, { duration: 500 });
    cardScale.value = withSpring(1, { damping: 14 });
  }, [setCurrentStep]);

  useEffect(() => {
    if (animationRef.current) {
      setTimeout(() => {
        animationRef.current?.play();
      }, 500);
    }
  }, []);

  const handleButtonPress = () => {
    // Button press animation
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  const handleSignUp = async () => {
    if (loading) return;

    handleButtonPress();
    setLoading(true);
    setError(null);

    try {
      // Parse interests as array if it's a string
      const interestsArray =
        typeof data.interests === "string" && data.interests
          ? (data.interests as string)
              .split(",")
              .map((interest) => interest.trim())
              .filter((interest) => interest.length > 0)
          : Array.isArray(data.interests)
          ? data.interests
          : [];

      await signUp(data.email, data.password, data.name, {
        bio: data.bio || "Hello, I'm new here!",
        age: parseInt(data.age) || 0,
        gender: data.gender,
        interests: interestsArray,
        photos: data.photos || [],
      });

      // Show success state
      setSuccess(true);

      // Navigate to home after a delay to show success animation
      setTimeout(() => {
        router.replace("/");
      }, 2000);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
      opacity: cardOpacity.value,
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  return (
    <View style={styles.container}>
      <StepContainer
        title="Almost there!"
        subtitle="Review your information and create your account"
        nextLabel={loading ? "Creating..." : "Create Account"}
        onNext={handleSignUp}
        nextDisabled={loading}
      >
        <Animated.View style={[styles.card, animatedCardStyle]}>
          {/* Profile Summary */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {data.photos && data.photos.length > 0 ? (
                <Animated.Image
                  source={{ uri: data.photos[0] }}
                  style={styles.avatar}
                  sharedTransitionTag="profile-image"
                />
              ) : (
                <View style={styles.noAvatar}>
                  <MaterialCommunityIcons
                    name="account"
                    size={50}
                    color="#666"
                  />
                </View>
              )}
            </View>

            <Text style={styles.name}>{data.name}</Text>
            <Text style={styles.email}>{data.email}</Text>

            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={16}
                  color="#666"
                />
                <Text style={styles.detailText}>{data.age} years old</Text>
              </View>

              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="gender-male-female"
                  size={16}
                  color="#666"
                />
                <Text style={styles.detailText}>
                  {data.gender.charAt(0).toUpperCase() + data.gender.slice(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* Photo count */}
          {data.photos && data.photos.length > 0 && (
            <View style={styles.photoCountContainer}>
              <MaterialCommunityIcons
                name="image-multiple"
                size={16}
                color="#666"
              />
              <Text style={styles.photoCountText}>
                {data.photos.length} photo{data.photos.length !== 1 ? "s" : ""}{" "}
                added
              </Text>
            </View>
          )}

          <Text style={styles.readyText}>Ready to join the community?</Text>
        </Animated.View>

        {/* Success animation */}
        {success && (
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 400 }}
            style={styles.successOverlay}
          >
            <LottieView
              ref={animationRef}
              source={require("../../../assets/animations/success.json")}
              autoPlay
              loop={false}
              style={styles.lottieAnimation}
            />
            <Text style={styles.successText}>Account Created!</Text>
          </MotiView>
        )}

        {/* Error message */}
        {error && (
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 15 }}
            style={styles.errorContainer}
          >
            <MaterialCommunityIcons
              name="alert-circle"
              size={20}
              color="#FF3B30"
            />
            <Text style={styles.errorText}>{error}</Text>
          </MotiView>
        )}
      </StepContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFF",
  },
  noAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detailText: {
    marginLeft: 6,
    color: "#666",
    fontSize: 12,
  },
  photoCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  photoCountText: {
    marginLeft: 6,
    color: "#4A90E2",
    fontSize: 12,
  },
  readyText: {
    fontSize: 16,
    color: "#FF6B6B",
    fontWeight: "600",
    textAlign: "center",
  },
  ctaButton: {
    width: "100%",
    backgroundColor: "#FF6B6B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  ctaButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
  successText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#34C759",
    marginTop: 10,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F8",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    marginLeft: 8,
    flex: 1,
  },
});

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MotiView } from "moti";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  safeAnimationConfig,
  safeOutputRange,
} from "../../src/utils/animationUtils";

const { width, height } = Dimensions.get("window");

// Define component as function declaration for clarity
export default function AuthScreen() {
  const router = useRouter();

  // Animation references
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequence animation for a smooth intro
    Animated.stagger(200, [
      Animated.spring(
        logoAnim,
        safeAnimationConfig({
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        })
      ),
      Animated.spring(
        textAnim,
        safeAnimationConfig({
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        })
      ),
      Animated.spring(
        buttonsAnim,
        safeAnimationConfig({
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        })
      ),
    ]).start();

    // Create subtle pulsating effect for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(
          pulseAnim,
          safeAnimationConfig({
            toValue: 1.1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ),
        Animated.timing(
          pulseAnim,
          safeAnimationConfig({
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ),
      ])
    ).start();
  }, []);

  const handleButtonPress = (path: string) => {
    // Create a bounce effect before navigation
    Animated.sequence([
      Animated.timing(
        buttonsAnim,
        safeAnimationConfig({
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        })
      ),
      Animated.spring(
        buttonsAnim,
        safeAnimationConfig({
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        })
      ),
    ]).start(() => {
      router.push(path);
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../../assets/images/background.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            {/* Animated Logo */}
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  opacity: logoAnim,
                  transform: [
                    { scale: logoAnim },
                    {
                      translateY: logoAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: safeOutputRange([50, 0]),
                      }),
                    },
                  ],
                },
              ]}
            >
              <MotiView
                from={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "timing",
                  duration: 800,
                  delay: 300,
                }}
                style={styles.glowEffect}
              />
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                }}
              >
                <LinearGradient
                  colors={["#FF6B6B", "#FF8E8E", "#FFB4B4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientLogo}
                >
                  <MaterialCommunityIcons name="fire" size={60} color="white" />
                </LinearGradient>
              </Animated.View>
            </Animated.View>

            {/* Animated Text */}
            <Animated.View
              style={[
                styles.textContainer,
                {
                  opacity: textAnim,
                  transform: [
                    {
                      translateY: textAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: safeOutputRange([30, 0]),
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.welcomeTitle}>Welcome to 2UO</Text>
              <Text style={styles.welcomeText}>
                Connect with your friends and go on a double-date
              </Text>
            </Animated.View>

            {/* Animated Buttons */}
            <Animated.View
              style={[
                styles.buttonsContainer,
                {
                  opacity: buttonsAnim,
                  transform: [
                    {
                      translateY: buttonsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: safeOutputRange([30, 0]),
                      }),
                    },
                    {
                      scale: buttonsAnim,
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.authButton, styles.signinButton]}
                onPress={() => handleButtonPress("/auth/signin")}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="login" size={20} color="white" />
                <Text style={styles.authButtonText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.authButton, styles.signupButton]}
                onPress={() => handleButtonPress("/auth/signup")}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="account-plus"
                  size={20}
                  color="white"
                />
                <Text style={styles.authButtonText}>Create Account</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    position: "relative",
  },
  glowEffect: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 15,
    zIndex: -1,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
    resizeMode: "contain",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  welcomeText: {
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
    opacity: 0.9,
    maxWidth: "80%",
  },
  buttonsContainer: {
    width: "100%",
    alignItems: "center",
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signinButton: {
    backgroundColor: "#FF6B6B",
  },
  signupButton: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  authButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
});

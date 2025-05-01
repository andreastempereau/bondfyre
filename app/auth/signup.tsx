import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import { useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput, FormButton, signUpSchema } from "../components/forms";
import { SignUpFormData } from "../components/forms/validationSchemas";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signUpSchema) as unknown as Resolver<SignUpFormData>,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: "",
      gender: "",
      bio: "Hello, I'm new here!",
      interests: "technology, travel, music",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignUpFormData) => {
    setGeneralError(null);
    setLoading(true);

    try {
      // Parse interests as array
      const interestsArray = data.interests
        ? data.interests
            .split(",")
            .map((interest) => interest.trim())
            .filter((interest) => interest.length > 0)
        : [];

      await signUp(data.email, data.password, data.name, {
        bio: data.bio || "",
        age: parseInt(data.age) || 0,
        gender: data.gender,
        interests: interestsArray,
        photos: [],
      });

      // Router navigation will be handled by the useEffect in AuthContext
      console.log("User registered successfully");
    } catch (error: any) {
      console.error("Signup error:", error);
      setGeneralError(error.message || "Registration failed");
      Alert.alert(
        "Registration Failed",
        error.message || "Something went wrong during registration"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>bondfyre</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the community</Text>

            {generalError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            )}

            <FormInput<SignUpFormData>
              control={control}
              name="name"
              label="Full Name"
              placeholder="Your full name"
              icon="account"
              error={errors.name}
              autoCapitalize="words"
            />

            <FormInput<SignUpFormData>
              control={control}
              name="email"
              label="Email"
              placeholder="Your email address"
              icon="email"
              keyboardType="email-address"
              error={errors.email}
              autoCapitalize="none"
            />

            <FormInput<SignUpFormData>
              control={control}
              name="password"
              label="Password"
              placeholder="Create a password"
              icon="lock"
              secureTextEntry={!passwordVisible}
              error={errors.password}
              showPasswordToggle
              onTogglePassword={() => setPasswordVisible(!passwordVisible)}
              isPasswordVisible={passwordVisible}
            />

            <FormInput<SignUpFormData>
              control={control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
              icon="lock-check"
              secureTextEntry={!confirmPasswordVisible}
              error={errors.confirmPassword}
              showPasswordToggle
              onTogglePassword={() =>
                setConfirmPasswordVisible(!confirmPasswordVisible)
              }
              isPasswordVisible={confirmPasswordVisible}
            />

            <FormInput<SignUpFormData>
              control={control}
              name="age"
              label="Age"
              placeholder="Your age"
              icon="calendar"
              keyboardType="numeric"
              error={errors.age}
            />

            <FormInput<SignUpFormData>
              control={control}
              name="gender"
              label="Gender"
              placeholder="male/female/other"
              icon="gender-male-female"
              error={errors.gender}
            />

            <FormInput<SignUpFormData>
              control={control}
              name="bio"
              label="Bio (Optional)"
              placeholder="Tell us about yourself"
              icon="text"
              error={errors.bio}
              multiline
              numberOfLines={4}
            />

            <FormInput<SignUpFormData>
              control={control}
              name="interests"
              label="Interests (Optional)"
              placeholder="Interests (comma-separated)"
              icon="tag-multiple"
              error={errors.interests}
            />

            <FormButton
              title="Sign Up"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.button}
            />

            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={() => router.push("/auth/signin")}>
                <Text style={styles.linkText}>
                  Already have an account?{" "}
                  <Text style={styles.linkHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#FF6B6B",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    marginTop: 20,
  },
  errorContainer: {
    backgroundColor: "#FFEEEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
  },
  linkContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    color: "#666",
  },
  linkHighlight: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
});

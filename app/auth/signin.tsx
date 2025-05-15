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
import { useAuth } from "../../src/contexts/AuthContext";
import { StatusBar } from "expo-status-bar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput, FormButton, signInSchema } from "../../src/components/forms";

// Define the form data type to match the schema
type SignInFormData = {
  email: string;
  password: string;
};

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignInFormData) => {
    setGeneralError(null);
    setLoading(true);

    try {
      await signIn(data.email, data.password);
      // No need to navigate here as the useEffect in AuthContext will handle navigation
    } catch (error: any) {
      setGeneralError(error.message || "Invalid email or password");
      Alert.alert(
        "Sign In Failed",
        error.message || "Invalid email or password. Please try again."
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
            <Text style={styles.logoText}>2UO</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            {generalError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            )}

            <FormInput<SignInFormData>
              control={control}
              name="email"
              label="Email"
              placeholder="Your email address"
              icon="email"
              keyboardType="email-address"
              error={errors.email}
              autoCapitalize="none"
            />

            <FormInput<SignInFormData>
              control={control}
              name="password"
              label="Password"
              placeholder="Your password"
              icon="lock"
              secureTextEntry={!passwordVisible}
              error={errors.password}
              showPasswordToggle
              onTogglePassword={() => setPasswordVisible(!passwordVisible)}
              isPasswordVisible={passwordVisible}
            />

            <FormButton
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.button}
            />

            <View style={styles.linkContainer}>
              <TouchableOpacity onPress={() => router.push("/auth/signup")}>
                <Text style={styles.linkText}>
                  Don't have an account?{" "}
                  <Text style={styles.linkHighlight}>Sign Up</Text>
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
    justifyContent: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
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
    marginTop: 10,
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

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Config } from "../config/environment";
import { API_URL } from "../config";

export default function AuthScreen() {
  const { signIn } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [interests, setInterests] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to save auth data directly without using the token as email
  const saveAuthDataDirectly = async (token: string, userData: any) => {
    try {
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, token);
      await AsyncStorage.setItem(
        Config.STORAGE_KEYS.USER_DATA,
        JSON.stringify(userData)
      );
      console.log("Auth data saved successfully");
    } catch (error) {
      console.error("Failed to save auth data:", error);
    }
  };

  const handleAuth = async () => {
    try {
      setError("");
      setIsLoading(true);

      if (isLogin) {
        // Login logic - directly use the signIn function with email and password
        console.log("Attempting login with:", { email, password });
        await signIn(email, password);
        router.replace("/(tabs)");
      } else {
        // Validate required fields
        if (!name || !email || !password || !age || !gender) {
          throw new Error("Please fill in all required fields");
        }

        // Parse interests as array
        const interestsArray = interests
          .split(",")
          .map((interest) => interest.trim())
          .filter((interest) => interest.length > 0);

        // Signup logic with profile information
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            name,
            profile: {
              bio,
              age: parseInt(age),
              gender,
              interests: interestsArray,
              photos: [],
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        // After registration, use the proper signIn method with email/password
        await signIn(email, password);
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      Alert.alert("Error", err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>2UO</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>

          {!isLogin && (
            <>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name *"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Age *"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="gender-male-female"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Gender (male/female/other) *"
                  value={gender}
                  onChangeText={setGender}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="information"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Bio"
                  value={bio}
                  onChangeText={setBio}
                  multiline
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="tag"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Interests (comma separated)"
                  value={interests}
                  onChangeText={setInterests}
                />
              </View>
            </>
          )}

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FF6B6B",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    marginTop: 20,
    alignItems: "center",
  },
  switchText: {
    color: "#666",
    fontSize: 14,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 10,
  },
});

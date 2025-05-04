import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function AuthScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.logoImage}
      />
      <Text style={styles.welcomeTitle}>Welcome to Bondfyre</Text>
      <Text style={styles.welcomeText}>
        Connect with like-minded people and join communities
      </Text>

      <TouchableOpacity
        style={styles.authButton}
        onPress={() => router.push("/auth/signin")}
      >
        <FontAwesome name="sign-in" size={20} color="white" />
        <Text style={styles.authButtonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.authButton, styles.signupButton]}
        onPress={() => router.push("/auth/signup")}
      >
        <FontAwesome name="user-plus" size={20} color="white" />
        <Text style={styles.authButtonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: "contain",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B6B",
    width: "80%",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  signupButton: {
    backgroundColor: "#4A90E2",
  },
  authButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

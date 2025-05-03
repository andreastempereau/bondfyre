import React, { useEffect } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function SignUpScreen() {
  useEffect(() => {
    router.replace("/auth/signup-steps/name");
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6B6B" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

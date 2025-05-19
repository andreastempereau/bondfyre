import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

// Define props type
type EmptyStateProps = {
  title?: string;
  subtitle?: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  errorMessage?: string;
};

// Use memo to prevent unnecessary re-renders
const EmptyState = memo(function EmptyState(props: EmptyStateProps) {
  const title = props.title || "No more people to show!";
  const subtitle = props.subtitle || "Check back later for new matches!";
  const icon = props.icon || "compass";
  const errorMessage = props.errorMessage;

  return (
    <View style={styles.container}>
      <FontAwesome name={icon} size={64} color="#999" />
      <Text style={styles.title}>{errorMessage || title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
});

// Add displayName for better debugging
EmptyState.displayName = "EmptyState";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    minHeight: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
  },
});

export default EmptyState;

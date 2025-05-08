import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  errorMessage?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No more people to show!",
  subtitle = "Check back later for new matches!",
  icon = "compass",
  errorMessage,
}) => {
  return (
    <View style={styles.container}>
      <FontAwesome name={icon} size={64} color="#999" />
      <Text style={styles.title}>{errorMessage || title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

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

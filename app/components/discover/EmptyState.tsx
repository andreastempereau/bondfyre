import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No more groups to show!",
  subtitle = "Check back later for new matches!",
  icon = "compass",
}) => {
  return (
    <View style={styles.container}>
      <FontAwesome name={icon} size={64} color="#999" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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

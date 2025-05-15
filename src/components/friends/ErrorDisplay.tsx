import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Text from "../../components/ui/Text";
import { FontAwesome } from "@expo/vector-icons";

interface ErrorDisplayProps {
  error: string | null;
  onRetry: () => void;
  onDebug: () => void;
  onRefreshToken: () => Promise<boolean>;
  primaryColor: string;
}

const ErrorDisplay = ({
  error,
  onRetry,
  onDebug,
  onRefreshToken,
  primaryColor,
}: ErrorDisplayProps) => {
  return (
    <View style={styles.errorContainer}>
      <FontAwesome
        name="exclamation-triangle"
        size={50}
        color="#FF6B6B"
        style={styles.errorIcon}
      />

      <Text style={styles.errorText}>{error}</Text>

      <View style={styles.errorButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor }]}
          onPress={onRetry}
        >
          <Text style={styles.actionButtonText}>Retry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: "#4A90E2", marginTop: 12 },
          ]}
          onPress={onDebug}
        >
          <Text style={styles.actionButtonText}>Debug Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: "#50C878", marginTop: 12 },
          ]}
          onPress={onRefreshToken}
        >
          <Text style={styles.actionButtonText}>Refresh Token</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  errorButtonsContainer: {
    alignItems: "center",
    width: "100%",
    maxWidth: 300,
  },
  actionButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default ErrorDisplay;

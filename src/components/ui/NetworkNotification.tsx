import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { EventRegister } from "react-native-event-listeners";
import { API_EVENTS } from "../../services/apiService";
import { MotiView } from "moti";

const { width } = Dimensions.get("window");

interface NotificationData {
  message: string;
  type: "error" | "warning" | "info" | "success";
}

export const NetworkNotification = () => {
  const [visible, setVisible] = useState(false);
  const [notificationData, setNotificationData] = useState<NotificationData>({
    message: "",
    type: "error",
  });

  useEffect(() => {
    // Listen for network errors
    const networkErrorListener = EventRegister.addEventListener(
      API_EVENTS.NETWORK_ERROR,
      (data: any) => {
        showNotification({
          message:
            data.message || "Network error. Please check your connection.",
          type: "error",
        });
      }
    );

    // Listen for auth errors
    const authErrorListener = EventRegister.addEventListener(
      API_EVENTS.AUTH_ERROR,
      (data: any) => {
        showNotification({
          message: data.message || "Authentication error.",
          type: "warning",
        });
      }
    );

    // Listen for server errors
    const serverErrorListener = EventRegister.addEventListener(
      API_EVENTS.SERVER_ERROR,
      (data: any) => {
        showNotification({
          message: data.message || "Server error. Please try again later.",
          type: "warning",
        });
      }
    );

    return () => {
      // Clean up listeners
      EventRegister.removeEventListener(networkErrorListener as string);
      EventRegister.removeEventListener(authErrorListener as string);
      EventRegister.removeEventListener(serverErrorListener as string);
    };
  }, []);

  const showNotification = (data: NotificationData) => {
    // Set notification data
    setNotificationData(data);
    setVisible(true);

    // Auto-hide after 4 seconds
    setTimeout(() => {
      setVisible(false);
    }, 4000);
  };

  // If not visible, don't render anything
  if (!visible) {
    return null;
  }

  // Get icon based on notification type
  const getIcon = () => {
    switch (notificationData.type) {
      case "error":
        return "exclamation-circle";
      case "warning":
        return "exclamation-triangle";
      case "info":
        return "info-circle";
      case "success":
        return "check-circle";
      default:
        return "info-circle";
    }
  };

  // Get color based on notification type
  const getColor = () => {
    switch (notificationData.type) {
      case "error":
        return "#dc3545";
      case "warning":
        return "#ffc107";
      case "info":
        return "#17a2b8";
      case "success":
        return "#28a745";
      default:
        return "#17a2b8";
    }
  };

  return (
    <MotiView
      style={[styles.container, { backgroundColor: getColor() }]}
      from={{ opacity: 0, translateY: -50 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -50 }}
      transition={{ type: "timing", duration: 300 }}
    >
      <FontAwesome
        name={getIcon()}
        size={20}
        color="white"
        style={styles.icon}
      />
      <Text style={styles.message}>{notificationData.message}</Text>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 9999,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    color: "white",
    fontWeight: "500",
    flex: 1,
  },
});

export default NetworkNotification;

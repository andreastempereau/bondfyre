// This is a fallback component for platforms other than iOS
import { StyleSheet, View } from "react-native";

export default function TabBarBackground() {
  // Simple implementation for Android/Web
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
});

export function useBottomTabOverflow() {
  return 0;
}

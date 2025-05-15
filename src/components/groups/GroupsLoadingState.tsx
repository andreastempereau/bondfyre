import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Text from "../ui/Text";
import { useThemeColor } from "../../hooks/useThemeColor";

export default function GroupsLoadingState() {
  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={primaryColor} />
      <Text style={[styles.text, { color: textColor }]}>Loading groups...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  text: {
    fontSize: 16,
    marginTop: 16,
  },
});

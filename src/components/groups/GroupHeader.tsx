import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import Text from "../ui/Text";
import { GroupHeaderProps } from "./types";
import { useThemeColor } from "../../hooks/useThemeColor";

export default function GroupHeader({
  title,
  subtitle,
  rightComponent,
}: GroupHeaderProps) {
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: mutedTextColor }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent && (
        <View style={styles.rightComponent}>{rightComponent}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  rightComponent: {
    flexDirection: "row",
    alignItems: "center",
  },
});

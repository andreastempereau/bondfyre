import React from "react";
import { StyleSheet, TextProps } from "react-native";
import { useColorScheme } from "react-native";
import Text from "../ui/Text";
import { theme } from "../../theme";

interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?: "title" | "subtitle" | "link" | "defaultSemiBold" | string;
}

const ThemedText: React.FC<ThemedTextProps> = ({
  style,
  lightColor,
  darkColor,
  type,
  children,
  ...props
}) => {
  const colorScheme = useColorScheme() || "light";
  const schemeType = colorScheme as "light" | "dark";
  const isDark = colorScheme === "dark";

  const color = isDark
    ? darkColor || theme.palette.text.primary.dark
    : lightColor || theme.palette.text.primary.light;

  // Define text styles based on type
  let typeStyle = {};
  if (type === "title") {
    typeStyle = { fontSize: 24, fontWeight: "bold" };
  } else if (type === "subtitle") {
    typeStyle = { fontSize: 18, fontWeight: "600" };
  } else if (type === "link") {
    // Use the correct primary color properties based on the theme structure
    const linkColor = isDark
      ? theme.palette.primaryDark
      : theme.palette.primary;
    typeStyle = { color: linkColor, textDecorationLine: "underline" };
  } else if (type === "defaultSemiBold") {
    typeStyle = { fontWeight: "600" as const };
  }

  return (
    <Text style={[{ color }, typeStyle, style]} {...props}>
      {children}
    </Text>
  );
};

export default ThemedText;

import React from "react";
import { View, StyleSheet, ViewProps, ViewStyle } from "react-native";
import { theme } from "../../theme";
import { useColorScheme } from "react-native";

interface CardProps extends ViewProps {
  variant?: "elevated" | "outlined" | "filled";
  elevation?: "none" | "sm" | "md" | "lg" | "xl";
  radius?: keyof typeof theme.borderRadius;
  padding?: keyof typeof theme.spacing | number;
}

const Card: React.FC<CardProps> = ({
  variant = "elevated",
  elevation = "md",
  radius = "md",
  padding = "md",
  style,
  children,
  ...rest
}) => {
  const colorScheme = useColorScheme() || "light";
  const isDark = colorScheme === "dark";

  const cardStyles: ViewStyle[] = [
    styles.base,
    styles[variant],
    elevation !== "none" && theme.shadows[elevation],
    { borderRadius: theme.borderRadius[radius] },
    typeof padding === "number"
      ? { padding }
      : { padding: theme.spacing[padding] },
    isDark && styles[`${variant}Dark`],
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  return (
    <View style={cardStyles} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
  elevated: {
    backgroundColor: theme.palette.surface.light,
  },
  elevatedDark: {
    backgroundColor: theme.palette.surface.dark,
  },
  outlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.palette.grey[300],
  },
  outlinedDark: {
    borderColor: theme.palette.grey[700],
  },
  filled: {
    backgroundColor: theme.palette.grey[50],
  },
  filledDark: {
    backgroundColor: theme.palette.grey[900],
  },
});

export default Card;

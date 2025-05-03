import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";

export interface FormButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
  fullWidth?: boolean;
  size?: "small" | "medium" | "large";
}

export function FormButton({
  title,
  loading = false,
  variant = "primary",
  fullWidth = true,
  size = "medium",
  style,
  disabled,
  ...props
}: FormButtonProps) {
  const getButtonStyle = () => {
    const styles: StyleProp<ViewStyle>[] = [buttonStyles.button];

    // Variant styles
    if (variant === "primary") styles.push(buttonStyles.primaryButton);
    if (variant === "secondary") styles.push(buttonStyles.secondaryButton);
    if (variant === "outline") styles.push(buttonStyles.outlineButton);
    if (variant === "danger") styles.push(buttonStyles.dangerButton);

    // Size styles
    if (size === "small") styles.push(buttonStyles.smallButton);
    if (size === "large") styles.push(buttonStyles.largeButton);

    // Width style
    if (fullWidth) styles.push(buttonStyles.fullWidth);

    // Disabled style
    if (disabled || loading) styles.push(buttonStyles.disabledButton);

    // Custom style
    if (style) styles.push(style);

    return styles;
  };

  const getTextStyle = () => {
    const styles: StyleProp<TextStyle>[] = [buttonStyles.buttonText];

    // Variant text styles
    if (variant === "primary") styles.push(buttonStyles.primaryText);
    if (variant === "secondary") styles.push(buttonStyles.secondaryText);
    if (variant === "outline") styles.push(buttonStyles.outlineText);
    if (variant === "danger") styles.push(buttonStyles.dangerText);

    // Size text styles
    if (size === "small") styles.push(buttonStyles.smallText);
    if (size === "large") styles.push(buttonStyles.largeText);

    // Disabled text style
    if (disabled || loading) styles.push(buttonStyles.disabledText);

    return styles;
  };

  const getLoaderColor = () => {
    if (variant === "outline") return "#FF6B6B";
    return "white";
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getLoaderColor()} size="small" />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const buttonStyles = StyleSheet.create({
  button: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  primaryButton: {
    backgroundColor: "#FF6B6B",
  },
  secondaryButton: {
    backgroundColor: "#4A90E2",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  dangerButton: {
    backgroundColor: "#FF3B30",
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  largeButton: {
    paddingVertical: 16,
  },
  fullWidth: {
    width: "100%",
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "white",
  },
  secondaryText: {
    color: "white",
  },
  outlineText: {
    color: "#FF6B6B",
  },
  dangerText: {
    color: "white",
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    opacity: 0.8,
  },
});

export default FormButton;

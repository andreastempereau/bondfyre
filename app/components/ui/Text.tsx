import React from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
} from "react-native";
import { theme } from "../../theme";
import { useColorScheme } from "react-native";

export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "button"
  | "caption"
  | "overline";

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: "auto" | "left" | "right" | "center" | "justify";
  weight?:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  italic?: boolean;
  underline?: boolean;
  lineThrough?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
}

const Text: React.FC<TextProps> = ({
  variant = "body1",
  color,
  align,
  weight,
  italic,
  underline,
  lineThrough,
  uppercase,
  lowercase,
  capitalize,
  style,
  children,
  ...rest
}) => {
  const colorScheme = useColorScheme() || "light";

  // Generate text style based on props
  const textStyles = [
    styles[variant],
    color
      ? { color }
      : { color: theme.palette.text.primary[colorScheme as "light" | "dark"] },
    align ? { textAlign: align } : null,
    weight ? { fontWeight: weight } : null,
    italic ? { fontStyle: "italic" } : null,
    underline ? { textDecorationLine: "underline" } : null,
    lineThrough ? { textDecorationLine: "line-through" } : null,
    underline && lineThrough
      ? { textDecorationLine: "underline line-through" }
      : null,
    uppercase ? { textTransform: "uppercase" } : null,
    lowercase ? { textTransform: "lowercase" } : null,
    capitalize ? { textTransform: "capitalize" } : null,
    style,
  ].filter(Boolean);

  return (
    <RNText style={textStyles} {...rest}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  h1: theme.typography.h1,
  h2: theme.typography.h2,
  h3: theme.typography.h3,
  h4: theme.typography.h4,
  h5: theme.typography.h5,
  subtitle1: theme.typography.subtitle1,
  subtitle2: theme.typography.subtitle2,
  body1: theme.typography.body1,
  body2: theme.typography.body2,
  button: theme.typography.button,
  caption: theme.typography.caption,
  overline: theme.typography.overline,
});

export default Text;

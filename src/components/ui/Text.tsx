import React from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
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
    weight ? { fontWeight: weight as TextStyle["fontWeight"] } : null,
    italic ? { fontStyle: "italic" as TextStyle["fontStyle"] } : null,
    underline
      ? { textDecorationLine: "underline" as TextStyle["textDecorationLine"] }
      : null,
    lineThrough
      ? {
          textDecorationLine: "line-through" as TextStyle["textDecorationLine"],
        }
      : null,
    underline && lineThrough
      ? {
          textDecorationLine:
            "underline line-through" as TextStyle["textDecorationLine"],
        }
      : null,
    uppercase
      ? { textTransform: "uppercase" as TextStyle["textTransform"] }
      : null,
    lowercase
      ? { textTransform: "lowercase" as TextStyle["textTransform"] }
      : null,
    capitalize
      ? { textTransform: "capitalize" as TextStyle["textTransform"] }
      : null,
    style,
  ].filter(Boolean);

  return (
    <RNText style={textStyles} {...rest}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  h1: theme.typography.h1 as TextStyle,
  h2: theme.typography.h2 as TextStyle,
  h3: theme.typography.h3 as TextStyle,
  h4: theme.typography.h4 as TextStyle,
  h5: theme.typography.h5 as TextStyle,
  subtitle1: theme.typography.subtitle1 as TextStyle,
  subtitle2: theme.typography.subtitle2 as TextStyle,
  body1: theme.typography.body1 as TextStyle,
  body2: theme.typography.body2 as TextStyle,
  button: theme.typography.button as TextStyle,
  caption: theme.typography.caption as TextStyle,
  overline: theme.typography.overline as TextStyle,
});

export default Text;

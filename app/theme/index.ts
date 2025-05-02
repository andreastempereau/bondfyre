/**
 * Theme configuration for the application.
 * This centralizes all theme-related values and provides
 * consistent styling across the application.
 */

import { Dimensions } from "react-native";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

// Consistent spacing values
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 64,
};

// Color palette
const palette = {
  // Primary colors
  primary: "#FF6B6B", // Updated to match the red used across the app
  primaryLight: "#FFA8A8",
  primaryDark: "#E53E3E",

  // Secondary colors
  secondary: "#03DAC6",
  secondaryDark: "#018786",

  // Neutral colors
  background: {
    light: "#FFFFFF",
    dark: "#121212",
  },
  surface: {
    light: "#FFFFFF",
    dark: "#1E1E1E",
  },

  // Text colors
  text: {
    primary: {
      light: "#000000DE", // 87% opacity
      dark: "#FFFFFFDE",
    },
    secondary: {
      light: "#0000008A", // 54% opacity
      dark: "#FFFFFF8A",
    },
    disabled: {
      light: "#00000061", // 38% opacity
      dark: "#FFFFFF61",
    },
  },

  // Status colors
  error: "#B00020",
  success: "#00C853",
  warning: "#FB8C00",
  info: "#2196F3",

  // Common colors
  grey: {
    50: "#FAFAFA",
    100: "#F5F5F5",
    200: "#EEEEEE",
    300: "#E0E0E0",
    400: "#BDBDBD",
    500: "#9E9E9E",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },
};

// Typography scale
const typography = {
  h1: {
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 0.25,
  },
  h2: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 0,
  },
  h3: {
    fontSize: 24,
    fontWeight: "500",
    letterSpacing: 0.15,
  },
  h4: {
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: 0.15,
  },
  h5: {
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 0.15,
  },
  subtitle1: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.15,
  },
  subtitle2: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  body1: {
    fontSize: 16,
    fontWeight: "normal",
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: 14,
    fontWeight: "normal",
    letterSpacing: 0.25,
  },
  button: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 1.25,
    textTransform: "uppercase",
  },
  caption: {
    fontSize: 12,
    fontWeight: "normal",
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: 10,
    fontWeight: "normal",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
};

// Border radius values
const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

// Shadow styles for different elevations
const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// Screen dimensions
const dimensions = {
  window: {
    width: windowWidth,
    height: windowHeight,
  },
  // Common screen sizes for responsive design
  isSmallDevice: windowWidth < 375,
  isMiddleDevice: windowWidth >= 375 && windowWidth < 414,
  isLargeDevice: windowWidth >= 414,
};

// Create and export the theme object
export const theme = {
  palette,
  spacing,
  typography,
  borderRadius,
  shadows,
  dimensions,
};

// Add default export to fix the required default export warning
export default theme;

// Define TypeScript types for theme
export type Theme = typeof theme;

/**
 * Helper function to get appropriate colors based on the current color scheme
 */
export const getThemeColors = (mode: "light" | "dark") => {
  return {
    background: palette.background[mode],
    surface: palette.surface[mode],
    text: {
      primary: palette.text.primary[mode],
      secondary: palette.text.secondary[mode],
      disabled: palette.text.disabled[mode],
    },
  };
};

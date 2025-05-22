import { Platform } from "react-native";

/**
 * Animation utilities for preventing NaN errors in animations
 */

/**
 * Safely transform a value, preventing NaN values that cause CoreGraphics errors
 * @param value The value to validate
 * @param fallback Fallback value if the input is NaN
 * @returns The input value if valid, or the fallback value
 */
export const safeAnimationValue = (
  value: number | undefined | null,
  fallback: number = 0
): number => {
  if (value === undefined || value === null || isNaN(value)) {
    return fallback;
  }
  return value;
};

/**
 * Creates a safe animation config with platform-specific settings
 * @param config Base animation config
 * @returns Safe animation config
 */
export const safeAnimationConfig = (config: any) => {
  // Make a copy to avoid modifying the original
  const safeConfig = { ...config };

  // Always make sure useNativeDriver is explicitly set to reduce warning noise
  if (safeConfig.useNativeDriver === undefined) {
    safeConfig.useNativeDriver = true;
  }

  // Add iOS-specific fixes for CoreGraphics errors
  if (Platform.OS === "ios") {
    // Ensure safe transform values
    if (safeConfig.toValue !== undefined) {
      safeConfig.toValue = safeAnimationValue(safeConfig.toValue);
    }
  }

  return safeConfig;
};

/**
 * Creates a safe interpolation output range by ensuring no NaN values
 * @param outputRange Original output range array
 * @returns Safe output range with NaN values replaced by 0
 */
export const safeOutputRange = (outputRange: Array<number>): Array<number> => {
  return outputRange.map((value) => safeAnimationValue(value));
};

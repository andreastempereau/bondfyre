/**
 * Utility functions for React Native Reanimated to prevent NaN errors
 */
import { Easing } from "react-native-reanimated";

/**
 * Safely wrap withSpring config to prevent NaN errors
 */
export const safeSpringConfig = (config: any) => {
  return {
    damping: config.damping || 10,
    mass: config.mass || 1,
    stiffness: config.stiffness || 100,
    overshootClamping: config.overshootClamping || false,
    restDisplacementThreshold: config.restDisplacementThreshold || 0.01,
    restSpeedThreshold: config.restSpeedThreshold || 2,
    // Add any other props
    ...config,
  };
};

/**
 * Safely wrap withTiming config to prevent NaN errors
 */
export const safeTimingConfig = (config: any) => {
  return {
    duration: config.duration || 300,
    easing: config.easing || Easing.inOut(Easing.quad),
    // Add any other props
    ...config,
  };
};

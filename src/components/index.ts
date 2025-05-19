/**
 * Component exports
 * This file centralizes all component exports to enable cleaner imports
 * throughout the application
 */

// UI Components
export * from "./ui/Button";
export * from "./ui/Text";
export { default as IconSymbol } from "./ui/IconSymbol";

// Layout Components
export * from "./layout/ThemedView";
export { ParallaxScrollView } from "./layout/ParallaxScrollView";
export { default as Collapsible } from "./layout/Collapsible";

// Form Components
export * from "./forms";

// Authentication Components
// Authentication is now handled by the AuthScreen from app/auth

// Discovery Components
export * from "./discover";

// Profile Components
export * from "./profile";

// Note: Modal components are imported directly in files where needed to avoid require cycles
// export { default as GroupModal } from "./modals/GroupModal";
// export { default as GroupSettingsModal } from "./modals/GroupSettingsModal";

// Feature Components
export { default as HapticTab } from "./features/HapticTab";
export { default as HelloWave } from "./features/HelloWave";
export { default as ExternalLink } from "./features/ExternalLink";

// Adding default export to prevent Expo Router from treating this as a route
export default {};

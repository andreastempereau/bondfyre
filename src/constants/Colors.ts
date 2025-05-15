/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    primary: "#FF6B6B", // Standardizing on the red color used elsewhere
    card: "#ffffff",
    cardAlt: "#f5f5f7",
    mutedText: "#717171",
    placeholderText: "#A0A0A0",
    inputBackground: "#F5F5F5",
    selectedOptionBackground: "#FF6B6B",
    selectedOptionText: "#FFFFFF",
    optionText: "#757575",
    avatarBackground: "#FF6B6B",
    creatorBadgeBackground: "#FFF0F0",
    creatorBadgeText: "#FF6B6B",
    buttonText: "#FFFFFF",
    danger: "#F44336",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    primary: "#FF6B6B", // Using same red in dark mode for consistency
    card: "#1E1E1E",
    cardAlt: "#252525",
    mutedText: "#9BA1A6",
    placeholderText: "#6C6C6C",
    inputBackground: "#2A2A2A",
    selectedOptionBackground: "#FF6B6B",
    selectedOptionText: "#FFFFFF",
    optionText: "#9BA1A6",
    avatarBackground: "#FF6B6B",
    creatorBadgeBackground: "#3A2A2A",
    creatorBadgeText: "#FF6B6B",
    buttonText: "#FFFFFF",
    danger: "#CF6679",
  },
};

// Adding default export to prevent Expo Router from treating this as a route
export default Colors;

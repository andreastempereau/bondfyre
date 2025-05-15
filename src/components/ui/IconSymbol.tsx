// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import React from "react";
import { OpaqueColorValue, StyleProp, ViewStyle } from "react-native";

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
} as Partial<
  Record<
    SymbolViewProps["name"],
    React.ComponentProps<typeof MaterialIcons>["name"]
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export default function IconSymbol({
  name,
  size = 24,
  weight = "regular",
  scale = "medium",
  style,
  color,
}: {
  name: IconSymbolName;
  size?: number;
  weight?: SymbolWeight;
  scale?: "small" | "medium" | "large";
  style?: StyleProp<ViewStyle>;
  color?: string | OpaqueColorValue;
}) {
  const iconName = MAPPING[name];

  if (!iconName) {
    console.warn(
      `IconSymbol: Could not find a mapping for "${name}". Add one to MAPPING in IconSymbol.tsx.`
    );
    return null;
  }

  return (
    <MaterialIcons name={iconName} size={size} color={color} style={style} />
  );
}

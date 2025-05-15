import { FontAwesome } from "@expo/vector-icons";
import { StyleProp, ViewStyle } from "react-native";

/**
 * iOS-specific implementation of the IconSymbol component.
 * This uses FontAwesome icons on iOS.
 */
export default function IconSymbol({
  name,
  weight = "regular",
  style,
  size = 24,
  color = "#000",
}: {
  name: string;
  weight?: "regular" | "bold";
  style?: StyleProp<ViewStyle>;
  size?: number;
  color?: string;
}) {
  return (
    <FontAwesome name={name as any} size={size} color={color} style={style} />
  );
}

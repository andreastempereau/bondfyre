import { Colors } from "../constants/Colors";
import { useColorScheme } from "./useColorScheme.web";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

// Adding default export to prevent Expo Router from treating this as a route
export default useThemeColor;

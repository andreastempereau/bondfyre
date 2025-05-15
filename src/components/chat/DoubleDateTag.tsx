import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Text from "../ui/Text";

interface DoubleDateTagProps {
  style?: StyleProp<ViewStyle>;
  size?: "small" | "medium" | "large";
}

export const DoubleDateTag: React.FC<DoubleDateTagProps> = ({
  style,
  size = "medium",
}) => {
  // Determine sizes based on the size prop
  let fontSize = 12;
  let iconSize = 10;
  let paddingVertical = 2;
  let paddingHorizontal = 8;

  if (size === "small") {
    fontSize = 10;
    iconSize = 8;
    paddingVertical = 1;
    paddingHorizontal = 6;
  } else if (size === "large") {
    fontSize = 14;
    iconSize = 12;
    paddingVertical = 4;
    paddingHorizontal = 10;
  }

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.tag,
          {
            paddingVertical,
            paddingHorizontal,
          },
        ]}
      >
        <FontAwesome
          name="users"
          size={iconSize}
          color="#FF6B6B"
          style={styles.icon}
        />
        <Text style={[styles.text, { fontSize }]}>Double Date</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  tag: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 4,
  },
  text: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
});

export default DoubleDateTag;

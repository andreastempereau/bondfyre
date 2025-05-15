import React from "react";
import { TouchableOpacity, Linking, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Text from "../ui/Text";
import { theme } from "../../theme";

interface ExternalLinkProps {
  url?: string;
  text?: string;
  href?: string;
  icon?: boolean;
  color?: string;
  children?: React.ReactNode;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({
  url,
  text,
  href,
  icon = true,
  color = theme.palette.primary,
  children,
}) => {
  const handlePress = () => {
    const linkUrl = href || url;
    if (!linkUrl) return;

    Linking.openURL(linkUrl).catch((err) => {
      console.error("Error opening external link:", err);
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {children ? (
        children
      ) : (
        <Text style={[styles.linkText, { color }]}>{text}</Text>
      )}
      {icon && (
        <MaterialIcons
          name="open-in-new"
          size={16}
          color={color}
          style={styles.icon}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  linkText: {
    textDecorationLine: "underline",
  },
  icon: {
    marginLeft: theme.spacing.xs,
  },
});

export default ExternalLink;

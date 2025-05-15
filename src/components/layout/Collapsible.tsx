import React, { PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Text from "../ui/Text";
import { theme } from "../../theme";

interface CollapsibleProps {
  title: string;
  initiallyOpen?: boolean;
}

const Collapsible: React.FC<PropsWithChildren<CollapsibleProps>> = ({
  children,
  title,
  initiallyOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <React.Fragment>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <Text variant="subtitle1" style={styles.headingText}>
          {title}
        </Text>
        <MaterialIcons
          name={isOpen ? "keyboard-arrow-down" : "keyboard-arrow-right"}
          size={24}
          color={theme.palette.primary}
          style={[styles.icon, isOpen ? styles.iconOpen : null]}
        />
      </TouchableOpacity>

      {isOpen && <React.Fragment>{children}</React.Fragment>}
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey[200],
  },
  headingText: {
    flex: 1,
  },
  icon: {
    marginLeft: theme.spacing.sm,
    transform: [{ rotate: "0deg" }],
  },
  iconOpen: {
    transform: [{ rotate: "0deg" }],
  },
});

export default Collapsible;

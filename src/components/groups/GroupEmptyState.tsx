import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../ui/Text";
import { useThemeColor } from "../../hooks/useThemeColor";

interface GroupEmptyStateProps {
  onCreateGroup: () => void;
  onJoinGroup: () => void;
}

export default function GroupEmptyState({
  onCreateGroup,
  onJoinGroup,
}: GroupEmptyStateProps) {
  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/icon.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={[styles.title, { color: textColor }]}>No Groups Yet</Text>

      <Text style={[styles.description, { color: mutedTextColor }]}>
        Create a new group or join an existing one using an invite code
      </Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={onCreateGroup}
        >
          <MaterialCommunityIcons name="plus" size={20} color="white" />
          <Text style={styles.buttonText}>Create Group</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.outlineButton,
            { borderColor: primaryColor },
          ]}
          onPress={onJoinGroup}
        >
          <MaterialCommunityIcons
            name="account-group"
            size={20}
            color={primaryColor}
          />
          <Text style={[styles.buttonText, { color: primaryColor }]}>
            Join Group
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 24,
    opacity: 0.8,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  buttonsContainer: {
    flexDirection: "column",
    width: "100%",
    maxWidth: 280,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});

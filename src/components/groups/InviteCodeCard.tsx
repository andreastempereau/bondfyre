import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Clipboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../ui/Text";
import { InviteCodeCardProps } from "./types";
import { useThemeColor } from "../../hooks/useThemeColor";

export default function InviteCodeCard({
  inviteCode,
  onCopy,
}: InviteCodeCardProps) {
  const backgroundColor = useThemeColor({}, "cardAlt");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");

  const handleCopy = () => {
    Clipboard.setString(inviteCode);
    onCopy();
  };

  // Format the invite code with spaces for better readability
  const formattedCode = inviteCode.replace(/(.{4})/g, "$1 ").trim();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Invite Code</Text>
        <MaterialCommunityIcons name="key" size={20} color={primaryColor} />
      </View>

      <View style={styles.codeContainer}>
        <Text style={[styles.code, { color: primaryColor }]}>
          {formattedCode}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.copyButton, { backgroundColor: primaryColor }]}
        onPress={handleCopy}
      >
        <MaterialCommunityIcons name="content-copy" size={16} color="white" />
        <Text style={styles.copyButtonText}>Copy Code</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Share this code with friends to invite them to your group
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  codeContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  code: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "SpaceMono-Regular",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  copyButtonText: {
    color: "white",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  note: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});

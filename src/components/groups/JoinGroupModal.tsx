import React, { useState } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../ui/Text";
import { JoinGroupModalProps } from "./types";
import { useThemeColor } from "../../hooks/useThemeColor";
import { apiService } from "../../services/apiService";

export default function JoinGroupModal({
  visible,
  onClose,
  onGroupJoined,
  userGroupsCount = 0,
  maxGroups = 2,
}: JoinGroupModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const placeholderColor = useThemeColor({}, "placeholderText");
  const errorColor = useThemeColor({}, "danger");

  const hasReachedMaxGroups = userGroupsCount >= maxGroups;

  const handleSubmit = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }

    try {
      setLoading(true);
      // Updated to use the correct endpoint with the invite code in the request body
      await apiService.post("/groups/join", { inviteCode: inviteCode.trim() });

      setLoading(false);
      setInviteCode("");
      onClose();

      if (onGroupJoined) {
        onGroupJoined();
      }

      Alert.alert("Success", "You have successfully joined the group!");
    } catch (error: any) {
      setLoading(false);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to join group. Please check your invite code and try again."
      );
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View style={[styles.modal, { backgroundColor: cardColor }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={textColor} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: hasReachedMaxGroups
                    ? errorColor
                    : primaryColor,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={
                  hasReachedMaxGroups
                    ? "account-group-outline"
                    : "account-group"
                }
                size={32}
                color="white"
              />
            </View>
          </View>

          <Text style={[styles.title, { color: textColor }]}>Join a Group</Text>

          {hasReachedMaxGroups ? (
            <Text style={[styles.errorMessage, { color: errorColor }]}>
              You've reached the maximum limit of {maxGroups} groups. Leave a
              group before joining a new one.
            </Text>
          ) : (
            <Text style={styles.subtitle}>
              Enter the invite code to join an existing group
            </Text>
          )}

          <TextInput
            style={[
              styles.input,
              { color: textColor, backgroundColor: backgroundColor },
              hasReachedMaxGroups && styles.disabledInput,
            ]}
            placeholder="Enter invite code"
            placeholderTextColor={placeholderColor}
            value={inviteCode}
            onChangeText={setInviteCode}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!hasReachedMaxGroups}
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: primaryColor },
              (loading || hasReachedMaxGroups) && styles.disabledButton,
            ]}
            onPress={handleSubmit}
            disabled={loading || hasReachedMaxGroups}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name={hasReachedMaxGroups ? "block-helper" : "login"}
                  size={20}
                  color="white"
                />
                <Text style={styles.buttonText}>
                  {hasReachedMaxGroups ? "Cannot Join" : "Join Group"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 1,
  },
  iconContainer: {
    marginVertical: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  disabledInput: {
    opacity: 0.5,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 50,
    borderRadius: 8,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});

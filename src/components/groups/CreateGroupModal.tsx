import React, { useState } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../ui/Text";
import { CreateGroupModalProps } from "./types";
import { useThemeColor } from "../../hooks/useThemeColor";
import { apiService } from "../../services/apiService";

export default function CreateGroupModal({
  visible,
  onClose,
  onGroupCreated,
  userGroupsCount,
  maxGroups,
}: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const placeholderColor = useThemeColor({}, "placeholderText");
  const mutedTextColor = useThemeColor({}, "mutedText");

  const canCreateGroup = userGroupsCount < maxGroups;

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    try {
      setLoading(true);

      const response = await apiService.post("/groups", {
        name: name.trim(),
        description: description.trim(),
        isPrivate,
        maxMembers: 2, // Fixed to 2 for this app's requirements
      });

      setLoading(false);
      setName("");
      setDescription("");
      setIsPrivate(false);
      onClose();

      if (onGroupCreated) {
        onGroupCreated();
      }

      Alert.alert("Success", "Group created successfully!");
    } catch (error: any) {
      setLoading(false);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create group"
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

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <View
                style={[styles.iconCircle, { backgroundColor: primaryColor }]}
              >
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={32}
                  color="white"
                />
              </View>
            </View>

            <Text style={[styles.title, { color: textColor }]}>
              Create a Group
            </Text>

            {!canCreateGroup ? (
              <View style={styles.limitReachedContainer}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={32}
                  color="#FF3B30"
                />
                <Text style={styles.limitTitle}>Group Limit Reached</Text>
                <Text style={styles.limitSubtitle}>
                  You can be a member of maximum {maxGroups} groups. Please
                  leave a group to create a new one.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.subtitle}>
                  Create a new group and invite others to join
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Group Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { color: textColor, backgroundColor: backgroundColor },
                    ]}
                    placeholder="Enter group name"
                    placeholderTextColor={placeholderColor}
                    value={name}
                    onChangeText={setName}
                    maxLength={30}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description (Optional)</Text>
                  <TextInput
                    style={[
                      styles.textArea,
                      { color: textColor, backgroundColor: backgroundColor },
                    ]}
                    placeholder="Enter group description"
                    placeholderTextColor={placeholderColor}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    maxLength={200}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.privacyContainer}>
                  <View style={styles.privacyTextContainer}>
                    <Text style={[styles.label, { marginBottom: 0 }]}>
                      Private Group
                    </Text>
                    <Text style={{ color: mutedTextColor, fontSize: 12 }}>
                      Only people with the invite code can join
                    </Text>
                  </View>
                  <Switch
                    value={isPrivate}
                    onValueChange={setIsPrivate}
                    trackColor={{ false: "#767577", true: primaryColor + "80" }}
                    thumbColor={isPrivate ? primaryColor : "#f4f3f4"}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: primaryColor },
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="plus"
                        size={20}
                        color="white"
                      />
                      <Text style={styles.buttonText}>Create Group</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
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
    width: "90%",
    maxWidth: 420,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    maxHeight: "100%",
  },
  scrollContent: {
    padding: 24,
    alignItems: "center",
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
  inputGroup: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  privacyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 24,
  },
  privacyTextContainer: {
    flex: 1,
    marginRight: 16,
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
  limitReachedContainer: {
    alignItems: "center",
    padding: 16,
  },
  limitTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF3B30",
    marginTop: 16,
    marginBottom: 8,
  },
  limitSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
});

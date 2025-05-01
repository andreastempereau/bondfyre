import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  FlatList,
  Clipboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/apiService";
import { Text } from "../index";

interface Member {
  _id: string;
  name: string;
  photos: string[];
}

interface Group {
  _id: string;
  name: string;
  description: string;
  members: Member[];
  interests: string[];
  isPrivate: boolean;
  maxMembers: number;
  creator: string;
}

interface GroupSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
  onLeave: () => void;
  onUpdate: (updates: Partial<Group>) => void;
  isCreator: boolean;
}

export default function GroupSettingsModal({
  visible,
  onClose,
  group,
  onLeave,
  onUpdate,
  isCreator,
}: GroupSettingsModalProps) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [isPrivate, setIsPrivate] = useState(group.isPrivate || false);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleCopyInviteCode = () => {
    Clipboard.setString(group._id);
    Alert.alert("Success", "Invite code copied to clipboard!");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    try {
      setLoading(true);

      const updates = {
        name,
        description,
        isPrivate,
      };

      await apiService.put(`/groups/${group._id}`, updates);

      setLoading(false);
      onUpdate(updates);
      onClose();
      Alert.alert("Success", "Group settings updated successfully!");
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || "Failed to update group settings");
    }
  };

  const handleLeaveGroup = async () => {
    Alert.alert("Leave Group", "Are you sure you want to leave this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);

            await apiService.post(`/groups/${group._id}/leave`);

            setLoading(false);
            onLeave();
            onClose();
          } catch (error: any) {
            setLoading(false);
            Alert.alert("Error", error.message || "Failed to leave group");
          }
        },
      },
    ]);
  };

  const handleDeleteGroup = async () => {
    Alert.alert(
      "Delete Group",
      "Are you sure you want to delete this group? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              await apiService.delete(`/groups/${group._id}`);

              setLoading(false);
              onLeave();
              onClose();
              Alert.alert("Success", "Group deleted successfully!");
            } catch (error: any) {
              setLoading(false);
              Alert.alert("Error", error.message || "Failed to delete group");
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#000" />
          </TouchableOpacity>

          <Text style={styles.title}>Group Settings</Text>

          <View style={styles.section}>
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter group name"
              placeholderTextColor="#A0A0A0"
              editable={isCreator}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter group description"
              placeholderTextColor="#A0A0A0"
              multiline
              numberOfLines={4}
              editable={isCreator}
            />
          </View>

          {isCreator && (
            <View style={styles.section}>
              <Text style={styles.label}>Privacy</Text>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={[styles.option, !isPrivate && styles.selectedOption]}
                  onPress={() => setIsPrivate(false)}
                >
                  <Text
                    style={
                      !isPrivate ? styles.selectedOptionText : styles.optionText
                    }
                  >
                    Public
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.option, isPrivate && styles.selectedOption]}
                  onPress={() => setIsPrivate(true)}
                >
                  <Text
                    style={
                      isPrivate ? styles.selectedOptionText : styles.optionText
                    }
                  >
                    Private
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>
              Members ({group.members.length}/{group.maxMembers})
            </Text>
            <FlatList
              data={group.members}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.memberItem}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberInitials}>
                      {item.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.memberName}>{item.name}</Text>
                  {item._id === group.creator && (
                    <View style={styles.creatorBadge}>
                      <Text style={styles.creatorBadgeText}>Creator</Text>
                    </View>
                  )}
                </View>
              )}
              style={styles.membersList}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Invite Code</Text>
            <View style={styles.inviteCodeContainer}>
              <Text style={styles.inviteCode}>{group._id}</Text>
              <TouchableOpacity
                onPress={handleCopyInviteCode}
                style={styles.copyButton}
              >
                <MaterialCommunityIcons
                  name="content-copy"
                  size={20}
                  color="#6200EE"
                />
              </TouchableOpacity>
            </View>
          </View>

          {isCreator && (
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={isCreator ? handleDeleteGroup : handleLeaveGroup}
          >
            <Text style={styles.buttonText}>
              {isCreator ? "Delete Group" : "Leave Group"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
    width: "100%",
  },
  label: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 15,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  option: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    margin: 5,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: "#6200EE",
  },
  optionText: {
    color: "#757575",
  },
  selectedOptionText: {
    color: "white",
    fontWeight: "500",
  },
  membersList: {
    maxHeight: 150,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6200EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  memberInitials: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
  },
  creatorBadge: {
    backgroundColor: "#EDE7F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creatorBadgeText: {
    color: "#6200EE",
    fontSize: 12,
    fontWeight: "500",
  },
  inviteCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  inviteCode: {
    flex: 1,
    fontSize: 14,
    color: "#757575",
  },
  copyButton: {
    padding: 8,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#6200EE",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#B39DDB",
  },
  dangerButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

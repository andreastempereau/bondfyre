import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/apiService";
import Text from "../ui/Text";

interface GroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated?: () => void;
}

export default function GroupModal({
  visible,
  onClose,
  onGroupCreated,
}: GroupModalProps) {
  const [isCreating, setIsCreating] = useState(true);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    try {
      setLoading(true);

      const response = await apiService.post("/groups", {
        name,
        description: "", // Add default description
        isPrivate: false, // Default to public
        maxMembers: 2, // Fixed to 2 for duo groups
      });

      setLoading(false);
      setName("");
      onClose();
      if (onGroupCreated) {
        onGroupCreated();
      }
      Alert.alert("Success", "Group created successfully!");
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || "Failed to create group");
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }

    try {
      setLoading(true);

      await apiService.post(`/groups/join/${inviteCode}`);

      setLoading(false);
      setInviteCode("");
      onClose();
      if (onGroupCreated) {
        onGroupCreated();
      }
      Alert.alert("Success", "Joined group successfully!");
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || "Failed to join group");
    }
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

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isCreating ? styles.activeTab : null]}
              onPress={() => setIsCreating(true)}
            >
              <Text style={isCreating ? styles.activeTabText : styles.tabText}>
                Create
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isCreating ? styles.activeTab : null]}
              onPress={() => setIsCreating(false)}
            >
              <Text style={!isCreating ? styles.activeTabText : styles.tabText}>
                Join
              </Text>
            </TouchableOpacity>
          </View>

          {isCreating ? (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Group Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter group name"
                placeholderTextColor="#A0A0A0"
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleCreateGroup}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Creating..." : "Create Group"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Invite Code</Text>
              <TextInput
                style={styles.input}
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder="Enter invite code"
                placeholderTextColor="#A0A0A0"
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleJoinGroup}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Joining..." : "Join Group"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
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
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    width: "100%",
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#EAEAEA",
  },
  activeTab: {
    borderBottomColor: "#6200EE",
  },
  tabText: {
    fontSize: 16,
    color: "#757575",
  },
  activeTabText: {
    fontSize: 16,
    color: "#6200EE",
    fontWeight: "500",
  },
  inputContainer: {
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
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#6200EE",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#B39DDB",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

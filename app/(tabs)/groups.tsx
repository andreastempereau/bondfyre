import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { GroupModal, GroupSettingsModal } from "@/app/components";

interface Group {
  _id: string;
  name: string;
  description: string;
  members: Array<{
    _id: string;
    name: string;
    photos: string[];
  }>;
  interests: string[];
  isPrivate: boolean;
  maxMembers: number;
  creator: string;
}

export default function GroupsScreen() {
  const { token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch groups");
      }

      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/groups/${groupId}/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to leave group");
      }

      setGroups(groups.filter((group) => group._id !== groupId));
    } catch (error) {
      console.error("Error leaving group:", error);
      Alert.alert("Error", "Failed to leave group");
    }
  };

  const handleGroupUpdate = (updates: Partial<Group>) => {
    if (selectedGroup) {
      setGroups(
        groups.map((group) =>
          group._id === selectedGroup._id ? { ...group, ...updates } : group
        )
      );
    }
  };

  const renderGroup = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => {
        setSelectedGroup(item);
        setIsSettingsModalVisible(true);
      }}
    >
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{item.name}</Text>
        {item.isPrivate && (
          <Ionicons name="lock-closed" size={16} color="#666" />
        )}
      </View>
      <Text style={styles.groupDescription}>{item.description}</Text>
      <View style={styles.groupFooter}>
        <Text style={styles.memberCount}>
          {item.members.length}{" "}
          {item.members.length === 1 ? "member" : "members"}
        </Text>
        <TouchableOpacity
          style={styles.leaveButton}
          onPress={() => handleLeaveGroup(item._id)}
        >
          <Text style={styles.leaveButtonText}>Leave</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchGroups}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No groups yet</Text>
            <Text style={styles.emptySubtext}>
              Create a new group or join one using an invite code
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <GroupModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onGroupCreated={fetchGroups}
      />

      {selectedGroup && (
        <GroupSettingsModal
          visible={isSettingsModalVisible}
          onClose={() => {
            setIsSettingsModalVisible(false);
            setSelectedGroup(null);
          }}
          group={selectedGroup}
          onLeave={() => handleLeaveGroup(selectedGroup._id)}
          onUpdate={handleGroupUpdate}
          isCreator={selectedGroup.creator === useAuth().user?._id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  groupDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  groupFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memberCount: {
    fontSize: 14,
    color: "#666",
  },
  leaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FF3B30",
    borderRadius: 6,
  },
  leaveButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  addButton: {
    position: "absolute",
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

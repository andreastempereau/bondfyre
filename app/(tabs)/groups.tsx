import {
  CreateGroupModal,
  GroupEmptyState,
  GroupHeader,
  GroupList,
  GroupsLoadingState,
  JoinGroupModal,
} from "@/app/components/groups";
import ThemedView from "@/app/components/layout/ThemedView";
import Text from "@/app/components/ui/Text";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useThemeColor } from "../hooks/useThemeColor";
import { apiService } from "../services/apiService";

// Import GroupSettingsModal directly if it exists
import GroupSettingsModal from "../components/modals/GroupSettingsModal";
// Import types from centralized location
import { Group } from "../types/entities";

export default function GroupsScreen() {
  const { token, user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const primaryColor = useThemeColor({}, "primary");

  // Constants
  const MAX_GROUPS_PER_USER = 2;

  const fetchGroups = useCallback(
    async (showRefreshIndicator = false) => {
      try {
        if (showRefreshIndicator) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await apiService.get("/groups");
        // The API directly returns the array of groups, not nested in a data property
        setGroups(Array.isArray(response) ? response : []);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching groups:", error);
        setError("Failed to load groups");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  // Fetch groups when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [fetchGroups])
  );

  const handleRefresh = () => {
    fetchGroups(true);
  };

  const handleGroupPress = (group: Group) => {
    setSelectedGroup(group);
    setIsSettingsModalVisible(true);
  };

  const handleLeaveGroup = async (groupId: string) => {
    Alert.alert("Leave Group", "Are you sure you want to leave this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            await apiService.post(`/groups/${groupId}/leave`);
            // Remove group from local state
            setGroups(groups.filter((group) => group._id !== groupId));
            Alert.alert("Success", "You have left the group");
          } catch (error: any) {
            Alert.alert(
              "Error",
              error.response?.data?.message || "Failed to leave group"
            );
          }
        },
      },
    ]);
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

  const renderHeaderButtons = () => (
    <View style={styles.buttonsRow}>
      <TouchableOpacity
        style={[
          styles.iconButton,
          {
            backgroundColor:
              groups && groups.length >= MAX_GROUPS_PER_USER
                ? "#CCCCCC"
                : primaryColor + "20",
          },
        ]}
        onPress={() => setIsJoinModalVisible(true)}
        disabled={groups && groups.length >= MAX_GROUPS_PER_USER}
      >
        <MaterialCommunityIcons
          name="account-group"
          size={22}
          color={primaryColor}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.iconButton,
          {
            backgroundColor:
              groups && groups.length >= MAX_GROUPS_PER_USER
                ? "#CCCCCC"
                : primaryColor,
          },
        ]}
        onPress={() => setIsCreateModalVisible(true)}
        disabled={groups && groups.length >= MAX_GROUPS_PER_USER}
      >
        <Ionicons name="add" size={22} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <GroupHeader
        title="My Groups"
        subtitle={
          groups && groups.length > 0
            ? `${groups.length}/${MAX_GROUPS_PER_USER} groups joined`
            : undefined
        }
        rightComponent={renderHeaderButtons()}
      />

      {error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#FF3B30"
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchGroups()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : loading && !refreshing ? (
        <GroupsLoadingState />
      ) : groups && groups.length === 0 ? (
        <GroupEmptyState
          onCreateGroup={() => setIsCreateModalVisible(true)}
          onJoinGroup={() => setIsJoinModalVisible(true)}
        />
      ) : (
        <GroupList
          groups={groups || []}
          onGroupPress={handleGroupPress}
          onLeaveGroup={handleLeaveGroup}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          maxGroups={MAX_GROUPS_PER_USER}
        />
      )}

      {/* Group Settings Modal */}
      {selectedGroup && (
        <GroupSettingsModal
          visible={isSettingsModalVisible}
          onClose={() => {
            setIsSettingsModalVisible(false);
            setSelectedGroup(null);
          }}
          group={selectedGroup}
          onLeave={() => {
            handleLeaveGroup(selectedGroup._id);
            setIsSettingsModalVisible(false);
            setSelectedGroup(null);
          }}
          onUpdate={handleGroupUpdate}
          isCreator={selectedGroup.creator === user?._id}
        />
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onGroupCreated={() => fetchGroups()}
        userGroupsCount={groups ? groups.length : 0}
        maxGroups={MAX_GROUPS_PER_USER}
      />

      {/* Join Group Modal */}
      <JoinGroupModal
        visible={isJoinModalVisible}
        onClose={() => setIsJoinModalVisible(false)}
        onGroupJoined={() => fetchGroups()}
        userGroupsCount={groups ? groups.length : 0}
        maxGroups={MAX_GROUPS_PER_USER}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonsRow: {
    flexDirection: "row",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

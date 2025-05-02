import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import GroupCard from "./GroupCard";
import GroupEmptyState from "./GroupEmptyState";
import Text from "../ui/Text";
import { useThemeColor } from "@/app/hooks/useThemeColor";

interface Member {
  _id: string;
  name: string;
  photos: string[];
}
interface Group {
  _id: string;
  name: string;
  description: string;
  bio?: string;
  members: Member[];
  interests: string[];
  isPrivate: boolean;
  maxMembers: number;
  creator: string;
  inviteCode: string;
  photos?: string[];
}

interface GroupListProps {
  groups: Group[];
  onGroupPress: (group: Group) => void;
  onLeaveGroup: (groupId: string) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  maxGroups?: number;
}

// Forward declaration for circular dependency
interface GroupEmptyStateProps {
  onCreateGroup: () => void;
  onJoinGroup: () => void;
}

type GroupListFooterProps = {
  canCreateGroup: boolean;
  maxGroups: number;
};

const GroupListFooter = ({
  canCreateGroup,
  maxGroups,
}: GroupListFooterProps) => {
  const mutedTextColor = useThemeColor({}, "mutedText");

  if (canCreateGroup) return null;

  return (
    <View style={styles.maxGroupsMessage}>
      <View style={styles.separator} />
      <Text style={[styles.maxGroupsText, { color: mutedTextColor }]}>
        You've reached the maximum number of groups ({maxGroups})
      </Text>
    </View>
  );
};

export default function GroupList({
  groups,
  onGroupPress,
  onLeaveGroup,
  refreshing = false,
  onRefresh,
  maxGroups = 2,
}: GroupListProps) {
  const canCreateGroup = groups.length < maxGroups;

  const renderItem = ({ item }: { item: Group }) => (
    <GroupCard
      group={item}
      onPress={onGroupPress}
      onLeaveGroup={onLeaveGroup}
    />
  );

  if (groups.length === 0) {
    return <GroupEmptyState onCreateGroup={() => {}} onJoinGroup={() => {}} />;
  }

  return (
    <FlatList
      data={groups}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      ListFooterComponent={
        <GroupListFooter
          canCreateGroup={canCreateGroup}
          maxGroups={maxGroups}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  maxGroupsMessage: {
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    width: "100%",
    marginBottom: 16,
  },
  maxGroupsText: {
    fontSize: 14,
    textAlign: "center",
  },
});

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../ui/Text";
import { useThemeColor } from "../../hooks/useThemeColor";
// Import types from centralized location
import { Group, Member } from "../../types/entities";
import { GroupCardProps } from "../../types/components";

export default function GroupCard({
  group,
  onPress,
  onLeaveGroup,
}: GroupCardProps) {
  const primaryColor = useThemeColor({}, "primary");
  const backgroundColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");

  const remainingSpots = group.maxMembers - group.members.length;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={() => onPress(group)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: textColor }]}>{group.name}</Text>
        {group.isPrivate && (
          <MaterialCommunityIcons
            name="lock"
            size={16}
            color={mutedTextColor}
          />
        )}
      </View>

      <Text
        style={[styles.description, { color: mutedTextColor }]}
        numberOfLines={2}
      >
        {group.description || "No description"}
      </Text>

      <View style={styles.stats}>
        <View style={styles.memberInfo}>
          <View style={styles.memberAvatars}>
            {group.members.slice(0, 3).map((member, index) => (
              <View
                key={member._id}
                style={[
                  styles.memberAvatar,
                  {
                    backgroundColor: primaryColor,
                    marginLeft: index > 0 ? -10 : 0,
                  },
                ]}
              >
                <Text style={styles.avatarInitial}>
                  {member.name.charAt(0)}
                </Text>
              </View>
            ))}
            {group.members.length > 3 && (
              <View
                style={[
                  styles.memberAvatar,
                  { backgroundColor: mutedTextColor, marginLeft: -10 },
                ]}
              >
                <Text style={styles.avatarInitial}>
                  +{group.members.length - 3}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.memberCount, { color: mutedTextColor }]}>
            {group.members.length}/{group.maxMembers} members
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.leaveButton, { borderColor: "#FF3B30" }]}
          onPress={() => onLeaveGroup(group._id)}
        >
          <Text style={styles.leaveButtonText}>Leave</Text>
        </TouchableOpacity>
      </View>

      {remainingSpots > 0 && (
        <View style={[styles.badge, { backgroundColor: primaryColor }]}>
          <Text style={styles.badgeText}>
            {remainingSpots} {remainingSpots === 1 ? "spot" : "spots"} left
          </Text>
        </View>
      )}
    </TouchableOpacity>
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
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatars: {
    flexDirection: "row",
    marginRight: 8,
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "white",
  },
  avatarInitial: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  memberCount: {
    fontSize: 14,
  },
  leaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  leaveButtonText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "500",
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});

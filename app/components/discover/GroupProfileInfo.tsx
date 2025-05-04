import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { GroupProfile } from "./types";
import InterestTags from "../profile/InterestTags";
import { FontAwesome } from "@expo/vector-icons";

interface GroupProfileInfoProps {
  profile: GroupProfile;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBvcnRyYWl0fGVufDB8fDB8fHww&auto=format&fit=crop&w=900&q=60";

const GroupProfileInfo: React.FC<GroupProfileInfoProps> = ({ profile }) => {
  // Calculate the number of matching interests to highlight
  const hasMatchingInterests =
    profile.matchingInterests && profile.matchingInterests.length > 0;
  const hasMutualConnections =
    profile.mutualConnections && profile.mutualConnections > 0;

  // State to track loading state of member images
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    profile.members.reduce((acc, member) => ({ ...acc, [member.id]: true }), {})
  );

  // State to track error state of member images
  const [errorImages, setErrorImages] = useState<Record<string, boolean>>({});

  const handleImageLoad = (memberId: string) => {
    setLoadingImages((prev) => ({ ...prev, [memberId]: false }));
  };

  const handleImageError = (memberId: string) => {
    setLoadingImages((prev) => ({ ...prev, [memberId]: false }));
    setErrorImages((prev) => ({ ...prev, [memberId]: true }));
    console.log(`Failed to load image for member ${memberId}`);
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.header}>
        <Text style={styles.groupName}>{profile.name}</Text>

        {profile.relevanceScore && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>
              {Math.round(profile.relevanceScore)}%
            </Text>
            <Text style={styles.scoreLabel}>Match</Text>
          </View>
        )}
      </View>

      {/* Matching Interests Highlight */}
      {hasMatchingInterests && (
        <View style={styles.matchingContainer}>
          <View style={styles.matchingIcon}>
            <FontAwesome name="star" size={14} color="#FFC107" />
          </View>
          <Text style={styles.matchingText}>
            You have {profile.matchingInterests?.length} interest
            {profile.matchingInterests?.length !== 1 ? "s" : ""} in common
          </Text>
        </View>
      )}

      {/* Mutual Connections */}
      {hasMutualConnections && (
        <View style={styles.matchingContainer}>
          <View style={styles.matchingIcon}>
            <FontAwesome name="link" size={14} color="#4A90E2" />
          </View>
          <Text style={styles.matchingText}>
            {profile.mutualConnections} mutual connection
            {profile.mutualConnections !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {profile.isGroupConnection && (
        <View style={styles.matchingContainer}>
          <View style={styles.matchingIcon}>
            <FontAwesome name="users" size={14} color="#4CAF50" />
          </View>
          <Text style={styles.matchingText}>Connected through groups</Text>
        </View>
      )}

      <View style={styles.membersContainer}>
        {profile.members.map((member) => (
          <View key={member.id} style={styles.memberInfo}>
            <View style={styles.memberRow}>
              <View style={styles.memberAvatarContainer}>
                <Image
                  source={{
                    uri: errorImages[member.id] ? FALLBACK_IMAGE : member.image,
                  }}
                  style={styles.memberAvatar}
                  onLoad={() => handleImageLoad(member.id)}
                  onError={() => handleImageError(member.id)}
                />
                {loadingImages[member.id] && (
                  <View style={styles.memberImageLoadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>
                  {member.name}{" "}
                  <Text style={styles.memberAge}>{member.age}</Text>
                </Text>
                <Text style={styles.memberGender}>
                  <FontAwesome
                    name={member.gender === "male" ? "mars" : "venus"}
                    size={12}
                    color="#666"
                  />
                  <Text> {member.gender}</Text>
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.bio}>{profile.bio}</Text>

      <View style={styles.interestsWrapper}>
        <Text style={styles.interestsLabel}>Interests</Text>
        <InterestTags
          interests={profile.interests}
          highlightInterests={profile.matchingInterests}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flex: 1,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 20, // Extra padding at bottom for better scrolling experience
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  groupName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
  },
  scoreContainer: {
    backgroundColor: "#FFE5E5",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF4C67",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#FF4C67",
  },
  matchingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  matchingIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  matchingText: {
    fontSize: 13,
    color: "#555",
  },
  membersContainer: {
    marginBottom: 8,
    backgroundColor: "#f8f8f8",
    padding: 8,
    borderRadius: 12,
  },
  memberInfo: {
    marginBottom: 4,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatarContainer: {
    position: "relative",
    width: 32,
    height: 32,
    marginRight: 8,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  memberImageLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  memberAge: {
    fontWeight: "400",
  },
  memberGender: {
    fontSize: 12,
    color: "#666",
    flexDirection: "row",
    alignItems: "center",
  },
  bio: {
    fontSize: 14,
    color: "#555",
    marginVertical: 8,
    lineHeight: 18,
  },
  interestsWrapper: {
    marginTop: 2,
  },
  interestsLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
});

export default GroupProfileInfo;

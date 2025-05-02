import React from "react";
import { ScrollView, View, Text, StyleSheet, Image } from "react-native";
import { GroupProfile } from "./types";
import InterestTags from "../profile/InterestTags";
import { FontAwesome } from "@expo/vector-icons";

interface GroupProfileInfoProps {
  profile: GroupProfile;
}

const GroupProfileInfo: React.FC<GroupProfileInfoProps> = ({ profile }) => {
  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <Text style={styles.groupName}>{profile.name}</Text>

      <View style={styles.membersContainer}>
        {profile.members.map((member) => (
          <View key={member.id} style={styles.memberInfo}>
            <View style={styles.memberRow}>
              <Image
                source={{ uri: member.image }}
                style={styles.memberAvatar}
              />
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
                  />{" "}
                  {member.gender}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.bio}>{profile.bio}</Text>

      <View style={styles.interestsWrapper}>
        <Text style={styles.interestsLabel}>Interests</Text>
        <InterestTags interests={profile.interests} />
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
  groupName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#222",
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
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
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

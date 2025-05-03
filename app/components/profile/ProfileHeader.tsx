import React from "react";
import { View, Image, TextInput, Text, StyleSheet } from "react-native";
import { User } from "../../contexts/AuthContext";

export interface EditedProfileData {
  name: string;
  bio: string;
  age: string;
  gender: string;
  interests: string;
}

export interface ProfileHeaderProps {
  user: User;
  isEditing: boolean;
  editedProfile: EditedProfileData;
  setEditedProfile: React.Dispatch<React.SetStateAction<EditedProfileData>>;
}

export const ProfileHeader = ({
  user,
  isEditing,
  editedProfile,
  setEditedProfile,
}: ProfileHeaderProps) => (
  <View style={styles.header}>
    <Image
      source={{
        uri: user.profile?.photos?.[0] || "https://via.placeholder.com/150",
      }}
      style={styles.profileImage}
    />
    {isEditing ? (
      <TextInput
        style={styles.input}
        value={editedProfile.name}
        onChangeText={(text) =>
          setEditedProfile({ ...editedProfile, name: text })
        }
        placeholder="Name"
      />
    ) : (
      <Text style={styles.name}>{user.name}</Text>
    )}
    <Text style={styles.email}>{user.email}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    minWidth: 200,
    textAlign: "center",
  },
});

// Adding default export to prevent Expo Router from treating this as a route
export default ProfileHeader;

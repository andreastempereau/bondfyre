import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/apiService";

// Import separated components
import {
  ProfileHeader,
  ProfileEditForm,
  UnauthenticatedView,
} from "../components/profile";
import { ProfileEditValues } from "../components/profile/ProfileEditForm";
import { SafeAreaView } from "react-native-safe-area-context";
import InterestTags from "../components/profile/InterestTags";

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // If user is not authenticated, show sign in/sign up page
  if (!user) {
    return <UnauthenticatedView />;
  }

  const defaultValues: ProfileEditValues = {
    name: user.name || "",
    bio: user.profile?.bio || "",
    age: user.profile?.age?.toString() || "",
    gender: user.profile?.gender || "",
    interests: (user.profile?.interests || []).join(", "),
  };

  const handleSave = async (data: ProfileEditValues) => {
    try {
      setLoading(true);
      const interestsArray = data.interests
        ? data.interests
            .split(",")
            .map((interest) => interest.trim())
            .filter((interest) => interest.length > 0)
        : [];

      const updatedUserData = {
        name: data.name,
        profile: {
          ...user.profile,
          bio: data.bio,
          age: parseInt(data.age) || 0,
          gender: data.gender,
          interests: interestsArray,
        },
      };

      await apiService.put(`/users/profile`, updatedUserData);
      await updateUser(updatedUserData);

      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace("/auth");
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <ProfileHeader
          user={user}
          isEditing={isEditing}
          editedProfile={{
            name: user.name || "",
            bio: user.profile?.bio || "",
            age: (user.profile?.age || 0).toString(),
            gender: user.profile?.gender || "",
            interests: (user.profile?.interests || []).join(", "),
          }}
          setEditedProfile={() => {}}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <FontAwesome
                name={isEditing ? "times" : "edit"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <ProfileEditForm
              defaultValues={defaultValues}
              onSave={handleSave}
              loading={loading}
            />
          ) : (
            <>
              {user.profile?.bio && (
                <Text style={styles.bio}>{user.profile.bio}</Text>
              )}
              {user.profile?.age && (
                <Text style={styles.detail}>{user.profile.age} years old</Text>
              )}
              {user.profile?.gender && (
                <Text style={styles.detail}>{user.profile.gender}</Text>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <InterestTags
            interests={user.profile?.interests ? user.profile.interests : []}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome name="sign-out" size={20} color="#FF6B6B" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    margin: 20,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

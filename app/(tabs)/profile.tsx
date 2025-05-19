import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { apiService } from "../../src/services/apiService";
import { uploadImage, deleteImage } from "../../src/services/storageService";
import * as ImagePicker from "expo-image-picker";
import ThemedView from "../../src/components/layout/ThemedView";
import { useThemeColor } from "../../src/hooks/useThemeColor";

// Import separated components
import {
  ProfileHeader,
  ProfileEditForm,
  AuthScreen,
} from "../../src/components/profile";
import { ProfileEditValues } from "../../src/components/profile/ProfileEditForm";
import { SafeAreaView } from "react-native-safe-area-context";
import InterestTags from "../../src/components/profile/InterestTags";
import { DoubleDateFriendSelector } from "../../src/components/features/DoubleDateFriendSelector";

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'doubleDateFriends'

  // Theme colors
  const cardBackground = useThemeColor({}, "card");
  const primaryColor = useThemeColor({}, "primary");
  const mutedTextColor = useThemeColor({}, "mutedText");

  useEffect(() => {
    // Initialize photos from user data
    if (user) {
      // Check both possible locations for photos
      const userPhotos = user.photos || user.profile?.photos || [];
      setPhotos(userPhotos);
    }
  }, [user]);

  // If user is not authenticated, show sign in/sign up page
  if (!user) {
    return <AuthScreen />;
  }

  // Create default values for the form using both possible structures
  const defaultValues: ProfileEditValues = {
    name: user.name || "",
    bio: user.bio || user.profile?.bio || "",
    age: (user.age || user.profile?.age || "").toString(),
    gender: user.gender || user.profile?.gender || "",
    interests: (user.interests || user.profile?.interests || []).join(", "),
    phoneNumber: user.phoneNumber || "",
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to your photo library to upload photos."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        try {
          setUploadingImage(true);

          // Upload image to Supabase storage
          const { url, error } = await uploadImage(
            result.assets[0].uri,
            user._id
          );

          if (error) {
            console.error("Error uploading to Supabase:", error);
            Alert.alert("Upload Error", "Failed to upload image to storage.");
            return;
          }

          if (!url) {
            Alert.alert(
              "Upload Error",
              "Failed to get a valid URL from storage."
            );
            return;
          }

          const newPhotos = [...photos, url];
          setPhotos(newPhotos);

          // Save the updated photo URL to the server
          await apiService.put(`/users/profile`, { photos: newPhotos });
          await updateUser({ photos: newPhotos });
          Alert.alert("Success", "Photo uploaded successfully");
        } catch (error: any) {
          Alert.alert(
            "Error",
            error.message || "Failed to update profile photo"
          );
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      setUploadingImage(false);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const removePhoto = async (photoUrl: string, index: number) => {
    try {
      const confirmed = await new Promise((resolve) => {
        Alert.alert(
          "Remove Photo",
          "Are you sure you want to remove this photo?",
          [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            {
              text: "Remove",
              style: "destructive",
              onPress: () => resolve(true),
            },
          ]
        );
      });

      if (!confirmed) return;

      setUploadingImage(true);

      // Delete from Supabase storage if it's a Supabase URL
      if (photoUrl.includes("supabase")) {
        const { error } = await deleteImage(photoUrl);
        if (error) {
          console.warn("Error deleting from storage:", error);
          // Continue anyway to remove from profile
        }
      }

      // Remove from local state
      const newPhotos = [...photos];
      newPhotos.splice(index, 1);
      setPhotos(newPhotos);

      // Update on server
      await apiService.put(`/users/profile`, { photos: newPhotos });
      await updateUser({ photos: newPhotos });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to remove photo");
    } finally {
      setUploadingImage(false);
    }
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

      // Create updated user data based on backend structure (not nested profile)
      const updatedUserData = {
        name: data.name,
        bio: data.bio,
        age: parseInt(data.age) || 0,
        gender: data.gender,
        interests: interestsArray,
        photos: photos,
        phoneNumber: data.phoneNumber,
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

  // Add a tab for managing double date friends
  const renderTabs = () => (
    <View style={[styles.tabContainer, { backgroundColor: cardBackground }]}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "profile" && [
            styles.activeTab,
            { borderBottomColor: primaryColor },
          ],
        ]}
        onPress={() => setActiveTab("profile")}
      >
        <Text
          style={[
            styles.tabText,
            { color: activeTab === "profile" ? primaryColor : mutedTextColor },
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "doubleDateFriends" && [
            styles.activeTab,
            { borderBottomColor: primaryColor },
          ],
        ]}
        onPress={() => setActiveTab("doubleDateFriends")}
      >
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === "doubleDateFriends"
                  ? primaryColor
                  : mutedTextColor,
            },
          ]}
        >
          Double Date Friends
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render content based on active tab
  const renderContent = () => {
    if (activeTab === "doubleDateFriends") {
      return <DoubleDateFriendSelector />;
    }

    // Render regular profile content
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <View style={styles.photoContainer}>
              <Image
                source={{
                  uri: photos[0] || "https://via.placeholder.com/150",
                }}
                style={styles.profileImage}
              />
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={pickImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <FontAwesome name="camera" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>

          {/* Photo Gallery Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Photos</Text>
              <TouchableOpacity onPress={pickImage} disabled={uploadingImage}>
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#666" />
                ) : (
                  <FontAwesome name="plus" size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photoGallery}
            >
              {photos.length > 0 ? (
                photos.map((photo, index) => (
                  <View key={index} style={styles.photoWrapper}>
                    <Image
                      source={{ uri: photo }}
                      style={styles.galleryImage}
                    />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(photo, index)}
                    >
                      <FontAwesome name="times" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.addPhotoCard}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="large" color="#ccc" />
                  ) : (
                    <>
                      <FontAwesome name="plus" size={24} color="#ccc" />
                      <Text style={styles.addPhotoText}>Add Photos</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

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
                {(user.bio || user.profile?.bio) && (
                  <Text style={styles.bio}>
                    {user.bio || user.profile?.bio}
                  </Text>
                )}
                {(user.age || user.profile?.age) && (
                  <Text style={styles.detail}>
                    {user.age || user.profile?.age} years old
                  </Text>
                )}
                {(user.gender || user.profile?.gender) && (
                  <Text style={styles.detail}>
                    {user.gender || user.profile?.gender}
                  </Text>
                )}
                {user.phoneNumber && (
                  <Text style={styles.detail}>
                    <FontAwesome name="phone" size={14} color="#666" />{" "}
                    {user.phoneNumber}
                  </Text>
                )}
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <InterestTags
              interests={user.interests || user.profile?.interests || []}
            />
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome name="sign-out" size={20} color="#FF6B6B" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* ... existing header ... */}

      {/* Tabs */}
      {renderTabs()}

      {/* Content based on active tab */}
      {renderContent()}
    </ThemedView>
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
  header: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  photoContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  addPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4A80F0",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
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
  photoGallery: {
    flexDirection: "row",
    marginVertical: 10,
  },
  photoWrapper: {
    position: "relative",
    marginRight: 10,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoCard: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    color: "#999",
    marginTop: 5,
    fontSize: 12,
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
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

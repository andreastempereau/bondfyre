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
  Platform,
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

// Constants for image optimization
const IMAGE_QUALITY = Platform.OS === 'ios' ? 0.3 : 0.5;
const MAX_IMAGE_DIMENSION = 400;

export default function ProfileScreen() {
  const { user, signOut, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' or 'doubleDateFriends'
  const [error, setError] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Theme colors
  const cardBackground = useThemeColor({}, "card");
  const primaryColor = useThemeColor({}, "primary");
  const mutedTextColor = useThemeColor({}, "mutedText");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user) {
          const userPhotos = user.photos || user.profile?.photos || [];
          // Only take the first photo and ensure it's a valid URL
          const firstPhoto = Array.isArray(userPhotos) ? userPhotos[0] : null;
          if (firstPhoto && typeof firstPhoto === 'string' && firstPhoto.startsWith('http')) {
            setPhotos([firstPhoto]);
          } else {
            setPhotos([]);
          }
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // If user is not authenticated, show sign in/sign up page
  if (!user) {
    return <AuthScreen />;
  }

  // Show loading state
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </ThemedView>
    );
  }

  // Show error state
  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // Create default values for the form
  const defaultValues: ProfileEditValues = {
    name: user?.name || "",
    bio: user?.bio || user?.profile?.bio || "",
    age: (user?.age || user?.profile?.age || "").toString(),
    gender: user?.gender || user?.profile?.gender || "",
    phoneNumber: user?.phoneNumber || "",
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to your photo library to upload photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: IMAGE_QUALITY,
        allowsMultipleSelection: false,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        try {
          setUploadingImage(true);
          setIsImageLoaded(false);

          const { url, error } = await uploadImage(
            result.assets[0].uri,
            user?._id || ""
          );

          if (error) {
            console.error("Error uploading to Supabase:", error);
            Alert.alert("Upload Error", "Failed to upload image to storage.");
            return;
          }

          if (!url) {
            Alert.alert("Upload Error", "Failed to get a valid URL from storage.");
            return;
          }

          // Only keep one photo
          setPhotos([url]);

          await apiService.put(`/users/profile`, { photos: [url] });
          await updateUser({ photos: [url] });
          Alert.alert("Success", "Photo uploaded successfully");
        } catch (error: any) {
          Alert.alert("Error", error.message || "Failed to update profile photo");
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      setUploadingImage(false);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const removePhoto = async () => {
    try {
      const confirmed = await new Promise((resolve) => {
        Alert.alert(
          "Remove Photo",
          "Are you sure you want to remove your profile photo?",
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
      if (photos[0]?.includes("supabase")) {
        const { error } = await deleteImage(photos[0]);
        if (error) {
          console.warn("Error deleting from storage:", error);
          // Continue anyway to remove from profile
        }
      }

      // Remove photo
      setPhotos([]);

      // Update on server
      await apiService.put(`/users/profile`, { photos: [] });
      await updateUser({ photos: [] });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to remove photo");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (data: ProfileEditValues) => {
    try {
      setLoading(true);

      const updatedUserData = {
        name: data.name,
        bio: data.bio,
        age: parseInt(data.age) || 0,
        gender: data.gender,
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
    try {
      if (activeTab === "doubleDateFriends") {
        return <DoubleDateFriendSelector />;
      }

      return (
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.container}
            removeClippedSubviews={true}
          >
            <View style={styles.header}>
              <View style={styles.photoContainer}>
                {!isImageLoaded && (
                  <View style={[styles.profileImage, styles.imagePlaceholder]}>
                    <ActivityIndicator size="large" color={primaryColor} />
                  </View>
                )}
                <Image
                  source={
                    photos[0]
                      ? { uri: photos[0] }
                      : require("../../assets/images/default-avatar.jpg")
                  }
                  style={[
                    styles.profileImage,
                    !isImageLoaded && { opacity: 0 }
                  ]}
                  onLoadStart={() => setIsImageLoaded(false)}
                  onLoadEnd={() => setIsImageLoaded(true)}
                  onError={(e) => {
                    console.error("Error loading profile image:", e.nativeEvent.error);
                    setIsImageLoaded(true);
                    e.currentTarget.setNativeProps({
                      source: require("../../assets/images/default-avatar.jpg"),
                    });
                  }}
                />
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={photos.length > 0 ? removePhoto : pickImage}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <FontAwesome 
                      name={photos.length > 0 ? "trash" : "camera"} 
                      size={18} 
                      color="#fff" 
                    />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.name}>{user?.name || "No Name"}</Text>
              <Text style={styles.email}>{user?.email || "No Email"}</Text>
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
                  {(user?.bio || user?.profile?.bio) && (
                    <Text style={styles.bio}>
                      {user?.bio || user?.profile?.bio}
                    </Text>
                  )}
                  {(user?.age || user?.profile?.age) && (
                    <Text style={styles.detail}>
                      {user?.age || user?.profile?.age} years old
                    </Text>
                  )}
                  {(user?.gender || user?.profile?.gender) && (
                    <Text style={styles.detail}>
                      {user?.gender || user?.profile?.gender}
                    </Text>
                  )}
                  {user?.phoneNumber && (
                    <Text style={styles.detail}>
                      <FontAwesome name="phone" size={14} color="#666" />{" "}
                      {user?.phoneNumber}
                    </Text>
                  )}
                </>
              )}
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <FontAwesome name="sign-out" size={20} color="#FF6B6B" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    } catch (error) {
      console.error("Error rendering profile content:", error);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong. Please try again.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    padding: 10,
    backgroundColor: "#4A80F0",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    position: 'absolute',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

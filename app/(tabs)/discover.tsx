import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Modal,
  Image,
} from "react-native";
import { State } from "react-native-gesture-handler";
import {
  GroupProfile,
  SwipeDirection,
  SwipeCard,
  ActionButtons,
  EmptyState,
} from "../components/discover";
import { StatusBar } from "expo-status-bar";
import { apiService } from "../services/apiService";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "../contexts/AuthContext";
import { UnauthenticatedView } from "../components/profile/UnauthenticatedView";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

export default function DiscoverScreen() {
  const { user, loading: authLoading } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState<GroupProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const position = useRef(new Animated.ValueXY()).current;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [discoveryMode, setDiscoveryMode] = useState<"users" | "groups">(
    "groups"
  );
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Match notification state
  const [matchModal, setMatchModal] = useState(false);
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const router = useRouter();

  // If authentication is still loading, show a loading indicator
  if (authLoading) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If user is not authenticated, show the unauthenticated view
  if (!user) {
    return <UnauthenticatedView />;
  }

  const fetchDiscoveryData = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
          setOffset(0); // Reset offset if refreshing
        } else {
          setLoading(true);
        }

        // Use the discovery API endpoint based on mode - using a limit of 10
        // Add excludeSwiped=true parameter to filter out already swiped profiles
        const response = await apiService.get(
          `/discovery/${discoveryMode}?limit=10&offset=${
            refresh ? 0 : offset
          }&excludeSwiped=true`
        );

        // The API returns an object with data, not just an array
        const data = (response as any)[discoveryMode]; // 'users' or 'groups' property
        const hasMoreData = (response as any).hasMore;

        // Map the response data to match the GroupProfile structure
        const formattedProfiles = data.map((item: any) => ({
          id: item._id,
          name: item.name,
          members:
            item.members?.map((member: any) => ({
              id: member._id,
              name: member.name,
              age: member.age || 25,
              gender: member.gender || "unknown",
              image: member.photos?.[0] || "https://via.placeholder.com/150",
            })) || [],
          bio: item.bio || "",
          interests: item.interests || [],
          photos:
            item.photos && item.photos.length > 0
              ? item.photos
              : ["https://via.placeholder.com/500"],
          // Include the additional discovery data
          relevanceScore: item.relevanceScore,
          matchingInterests: item.matchingInterests || [],
          mutualConnections: item.mutualConnections || 0,
          isGroupConnection: item.isGroupConnection || false,
        }));

        if (refresh) {
          // Replace all data if refreshing
          setProfiles(formattedProfiles);
          setCurrentIndex(0); // Reset to first profile
          setCurrentPhotoIndex(0); // Reset photo index
        } else {
          // Append new data to existing profiles
          setProfiles((prev) => [...prev, ...formattedProfiles]);
        }

        // Update the offset for next page load
        setOffset(
          refresh ? formattedProfiles.length : offset + formattedProfiles.length
        );

        // Update if we have more data to load
        setHasMore(hasMoreData);
      } catch (err) {
        console.error(`Failed to fetch ${discoveryMode}:`, err);
        setError(`Failed to load ${discoveryMode}`);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [discoveryMode, offset]
  );

  // Initial fetch when component mounts or discovery mode changes
  useEffect(() => {
    fetchDiscoveryData(true);
  }, [discoveryMode, fetchDiscoveryData]);

  // Function to toggle between users and groups
  const toggleDiscoveryMode = () => {
    setDiscoveryMode((prev) => (prev === "users" ? "groups" : "users"));
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: position.x, translationY: position.y } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      if (Math.abs(translationX) > SWIPE_THRESHOLD) {
        const direction = translationX > 0 ? "right" : "left";
        handleSwipe(direction);
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const handleSwipe = async (direction: SwipeDirection) => {
    const x = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });

      // If we've swiped on a profile, send the swipe to the backend
      if (currentIndex < profiles.length) {
        const currentProfile = profiles[currentIndex];
        // Send swipe to backend
        apiService
          .post("/swipes", {
            swipedUserId: currentProfile.id,
            direction,
          })
          .then((response: any) => {
            // Check if there's a match
            if (response.isMatch) {
              // Trigger haptic feedback for a match
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );

              // Set match details and show modal
              setMatchDetails(response.matchDetails);
              setMatchModal(true);
            }
          })
          .catch((err) => {
            console.error("Failed to record swipe:", err);
          });
      }

      setCurrentIndex((prev) => {
        // If we're at the last profile and there are more to load
        if (prev === profiles.length - 3 && hasMore) {
          // Load more profiles when we're close to the end
          fetchDiscoveryData(false);
        }
        return prev + 1;
      });
      setCurrentPhotoIndex(0);
    });
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-30deg", "0deg", "30deg"],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  const handlePhotoPress = () => {
    const currentProfile = profiles[currentIndex];
    setCurrentPhotoIndex((prev) =>
      prev === currentProfile.photos.length - 1 ? 0 : prev + 1
    );
  };

  const onRefresh = () => {
    fetchDiscoveryData(true);
  };

  // Handle sending a message to the new match
  const handleMessageMatch = () => {
    setMatchModal(false);
    if (matchDetails?._id) {
      // Navigate to messages with the match ID
      router.push(`/messages/${matchDetails._id}`);
    }
  };

  // Close the match modal
  const handleCloseMatchModal = () => {
    setMatchModal(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error && profiles.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.centeredContent,
          styles.containerContent,
          { flex: 1 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <EmptyState errorMessage={error} />
      </ScrollView>
    );
  }

  if (profiles.length === 0 || currentIndex >= profiles.length) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.centeredContent,
          styles.containerContent,
          { flex: 1 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <EmptyState />
      </ScrollView>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={[
            styles.modeToggle,
            discoveryMode === "groups" ? styles.activeMode : {},
          ]}
          onPress={toggleDiscoveryMode}
        >
          <FontAwesome
            name="users"
            size={18}
            color={discoveryMode === "groups" ? "#FF4C67" : "#999"}
          />
          <Text
            style={[
              styles.modeText,
              discoveryMode === "groups" ? styles.activeModeText : {},
            ]}
          >
            Groups
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeToggle,
            discoveryMode === "users" ? styles.activeMode : {},
          ]}
          onPress={toggleDiscoveryMode}
        >
          <FontAwesome
            name="user"
            size={18}
            color={discoveryMode === "users" ? "#FF4C67" : "#999"}
          />
          <Text
            style={[
              styles.modeText,
              discoveryMode === "users" ? styles.activeModeText : {},
            ]}
          >
            People
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <SwipeCard
          profile={currentProfile}
          currentPhotoIndex={currentPhotoIndex}
          onPhotoPress={handlePhotoPress}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          cardStyle={getCardStyle()}
        />
      </View>

      <View style={styles.actionButtonContainer}>
        <ActionButtons onSwipe={handleSwipe} />
      </View>

      {/* Add a spacer to prevent overlap with tab bar */}
      <View style={styles.bottomSpacer} />

      {/* Match notification modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={matchModal}
        onRequestClose={handleCloseMatchModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.matchModalContent}>
            <Text style={styles.matchTitle}>It's a Match!</Text>
            <Text style={styles.matchSubtitle}>
              You and {matchDetails?.matchedUser?.name} have liked each other
            </Text>

            <View style={styles.matchImages}>
              <Image
                source={{
                  uri:
                    matchDetails?.currentUser?.photos?.[0] ||
                    "https://via.placeholder.com/150",
                }}
                style={styles.matchImage}
              />
              <View style={styles.matchIconContainer}>
                <FontAwesome name="heart" size={30} color="#FF4C67" />
              </View>
              <Image
                source={{
                  uri:
                    matchDetails?.matchedUser?.photos?.[0] ||
                    "https://via.placeholder.com/150",
                }}
                style={styles.matchImage}
              />
            </View>

            <TouchableOpacity
              style={styles.sendMessageButton}
              onPress={handleMessageMatch}
            >
              <Text style={styles.sendMessageText}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.keepSwipingButton}
              onPress={handleCloseMatchModal}
            >
              <Text style={styles.keepSwipingText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 5, // Reduced top padding
    paddingHorizontal: 20,
  },
  containerContent: {
    justifyContent: "space-between", // Moved from container to containerContent
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonContainer: {
    alignItems: "center",
    paddingBottom: 5,
  },
  bottomSpacer: {
    height: Platform.OS === "ios" ? 60 : 50, // Add space at bottom to prevent tab bar overlap
  },
  centeredContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
    marginBottom: 10,
    marginTop: 10, // Add some top margin
    zIndex: 10, // Ensure it's above other content
    backgroundColor: "#f5f5f5", // Match background color
    borderRadius: 25, // Round the corners slightly
    alignSelf: "center", // Center horizontally
  },
  modeToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeMode: {
    backgroundColor: "#FFE5E5",
  },
  modeText: {
    marginLeft: 5,
    fontSize: 16,
    color: "#999",
  },
  activeModeText: {
    color: "#FF4C67",
    fontWeight: "600",
  },
  // Match modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  matchModalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FF4C67",
    marginBottom: 10,
  },
  matchSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  matchImages: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  matchImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#FF4C67",
  },
  matchIconContainer: {
    marginHorizontal: 10,
  },
  sendMessageButton: {
    width: "100%",
    backgroundColor: "#FF4C67",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
  },
  sendMessageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  keepSwipingButton: {
    width: "100%",
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  keepSwipingText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
});

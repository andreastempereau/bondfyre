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
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
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

  // Fetch discovery data (optimized: no offset dependency)
  const fetchDiscoveryData = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
          setOffset(0); // Reset offset if refreshing
        } else {
          setLoading(true);
        }
        setError(null);
        const response = await apiService.get(
          `/discovery/users?limit=10&offset=${
            refresh ? 0 : offset
          }&excludeSwiped=true`
        );
        const data = (response as any).users;
        const hasMoreData = (response as any).hasMore;
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
          relevanceScore: item.relevanceScore
            ? Number(item.relevanceScore)
            : undefined,
          matchingInterests: item.matchingInterests || [],
          mutualConnections: item.mutualConnections || 0,
          isGroupConnection: item.isGroupConnection || false,
        }));
        if (refresh) {
          setProfiles(formattedProfiles);
          setCurrentIndex(0);
          setCurrentPhotoIndex(0);
        } else {
          setProfiles((prev) => [...prev, ...formattedProfiles]);
        }
        setOffset(
          refresh ? formattedProfiles.length : offset + formattedProfiles.length
        );
        setHasMore(hasMoreData);
      } catch (err) {
        console.error(`Failed to fetch users:`, err);
        setError(`Failed to load profiles`);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [offset] // Only offset, not a function dependency
  );

  // Initial fetch: only run on mount
  useEffect(() => {
    fetchDiscoveryData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if (currentIndex < profiles.length) {
        const currentProfile = profiles[currentIndex];
        apiService
          .post("/swipes", {
            userId: currentProfile.id,
            direction,
          })
          .then((response: any) => {
            if (response.isMatch) {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              setMatchDetails(response.matchDetails);
              setMatchModal(true);
            }
          })
          .catch((err) => {
            console.error("Failed to record swipe:", err);
          });
      }
      setCurrentIndex((prev) => {
        // Only fetch more if close to end and hasMore
        if (prev === profiles.length - 3 && hasMore) {
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

  const handleCloseMatchModal = () => {
    setMatchModal(false);
  };

  // Render main content for discover screen
  const renderContent = () => {
    // If we're still loading the initial batch and there are no profiles yet
    if (loading && profiles.length === 0) {
      return (
        <View style={[styles.container, styles.centeredContent]}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Finding matches for you...</Text>
        </View>
      );
    }

    // If there was an error loading profiles
    if (error && profiles.length === 0) {
      return (
        <View style={[styles.container, styles.centeredContent]}>
          <ScrollView
            contentContainerStyle={styles.errorContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchDiscoveryData(true)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    // If we've gone through all profiles
    if (currentIndex >= profiles.length) {
      return (
        <View style={[styles.container, styles.centeredContent]}>
          <ScrollView
            contentContainerStyle={styles.centeredContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <EmptyState
              title="No more profiles"
              subtitle="You've seen all available profiles. Check back later for more!"
              icon="search"
            />
          </ScrollView>
        </View>
      );
    }

    // Render the swipe card interface
    return (
      <View style={styles.container}>
        <View style={styles.cardsContainer}>
          {/* Current card */}
          {profiles[currentIndex] && (
            <SwipeCard
              profile={{
                ...profiles[currentIndex],
                relevanceScore: profiles[currentIndex].relevanceScore
                  ? Number(profiles[currentIndex].relevanceScore)
                  : undefined,
              }}
              currentPhotoIndex={currentPhotoIndex}
              onPhotoPress={handlePhotoPress}
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
              cardStyle={getCardStyle()}
            />
          )}
        </View>

        {/* Action buttons for swiping left/right */}
        <ActionButtons onSwipe={handleSwipe} />
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />

      {renderContent()}

      {/* Match modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={matchModal}
        onRequestClose={handleCloseMatchModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.matchModalContainer}>
            <View style={styles.matchHeader}>
              <Text style={styles.matchTitle}>It's a Match!</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseMatchModal}
              >
                <FontAwesome name="times" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.matchDescription}>
              You and {matchDetails?.name || "someone"} liked each other!
            </Text>

            <View style={styles.matchImagesContainer}>
              <Image
                source={{
                  uri: user?.photos?.[0] || "https://via.placeholder.com/150",
                }}
                style={styles.matchImage}
              />
              <View style={styles.matchIcon}>
                <FontAwesome name="heart" size={22} color="#FF6B6B" />
              </View>
              <Image
                source={{
                  uri:
                    matchDetails?.photos?.[0] ||
                    "https://via.placeholder.com/150",
                }}
                style={styles.matchImage}
              />
            </View>

            <TouchableOpacity
              style={styles.messageButton}
              onPress={handleMessageMatch}
            >
              <Text style={styles.messageButtonText}>Send a Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleCloseMatchModal}
            >
              <Text style={styles.continueButtonText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  centeredContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#eee",
    borderRadius: 20,
    marginBottom: 10,
    padding: 4,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    minWidth: 100,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    fontWeight: "600",
    color: "#333",
  },
  cardsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  matchModalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  matchHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 5,
  },
  matchTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  matchDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  matchImagesContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  matchImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginHorizontal: 5,
  },
  matchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: -5, // Overlap the images slightly
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  messageButton: {
    backgroundColor: "#FF6B6B",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
  },
  messageButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  continueButton: {
    backgroundColor: "transparent",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  continueButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});

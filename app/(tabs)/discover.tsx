import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
} from "../../src/components/discover";
import { StatusBar } from "expo-status-bar";
import { apiService } from "../../src/services/apiService";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "../../src/contexts/AuthContext";
import AuthScreen from "../../app/auth";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

export default function DiscoverScreen() {
  // Hooks must run unconditionally
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

  // Fetch discovery data
  const fetchDiscoveryData = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
          setOffset(0);
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
        console.error("Failed to fetch users:", err);
        setError("Failed to load profiles");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [offset]
  );

  // Initial data load
  useEffect(() => {
    fetchDiscoveryData(true);
  }, [fetchDiscoveryData]);

  // Early returns for auth
  if (authLoading) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Moving handleSwipe before onHandlerStateChange to fix the reference issue
  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      const x = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
      Animated.timing(position, {
        toValue: { x, y: 0 },
        duration: 250,
        useNativeDriver: false,
      }).start(async () => {
        position.setValue({ x: 0, y: 0 });
        const currentProfile = profiles[currentIndex];
        if (currentProfile) {
          try {
            const response = await apiService.post("/swipes", {
              userId: currentProfile.id,
              direction,
            });
            if ((response as any).isMatch) {
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              setMatchDetails((response as any).matchDetails);
              setMatchModal(true);
            }
          } catch (err) {
            console.error("Failed to record swipe:", err);
          }
        }
        setCurrentIndex((prev) => {
          if (prev === profiles.length - 3 && hasMore) {
            fetchDiscoveryData(false);
          }
          return prev + 1;
        });
        setCurrentPhotoIndex(0);
      });
    },
    [currentIndex, fetchDiscoveryData, hasMore, position, profiles]
  );

  // Gesture handlers - memoizing these to prevent re-creation on every render
  const onGestureEvent = useMemo(() => {
    return Animated.event(
      [{ nativeEvent: { translationX: position.x, translationY: position.y } }],
      { useNativeDriver: false }
    );
  }, [position.x, position.y]);

  const onHandlerStateChange = useCallback(
    (event: any) => {
      if (event.nativeEvent.oldState === State.ACTIVE) {
        const { translationX } = event.nativeEvent;
        if (Math.abs(translationX) > SWIPE_THRESHOLD) {
          const direction: SwipeDirection = translationX > 0 ? "right" : "left";
          handleSwipe(direction);
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      }
    },
    [handleSwipe, position]
  );

  const getCardStyle = useCallback(() => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-30deg", "0deg", "30deg"],
    });
    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  }, [position]);

  const handlePhotoPress = useCallback(() => {
    const profile = profiles[currentIndex];
    if (profile) {
      setCurrentPhotoIndex((prev) =>
        prev === profile.photos.length - 1 ? 0 : prev + 1
      );
    }
  }, [currentIndex, profiles]);

  const onRefresh = useCallback(
    () => fetchDiscoveryData(true),
    [fetchDiscoveryData]
  );

  const handleMessageMatch = useCallback(() => {
    setMatchModal(false);
    if (matchDetails?._id) {
      router.push(`/messages/${matchDetails._id}`);
    }
  }, [matchDetails, router]);

  const handleCloseMatchModal = useCallback(() => setMatchModal(false), []);

  // Memoized loading state
  const loadingUI = useMemo(
    () => (
      <View style={[styles.container, styles.centeredContent]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Finding matches for you...</Text>
      </View>
    ),
    []
  );

  // Memoized error state
  const errorUI = useMemo(
    () => (
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
    ),
    [error, fetchDiscoveryData, onRefresh, refreshing]
  );

  // Memoized empty state
  const emptyStateUI = useMemo(
    () => (
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
    ),
    [onRefresh, refreshing]
  );

  // Render content based on state with memoized components
  const renderContent = useCallback(() => {
    if (loading && profiles.length === 0) {
      return loadingUI;
    }
    if (error && profiles.length === 0) {
      return errorUI;
    }
    if (currentIndex >= profiles.length) {
      return emptyStateUI;
    }
    return (
      <View style={styles.container}>
        <View style={styles.cardsContainer}>
          <SwipeCard
            profile={profiles[currentIndex]}
            currentPhotoIndex={currentPhotoIndex}
            onPhotoPress={handlePhotoPress}
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
            cardStyle={getCardStyle()}
          />
        </View>
        <ActionButtons onSwipe={handleSwipe} />
      </View>
    );
  }, [
    loading,
    profiles,
    error,
    currentIndex,
    currentPhotoIndex,
    loadingUI,
    errorUI,
    emptyStateUI,
    handlePhotoPress,
    onGestureEvent,
    onHandlerStateChange,
    getCardStyle,
    handleSwipe,
  ]);

  // Memoized match modal content
  const matchModalContent = useMemo(
    () => (
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
                matchDetails?.photos?.[0] || "https://via.placeholder.com/150",
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
    ),
    [handleCloseMatchModal, handleMessageMatch, matchDetails, user]
  );

  return (
    <View style={styles.outerContainer}>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      {renderContent()}
      <Modal
        animationType="fade"
        transparent
        visible={matchModal}
        onRequestClose={handleCloseMatchModal}
      >
        <View style={styles.modalOverlay}>{matchModalContent}</View>
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
  cardsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
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
  retryButton: { backgroundColor: "#FF6B6B", padding: 10, borderRadius: 20 },
  retryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  matchModalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  closeButton: { position: "absolute", right: 0, top: 0, padding: 5 },
  matchTitle: { fontSize: 22, fontWeight: "bold", color: "#333" },
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: -5,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  continueButton: {
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

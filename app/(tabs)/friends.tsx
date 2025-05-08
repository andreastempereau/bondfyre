import ThemedView from "@/app/components/layout/ThemedView";
import Text from "@/app/components/ui/Text";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  TextInput,
  Image,
  Switch,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useThemeColor } from "../hooks/useThemeColor";
import { apiService } from "../services/apiService";
import { UnauthenticatedView } from "../components/profile/UnauthenticatedView";

// Friend interface definition
interface Friend {
  _id: string;
  name: string;
  username?: string;
  photos: string[];
  status: "pending" | "accepted" | "rejected";
  mutualInterests?: string[];
  isDoubleDateFriend?: boolean; // Track if this friend is selected for double dates
}

// Component for displaying empty state when no friends are available
const FriendsEmptyState = ({ onAddFriend }: { onAddFriend: () => void }) => {
  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");

  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require("@/assets/images/icon.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />

      <Text style={[styles.emptyTitle, { color: textColor }]}>
        No Friends Yet
      </Text>

      <Text style={[styles.emptyDescription, { color: mutedTextColor }]}>
        Add friends to increase your chances of finding great matches!
      </Text>

      <TouchableOpacity
        style={[styles.addFriendButton, { backgroundColor: primaryColor }]}
        onPress={onAddFriend}
      >
        <FontAwesome name="user-plus" size={20} color="white" />
        <Text style={styles.addFriendButtonText}>Find Friends</Text>
      </TouchableOpacity>
    </View>
  );
};

// Component for displaying loading state
const FriendsLoadingState = () => {
  const textColor = useThemeColor({}, "mutedText");

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text style={[styles.loadingText, { color: textColor }]}>
        Loading friends...
      </Text>
    </View>
  );
};

// Component to render a single friend item
const FriendItem = ({
  friend,
  onRemoveFriend,
  onAcceptFriend,
  onRejectFriend,
  onToggleDoubleDateFriend,
  isDoubleDateFriend,
  doubleDateFriendsCount,
}: {
  friend: Friend;
  onRemoveFriend: (friendId: string) => void;
  onAcceptFriend: (friendId: string) => void;
  onRejectFriend: (friendId: string) => void;
  onToggleDoubleDateFriend: (friendId: string, value: boolean) => void;
  isDoubleDateFriend: boolean;
  doubleDateFriendsCount: number;
}) => {
  const cardBackground = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const primaryColor = useThemeColor({}, "primary");
  const dangerColor = useThemeColor({}, "danger") || "#FF3B30";

  const isPending = friend.status === "pending";
  const defaultImage = "https://via.placeholder.com/100";

  // Determine if we should disable the double date toggle
  // Only disable if it's not already selected and we've reached the limit of 3
  const disableDoubleDateToggle =
    !isDoubleDateFriend && doubleDateFriendsCount >= 3;

  return (
    <View style={[styles.friendCard, { backgroundColor: cardBackground }]}>
      <Image
        source={{ uri: friend.photos?.[0] || defaultImage }}
        style={styles.friendAvatar}
      />

      <View style={styles.friendInfo}>
        <Text style={[styles.friendName, { color: textColor }]}>
          {friend.name}
        </Text>

        {friend.username && (
          <Text style={[styles.friendUsername, { color: mutedTextColor }]}>
            @{friend.username}
          </Text>
        )}

        {friend.mutualInterests && friend.mutualInterests.length > 0 && (
          <View style={styles.mutualContainer}>
            <FontAwesome name="star" size={12} color="#FFC107" />
            <Text style={[styles.mutualText, { color: mutedTextColor }]}>
              {friend.mutualInterests.length} shared interests
            </Text>
          </View>
        )}
      </View>

      {!isPending && (
        <View style={styles.doubleDateContainer}>
          <Text style={[styles.doubleDateLabel, { color: mutedTextColor }]}>
            Double Date
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: primaryColor }}
            thumbColor={isDoubleDateFriend ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(value) =>
              onToggleDoubleDateFriend(friend._id, value)
            }
            value={isDoubleDateFriend}
            disabled={disableDoubleDateToggle}
          />
        </View>
      )}

      <View style={styles.actionButtons}>
        {isPending ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: primaryColor }]}
              onPress={() => onAcceptFriend(friend._id)}
            >
              <FontAwesome name="check" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: dangerColor }]}
              onPress={() => onRejectFriend(friend._id)}
            >
              <FontAwesome name="times" size={16} color="white" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: dangerColor }]}
            onPress={() => onRemoveFriend(friend._id)}
          >
            <FontAwesome name="user-times" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function FriendsScreen() {
  console.log("[DEBUG] FriendsScreen mounted");
  const { token, user, loading: authLoading } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [doubleDateFriends, setDoubleDateFriends] = useState<string[]>([]);

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const inputBackground = useThemeColor({}, "inputBackground") || "#F5F5F5";
  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholderText") || "#999";

  // Maximum number of friends allowed
  const MAX_FRIENDS = 3;

  // If authentication is still loading, show a loading indicator
  if (authLoading) {
    return (
      <ThemedView style={[styles.container, styles.centeredContent]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </ThemedView>
    );
  }

  // If user is not authenticated, show the unauthenticated view
  if (!user) {
    return <UnauthenticatedView />;
  }

  // Fetch friends list from API
  const fetchFriends = useCallback(
    async (showRefreshIndicator = false) => {
      // Prevent multiple simultaneous fetches
      if (loading || refreshing) return;

      try {
        if (showRefreshIndicator) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        // Debug log for fetchFriends
        console.log("[DEBUG] fetchFriends called");

        // Fetch data sequentially to prevent race conditions
        const [friendsData, requestsData, doubleDateFriendsData] =
          await Promise.all([
            apiService.get<Friend[]>("/friends").catch((err) => {
              console.log("[DEBUG] Error fetching friends list:", err);
              return [] as Friend[];
            }),
            apiService.get<Friend[]>("/friends/requests").catch((err) => {
              console.log("[DEBUG] Error fetching friend requests:", err);
              return [] as Friend[];
            }),
            apiService
              .get<{ _id: string }[]>("/users/double-date-friends")
              .catch((err) => {
                console.log("[DEBUG] Error fetching double date friends:", err);
                return [] as { _id: string }[];
              }),
          ]);

        // Debug log for API responses
        console.log("[DEBUG] friendsData:", friendsData);
        console.log("[DEBUG] requestsData:", requestsData);
        console.log("[DEBUG] doubleDateFriendsData:", doubleDateFriendsData);

        // Update state with fetched data
        setFriends(friendsData as Friend[]);
        setPendingRequests(requestsData as Friend[]);
        setDoubleDateFriends(
          (doubleDateFriendsData as { _id: string }[]).map(
            (friend) => friend._id
          )
        );
      } catch (error) {
        console.error("[DEBUG] Error fetching friends:", error);
        setError("Failed to load friends. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, loading, refreshing]
  );

  // Use a ref to track if the effect has run to prevent multiple calls
  const effectRan = React.useRef(false);
  const lastFetchTime = React.useRef(0);

  // Fetch friends when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      // Only fetch if it's been more than 5 seconds since last fetch
      if (!effectRan.current || now - lastFetchTime.current > 5000) {
        fetchFriends();
        effectRan.current = true;
        lastFetchTime.current = now;
      }

      return () => {
        effectRan.current = false;
      };
    }, [fetchFriends])
  );

  // Handle search for new friends
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setShowSearchResults(true);

    try {
      const response = await apiService.get(
        `/friends/search?query=${encodeURIComponent(searchQuery)}`
      );
      setSearchResults(Array.isArray(response) ? response : []);
    } catch (error: any) {
      console.error("Search error:", error);
      Alert.alert("Search Error", "Failed to search for friends");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Send a friend request to a user
  const sendFriendRequest = async (friendId: string) => {
    try {
      await apiService.post(`/friends/request/${friendId}`);

      // Update the search results to reflect sent request
      setSearchResults(
        searchResults.map((friend) =>
          friend._id === friendId ? { ...friend, status: "pending" } : friend
        )
      );

      Alert.alert("Success", "Friend request sent!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to send friend request"
      );
    }
  };

  // Accept a friend request
  const acceptFriendRequest = async (friendId: string) => {
    try {
      await apiService.post(`/friends/accept/${friendId}`);

      // Move from pending to accepted friends
      const acceptedFriend = pendingRequests.find((f) => f._id === friendId);
      if (acceptedFriend) {
        setFriends([...friends, { ...acceptedFriend, status: "accepted" }]);
        setPendingRequests(pendingRequests.filter((f) => f._id !== friendId));
      }

      Alert.alert("Success", "Friend request accepted!");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to accept friend request"
      );
    }
  };

  // Reject a friend request
  const rejectFriendRequest = async (friendId: string) => {
    try {
      await apiService.post(`/friends/reject/${friendId}`);
      setPendingRequests(pendingRequests.filter((f) => f._id !== friendId));
      Alert.alert("Success", "Friend request rejected");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to reject friend request"
      );
    }
  };

  // Remove a friend from your friends list
  const removeFriend = async (friendId: string) => {
    Alert.alert(
      "Remove Friend",
      "Are you sure you want to remove this friend?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await apiService.delete(`/friends/${friendId}`);
              setFriends(friends.filter((friend) => friend._id !== friendId));
              Alert.alert("Success", "Friend removed successfully");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to remove friend"
              );
            }
          },
        },
      ]
    );
  };

  // Toggle double date friend status
  const toggleDoubleDateFriend = async (friendId: string, value: boolean) => {
    try {
      if (value) {
        // Add friend to double date list
        if (doubleDateFriends.length >= MAX_FRIENDS) {
          Alert.alert(
            "Maximum Reached",
            `You can only select up to ${MAX_FRIENDS} friends for double dates.`
          );
          return;
        }

        await apiService.post("/users/double-date-friends", { friendId });
        setDoubleDateFriends([...doubleDateFriends, friendId]);
      } else {
        // Remove friend from double date list
        await apiService.delete(`/users/double-date-friends/${friendId}`);
        setDoubleDateFriends(doubleDateFriends.filter((id) => id !== friendId));
      }
    } catch (error) {
      console.error("Error updating double date friends:", error);
      Alert.alert(
        "Error",
        "Failed to update double date friends. Please try again."
      );
    }
  };

  // Handle refresh (pull to refresh)
  const handleRefresh = () => {
    fetchFriends(true);
  };

  // Render the header section with search and add friend functionality
  const renderHeader = () => (
    <View style={styles.header}>
      <View
        style={[styles.searchContainer, { backgroundColor: inputBackground }]}
      >
        <Ionicons name="search" size={20} color={placeholderColor} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search by username"
          placeholderTextColor={placeholderColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery("");
              setShowSearchResults(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color={placeholderColor} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Display double date info section */}
      <View style={styles.doubleDateInfoSection}>
        <Text style={[styles.doubleDateInfoTitle, { color: textColor }]}>
          Double Date Friends ({doubleDateFriends.length}/3)
        </Text>
        <Text style={[styles.doubleDateInfoDescription, { color: textColor }]}>
          Select up to 3 friends you'd like to go on double dates with
        </Text>
      </View>
    </View>
  );

  // Render the main content based on the current state (loading, empty, etc.)
  const renderContent = () => {
    // If there was an error loading friends
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: primaryColor }]}
            onPress={() => fetchFriends()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // If still loading
    if (loading) {
      return <FriendsLoadingState />;
    }

    // If search results should be shown
    if (showSearchResults) {
      if (searching) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        );
      }

      return (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.searchResultItem}
              onPress={() => sendFriendRequest(item._id)}
            >
              <Image
                source={{
                  uri: item.photos?.[0] || "https://via.placeholder.com/100",
                }}
                style={styles.searchResultAvatar}
              />
              <View style={styles.searchResultInfo}>
                <Text style={styles.searchResultName}>{item.name}</Text>
                {item.username && (
                  <Text style={styles.searchResultUsername}>
                    @{item.username}
                  </Text>
                )}
              </View>
              <View style={styles.searchResultAction}>
                <FontAwesome name="user-plus" size={16} color={primaryColor} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptySearchContainer}>
              <Text style={styles.emptySearchText}>
                No users found with that username.
              </Text>
            </View>
          }
        />
      );
    }

    // If no friends and no pending requests
    if (friends.length === 0 && pendingRequests.length === 0) {
      return (
        <FriendsEmptyState onAddFriend={() => setShowSearchResults(true)} />
      );
    }

    // Otherwise, show the friends list
    const allItems = [...pendingRequests, ...friends];

    return (
      <FlatList
        data={allItems}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <FriendItem
            friend={item}
            onRemoveFriend={removeFriend}
            onAcceptFriend={acceptFriendRequest}
            onRejectFriend={rejectFriendRequest}
            onToggleDoubleDateFriend={toggleDoubleDateFriend}
            isDoubleDateFriend={doubleDateFriends.includes(item._id)}
            doubleDateFriendsCount={doubleDateFriends.length}
          />
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Show search results header if search results are displayed */}
      {showSearchResults && (
        <View style={styles.searchResultsHeader}>
          <TouchableOpacity
            onPress={() => {
              setShowSearchResults(false);
              setSearchQuery("");
            }}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.searchResultsTitle, { color: textColor }]}>
            Search Results
          </Text>
        </View>
      )}

      {/* Main content */}
      {renderContent()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 46,
    paddingLeft: 8,
    fontSize: 16,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  friendCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
  },
  friendUsername: {
    fontSize: 14,
    marginTop: 2,
  },
  mutualContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  mutualText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  addFriendButton: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  addFriendButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  searchResultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  searchResultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  searchResultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "600",
  },
  searchResultUsername: {
    fontSize: 14,
    color: "#666",
  },
  searchResultAction: {
    paddingHorizontal: 16,
  },
  emptySearchContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptySearchText: {
    fontSize: 16,
    textAlign: "center",
  },
  doubleDateContainer: {
    marginRight: 8,
    alignItems: "center",
  },
  doubleDateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  doubleDateInfoSection: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  doubleDateInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  doubleDateInfoDescription: {
    fontSize: 14,
  },
});

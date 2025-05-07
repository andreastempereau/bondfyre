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
}: {
  friend: Friend;
  onRemoveFriend: (friendId: string) => void;
  onAcceptFriend: (friendId: string) => void;
  onRejectFriend: (friendId: string) => void;
}) => {
  const cardBackground = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const primaryColor = useThemeColor({}, "primary");
  const dangerColor = useThemeColor({}, "danger") || "#FF3B30";

  const isPending = friend.status === "pending";
  const defaultImage = "https://via.placeholder.com/100";

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
      try {
        if (showRefreshIndicator) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        // Get friends
        const friendsResponse = await apiService.get("/friends");
        setFriends(Array.isArray(friendsResponse) ? friendsResponse : []);

        // Get pending friend requests
        const pendingResponse = await apiService.get("/friends/pending");
        setPendingRequests(
          Array.isArray(pendingResponse) ? pendingResponse : []
        );

        setError(null);
      } catch (error: any) {
        console.error("Error fetching friends:", error);
        setError("Failed to load friends");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  // Search for potential friends
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

  // Send friend request
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

  // Accept friend request
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

  // Reject friend request
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

  // Remove friend
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

  // Refresh data
  const handleRefresh = () => {
    fetchFriends(true);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  // Fetch friends when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchFriends();
    }, [fetchFriends])
  );

  // Check if user has reached max friends limit
  const hasReachedFriendsLimit = friends.length >= MAX_FRIENDS;

  // Render the header with search functionality
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: textColor }]}>My Friends</Text>
      <Text style={[styles.subtitle, { color: textColor }]}>
        {friends.length}/{MAX_FRIENDS} friends added
      </Text>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: inputBackground }]}>
          <FontAwesome
            name="search"
            size={18}
            color={placeholderColor}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search by name or username"
            placeholderTextColor={placeholderColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searching && <ActivityIndicator size="small" color={primaryColor} />}
        </View>

        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: primaryColor }]}
          onPress={handleSearch}
          disabled={searching || !searchQuery.trim()}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {renderHeader()}

      {error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#FF3B30"
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchFriends()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : loading && !refreshing ? (
        <FriendsLoadingState />
      ) : showSearchResults ? (
        <View style={styles.resultsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Search Results
            </Text>
            <TouchableOpacity onPress={() => setShowSearchResults(false)}>
              <Text style={[styles.sectionAction, { color: primaryColor }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          {searchResults.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color="#CCC" />
              <Text style={[styles.noResultsText, { color: textColor }]}>
                No users found
              </Text>
              <Text
                style={[styles.noResultsSubtext, { color: placeholderColor }]}
              >
                Try searching with a different name or username
              </Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.resultItem,
                    { backgroundColor: inputBackground },
                  ]}
                >
                  <Image
                    source={{
                      uri:
                        item.photos?.[0] || "https://via.placeholder.com/100",
                    }}
                    style={styles.resultAvatar}
                  />
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultName, { color: textColor }]}>
                      {item.name}
                    </Text>
                    {item.username && (
                      <Text
                        style={[
                          styles.resultUsername,
                          { color: placeholderColor },
                        ]}
                      >
                        @{item.username}
                      </Text>
                    )}
                  </View>

                  {item.status === "pending" ? (
                    <TouchableOpacity style={[styles.pendingButton]}>
                      <Text style={styles.pendingButtonText}>Pending</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        hasReachedFriendsLimit && styles.disabledButton,
                        {
                          backgroundColor: hasReachedFriendsLimit
                            ? "#CCC"
                            : primaryColor,
                        },
                      ]}
                      onPress={() => sendFriendRequest(item._id)}
                      disabled={hasReachedFriendsLimit}
                    >
                      <Text style={styles.addButtonText}>
                        {hasReachedFriendsLimit ? "Limit Reached" : "Add"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              contentContainerStyle={styles.resultsList}
            />
          )}
        </View>
      ) : friends.length === 0 && pendingRequests.length === 0 ? (
        <FriendsEmptyState onAddFriend={handleSearch} />
      ) : (
        <FlatList
          data={[
            ...(pendingRequests.length > 0
              ? [
                  {
                    _id: "pending-header",
                    header: true,
                    title: "Pending Requests",
                  },
                ]
              : []),
            ...pendingRequests,
            ...(friends.length > 0
              ? [{ _id: "friends-header", header: true, title: "My Friends" }]
              : []),
            ...friends,
          ]}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            if ("header" in item && item.header) {
              return (
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>
                    {item.title}
                  </Text>
                </View>
              );
            }

            const friend = item as Friend;
            return (
              <FriendItem
                friend={friend}
                onRemoveFriend={removeFriend}
                onAcceptFriend={acceptFriendRequest}
                onRejectFriend={rejectFriendRequest}
              />
            );
          }}
          contentContainerStyle={styles.friendsList}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 48,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  searchButton: {
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "500",
  },
  friendsList: {
    padding: 16,
    paddingTop: 0,
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  resultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 10,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "500",
  },
  resultUsername: {
    fontSize: 12,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
  },
  pendingButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  pendingButtonText: {
    color: "#777",
    fontWeight: "500",
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 24,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  addFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 24,
  },
  addFriendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});

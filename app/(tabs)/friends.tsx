import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Contacts from "expo-contacts";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Share,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Import internal components
import { AuthScreen } from "../../app/auth";
import { InviteCodeCard, JoinGroupModal } from "../../src/components/groups";
import ThemedView from "../../src/components/layout/ThemedView";
import Text from "../../src/components/ui/Text";

// Import contexts and services
import { Config } from "../../src/config/environment";
import { useAuth } from "../../src/contexts/AuthContext";
import { useThemeColor } from "../../src/hooks/useThemeColor";
import { apiService } from "../../src/services/apiService";

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
const FriendsEmptyState: React.FC<{ onAddFriend: () => void }> = ({
  onAddFriend,
}) => {
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
      <View style={{ height: 20 }}></View>
      <TouchableOpacity
        style={[styles.addFriendButton, { backgroundColor: primaryColor }]}
        onPress={onAddFriend}
      >
        <FontAwesome name="user-plus" size={20} color="white" />
        <Text style={styles.addFriendButtonText}>Invite Friends</Text>
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

// Contact data structure
interface ContactItem {
  id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  selected?: boolean;
}

const FriendsScreen = () => {
  // Context and state
  const { token, user, loading: authLoading, refreshToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  // Track double date friend selection
  const [doubleDateFriends, setDoubleDateFriends] = useState<Set<string>>(
    new Set()
  );

  // Friend invitation states
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [inviteCode, setInviteCode] = useState(
    "BF" + Math.random().toString(36).substring(2, 10).toUpperCase()
  );
  const [isCopied, setIsCopied] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const inputBackground = useThemeColor({}, "inputBackground") || "#F5F5F5";
  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholderText") || "#999";

  // Maximum number of friends allowed
  const MAX_FRIENDS = 3;

  // Use a ref to track if the effect has run to prevent multiple calls
  const effectRan = React.useRef(false);
  const lastFetchTime = React.useRef(0);

  // Enhanced fetchData with token refresh capability
  const fetchData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      // Attempt to fetch friends
      const [friendsData, requestsData] = await Promise.all([
        apiService.get<Friend[]>("/friends"),
        apiService.get<Friend[]>("/friends/requests"),
      ]);

      setFriends(friendsData || []);
      setPendingRequests(requestsData || []);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching friends data:", error);

      // If we get an authentication error, try refreshing the token
      if (error.response?.status === 401 || error.response?.status === 403) {
        try {
          // Attempt to refresh token
          const refreshed = await refreshToken();
          if (refreshed) {
            // If token refreshed successfully, try fetching data again
            const [friendsData, requestsData] = await Promise.all([
              apiService.get<Friend[]>("/friends"),
              apiService.get<Friend[]>("/friends/requests"),
            ]);

            setFriends(friendsData || []);
            setPendingRequests(requestsData || []);
            setLoading(false);
            return;
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }

      // If we reach here, either the token refresh failed or it wasn't an auth error
      setError(`Error loading friends: ${error.message || "Unknown error"}`);
      setLoading(false);
    }
  }, [token, refreshToken]);

  // Request contacts permission and get contacts
  const getContacts = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Permission to access contacts was denied"
        );
        return;
      }

      setContactsLoading(true);
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
      });

      if (data.length > 0) {
        const formattedContacts: ContactItem[] = data
          .filter(
            (contact) =>
              contact.name &&
              (contact.phoneNumbers || contact.emails) &&
              contact.id
          )
          .map((contact) => ({
            id: contact.id as string,
            name: contact.name || "Unknown",
            phoneNumber: contact.phoneNumbers
              ? contact.phoneNumbers[0]?.number
              : undefined,
            email: contact.emails ? contact.emails[0]?.email : undefined,
            selected: false,
          }));

        setContacts(formattedContacts);
        setShowContactsModal(true);
      } else {
        Alert.alert("No Contacts", "No contacts found on your device");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load contacts");
      console.error("Error loading contacts:", error);
    } finally {
      setContactsLoading(false);
    }
  };

  // Toggle contact selection
  const toggleContactSelection = (contactId: string) => {
    const updatedContacts = contacts.map((contact) =>
      contact.id === contactId
        ? { ...contact, selected: !contact.selected }
        : contact
    );
    setContacts(updatedContacts);
  };

  // Handle invite code copy
  const handleCopyInviteCode = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle sharing invite code
  const shareInviteCode = async () => {
    try {
      await Share.share({
        message: `Join me on 2UO! Use my invite code: ${inviteCode}`,
      });
    } catch (error) {
      console.error("Error sharing invite code:", error);
    }
  };

  // Save selected contacts
  const saveSelectedContacts = () => {
    const selectedContacts = contacts.filter((contact) => contact.selected);
    // You would typically send these contacts to your API to send invites
    Alert.alert(
      "Invitations Sent",
      `Invitations sent to ${selectedContacts.length} contacts`
    );
    setShowContactsModal(false);
  };

  // Open invite options menu
  const showInviteOptions = () => {
    Alert.alert(
      "Invite Friends",
      "Choose how you want to invite friends",
      [
        {
          text: "Import from Contacts",
          onPress: getContacts,
        },
        {
          text: "Share Invite Code",
          onPress: () => setShowInviteCodeModal(true),
        },
        {
          text: "Enter Invite Code",
          onPress: () => setShowJoinGroupModal(true),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  // Search for users to add as friends
  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim() || !token) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const results = await apiService.get<Friend[]>(
          `/friends/search?q=${encodeURIComponent(query.trim())}`
        );
        setSearchResults(results || []);
      } catch (error: any) {
        console.error("Search error:", error);

        // If we get an authentication error, try refreshing the token
        if (error.response?.status === 401 || error.response?.status === 403) {
          try {
            // Attempt to refresh token
            const refreshed = await refreshToken();
            if (refreshed) {
              // If token refreshed successfully, try the search again
              const results = await apiService.get<Friend[]>(
                `/friends/search?q=${encodeURIComponent(query.trim())}`
              );
              setSearchResults(results || []);
              setSearchLoading(false);
              return;
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }

        // Show error state
        Alert.alert("Search Error", "Unable to search for users");
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [token, refreshToken]
  );

  // Add a useEffect to perform the initial fetch when the component mounts
  React.useEffect(() => {
    if (!effectRan.current) {
      fetchData();
      effectRan.current = true;
      lastFetchTime.current = Date.now();
    }
  }, [fetchData]);

  // Fetch friends when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      // Only fetch if it's been more than 5 seconds since last fetch
      if (now - lastFetchTime.current > 5000) {
        fetchData();
        lastFetchTime.current = now;
      }

      return () => {
        // Cleanup
      };
    }, [fetchData])
  );

  // API connection check function
  const debugApiConnection = async () => {
    try {
      // Get the token from AsyncStorage
      const storedToken = await AsyncStorage.getItem(
        Config.STORAGE_KEYS.AUTH_TOKEN
      );

      // Try an auth endpoint first as a control test
      try {
        await fetch(`${Config.API_URL}/auth`, {
          headers: {
            Authorization: storedToken ? `Bearer ${storedToken}` : "",
            "Content-Type": "application/json",
          },
        });
      } catch (authError) {
        // Auth endpoint error
      }

      // Now test the friends endpoint specifically
      try {
        const friendsResponse = await fetch(`${Config.API_URL}/friends`, {
          headers: {
            Authorization: storedToken ? `Bearer ${storedToken}` : "",
            "Content-Type": "application/json",
          },
        });

        if (!friendsResponse.ok) {
          await friendsResponse.json().catch(() => ({}));
        }
      } catch (friendsError) {
        // Friends endpoint error
      }
    } catch (error) {
      // Debug API connection error
    }
  };

  // If authentication is still loading, show a loading indicator
  if (authLoading) {
    return (
      <ThemedView style={[styles.container, styles.centeredContent]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </ThemedView>
    );
  }

  // If user is not authenticated, show the auth screen
  if (!user) {
    return <AuthScreen />;
  }

  // Handle search for new friends
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setShowSearch(true);

    try {
      await searchUsers(searchQuery);
    } catch (error: any) {
      console.error("Search error:", error);
      Alert.alert("Search Error", "Failed to search for friends");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Send a friend request to a user
  const sendFriendRequest = async (friendId: string) => {
    try {
      await apiService.post(`/friends/request/${friendId}`);

      // Update search results to show pending status
      setSearchResults(
        searchResults.map((f) =>
          f._id === friendId ? { ...f, status: "pending" } : f
        )
      );

      Alert.alert("Success", "Friend request sent!");
    } catch (error: any) {
      console.error("Error sending friend request:", error);

      // If we get an authentication error, try refreshing the token
      if (error.response?.status === 401 || error.response?.status === 403) {
        try {
          // Attempt to refresh token
          const refreshed = await refreshToken();
          if (refreshed) {
            // If token refreshed successfully, try sending request again
            await apiService.post(`/friends/request/${friendId}`);

            // Update search results to show pending status
            setSearchResults(
              searchResults.map((f) =>
                f._id === friendId ? { ...f, status: "pending" } : f
              )
            );

            Alert.alert("Success", "Friend request sent!");
            return;
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }

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
      console.error("Error accepting friend request:", error);

      // If we get an authentication error, try refreshing the token
      if (error.response?.status === 401 || error.response?.status === 403) {
        try {
          // Attempt to refresh token
          const refreshed = await refreshToken();
          if (refreshed) {
            // If token refreshed successfully, try accepting request again
            console.log("Token refreshed, retrying accept friend request");
            await apiService.post(`/friends/accept/${friendId}`);

            // Move from pending to accepted friends
            const acceptedFriend = pendingRequests.find(
              (f) => f._id === friendId
            );
            if (acceptedFriend) {
              setFriends([
                ...friends,
                { ...acceptedFriend, status: "accepted" },
              ]);
              setPendingRequests(
                pendingRequests.filter((f) => f._id !== friendId)
              );
            }

            Alert.alert("Success", "Friend request accepted!");
            return;
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }

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
      console.error("Error rejecting friend request:", error);

      // If we get an authentication error, try refreshing the token
      if (error.response?.status === 401 || error.response?.status === 403) {
        try {
          // Attempt to refresh token
          const refreshed = await refreshToken();
          if (refreshed) {
            // If token refreshed successfully, try rejecting request again
            console.log("Token refreshed, retrying reject friend request");
            await apiService.post(`/friends/reject/${friendId}`);

            setPendingRequests(
              pendingRequests.filter((f) => f._id !== friendId)
            );
            Alert.alert("Success", "Friend request rejected");
            return;
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }

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
              console.error("Error removing friend:", error);

              // If we get an authentication error, try refreshing the token
              if (
                error.response?.status === 401 ||
                error.response?.status === 403
              ) {
                try {
                  // Attempt to refresh token
                  const refreshed = await refreshToken();
                  if (refreshed) {
                    // If token refreshed successfully, try removing friend again
                    console.log("Token refreshed, retrying remove friend");
                    await apiService.delete(`/friends/${friendId}`);

                    setFriends(
                      friends.filter((friend) => friend._id !== friendId)
                    );
                    Alert.alert("Success", "Friend removed successfully");
                    return;
                  }
                } catch (refreshError) {
                  console.error("Token refresh failed:", refreshError);
                }
              }

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
        if (doubleDateFriends.size >= MAX_FRIENDS) {
          Alert.alert(
            "Maximum Reached",
            `You can only select up to ${MAX_FRIENDS} friends for double dates.`
          );
          return;
        }

        await apiService.post("/users/double-date-friends", { friendId });
        setDoubleDateFriends(new Set(doubleDateFriends).add(friendId));
      } else {
        // Remove friend from double date list
        await apiService.delete(`/users/double-date-friends/${friendId}`);
        const updatedSet = new Set(doubleDateFriends);
        updatedSet.delete(friendId);
        setDoubleDateFriends(updatedSet);
      }
    } catch (error: any) {
      console.error("Error updating double date friends:", error);

      // If we get an authentication error, try refreshing the token
      if (error.response?.status === 401 || error.response?.status === 403) {
        try {
          // Attempt to refresh token
          const refreshed = await refreshToken();
          if (refreshed) {
            console.log("Token refreshed, retrying toggle double date friend");
            // Retry the operation after token refresh
            if (value) {
              await apiService.post("/users/double-date-friends", { friendId });
              setDoubleDateFriends(new Set(doubleDateFriends).add(friendId));
            } else {
              await apiService.delete(`/users/double-date-friends/${friendId}`);
              const updatedSet = new Set(doubleDateFriends);
              updatedSet.delete(friendId);
              setDoubleDateFriends(updatedSet);
            }
            return;
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }
      }

      Alert.alert(
        "Error",
        "Failed to update double date friends. Please try again."
      );
    }
  };

  // Handle refresh (pull to refresh)
  const handleRefresh = () => {
    fetchData();
  };

  // Add button to error state for manual testing
  const renderError = () => (
    <View style={styles.errorContainer}>
      <FontAwesome
        name="exclamation-triangle"
        size={40}
        color="#FF6B6B"
        style={{ marginBottom: 20 }}
      />
      <Text style={styles.errorText}>{error}</Text>
      <View style={styles.errorButtonsContainer}>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: primaryColor }]}
          onPress={() => fetchData()}
        >
          <Text style={styles.retryButtonText}>Retry Normal Fetch</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: "#4A90E2", marginTop: 10 },
          ]}
          onPress={() => debugApiConnection()}
        >
          <Text style={styles.retryButtonText}>Debug API Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.retryButton,
            { backgroundColor: "#50C878", marginTop: 10 },
          ]}
          onPress={() => refreshToken()}
        >
          <Text style={styles.retryButtonText}>Try Token Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
              setShowSearch(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color={placeholderColor} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Invite Friends Button */}
      <TouchableOpacity
        style={[styles.inviteFriendsButton, { backgroundColor: primaryColor }]}
        onPress={showInviteOptions}
      >
        <FontAwesome
          name="user-plus"
          size={16}
          color="white"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.inviteFriendsButtonText}>Invite Friends</Text>
      </TouchableOpacity>

      {/* Display double date info section */}
      <View style={styles.doubleDateInfoSection}>
        <Text style={[styles.doubleDateInfoTitle, { color: textColor }]}>
          Double Date Friends ({doubleDateFriends.size}/3)
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
      return renderError();
    }

    // If still loading
    if (loading) {
      return <FriendsLoadingState />;
    }

    // If search results should be shown
    if (showSearch) {
      if (searchLoading) {
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
      return <FriendsEmptyState onAddFriend={showInviteOptions} />;
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
            isDoubleDateFriend={doubleDateFriends.has(item._id)}
            doubleDateFriendsCount={doubleDateFriends.size}
          />
        )}
        refreshing={loading}
        onRefresh={handleRefresh}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Show search results header if search results are displayed */}
      {showSearch && (
        <View style={styles.searchResultsHeader}>
          <TouchableOpacity
            onPress={() => {
              setShowSearch(false);
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

      {/* Contacts Modal */}
      <Modal
        visible={showContactsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowContactsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Contacts</Text>
              <TouchableOpacity
                onPress={() => setShowContactsModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {contactsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
                <Text style={styles.loadingText}>Loading contacts...</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={contacts}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.contactItem,
                        item.selected && styles.selectedContactItem,
                      ]}
                      onPress={() => toggleContactSelection(item.id)}
                    >
                      <View style={styles.contactAvatar}>
                        <Text style={styles.avatarText}>
                          {item.name.charAt(0)}
                        </Text>
                      </View>

                      <View style={styles.contactInfo}>
                        <Text style={styles.contactName}>{item.name}</Text>
                        {item.phoneNumber && (
                          <Text style={styles.contactDetail}>
                            {item.phoneNumber}
                          </Text>
                        )}
                      </View>

                      <View style={styles.selectedIndicator}>
                        {item.selected ? (
                          <MaterialIcons
                            name="check-circle"
                            size={24}
                            color="#FF6B6B"
                          />
                        ) : (
                          <MaterialIcons
                            name="radio-button-unchecked"
                            size={24}
                            color="#CCC"
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id}
                  style={styles.contactsList}
                  contentContainerStyle={styles.contactsListContent}
                />

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { backgroundColor: primaryColor },
                  ]}
                  onPress={saveSelectedContacts}
                >
                  <Text style={styles.primaryButtonText}>Send Invites</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Invite Code Modal */}
      <Modal
        visible={showInviteCodeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInviteCodeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Invite Code</Text>
              <TouchableOpacity
                onPress={() => setShowInviteCodeModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inviteCodeContainer}>
              <InviteCodeCard
                inviteCode={inviteCode}
                onCopy={handleCopyInviteCode}
              />

              {isCopied && (
                <View style={styles.copiedMessage}>
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#4CAF50"
                  />
                  <Text style={styles.copiedText}>Copied to clipboard!</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  { backgroundColor: primaryColor, marginTop: 16 },
                ]}
                onPress={shareInviteCode}
              >
                <MaterialIcons
                  name="share"
                  size={18}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.primaryButtonText}>Share Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Group Modal */}
      <JoinGroupModal
        visible={showJoinGroupModal}
        onClose={() => setShowJoinGroupModal(false)}
        onGroupJoined={() => {
          Alert.alert("Success", "You have successfully joined the group!");
          setShowJoinGroupModal(false);
        }}
      />
    </ThemedView>
  );
};

export default FriendsScreen;

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
  errorButtonsContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 8,
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
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  contactsList: {
    flex: 1,
    marginBottom: 16,
  },
  contactsListContent: {
    paddingBottom: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  selectedContactItem: {
    backgroundColor: "#FFF0F0",
    borderColor: "#FFD6DE",
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFEFEF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  contactDetail: {
    fontSize: 14,
    color: "#777",
  },
  selectedIndicator: {
    width: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  inviteCodeContainer: {
    padding: 8,
  },
  copiedMessage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  copiedText: {
    marginLeft: 6,
    color: "#4CAF50",
    fontSize: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  inviteFriendsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  inviteFriendsButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
});

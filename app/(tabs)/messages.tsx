import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import ThemedView from "../../src/components/layout/ThemedView";
import Text from "../../src/components/ui/Text";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../../src/hooks/useThemeColor";
import { apiService } from "../../src/services/apiService";
import { useAuth } from "../../src/contexts/AuthContext";
import { AuthScreen } from "../../app/auth";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

// Interface for chat data
interface Chat {
  _id: string;
  name: string;
  participants: {
    _id: string;
    name: string;
    photos?: string[];
  }[];
  isDoubleDateChat?: boolean;
  matchPairs?: {
    user1: string;
    user2: string;
    relationship: "match" | "friends";
  }[];
  latestMessage?: {
    _id: string;
    content: string;
    sender: {
      _id: string;
      name: string;
    };
    createdAt: string;
  };
  updatedAt: string;
}

export default function MessagesScreen() {
  const { user, loading: authLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  // Theme colors
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const cardBackground = useThemeColor({}, "card");
  const inputBackground = useThemeColor({}, "inputBackground") || "#F5F5F5";
  const primaryColor = useThemeColor({}, "primary");
  const placeholderColor = useThemeColor({}, "placeholderText") || "#999";

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

  // Fetch chats from API
  const fetchChats = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Get all group chats for the user
      const response = await apiService.get<Chat[]>("/group-chats");
      setChats(response || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching chats:", error);
      setError("Failed to load chats. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch chats when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
  );

  // Handle chat open
  const handleChatPress = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  // Filter chats by search query
  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format the time difference for display
  const formatTimeDifference = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  // Render a chat item
  const renderChatItem = ({ item }: { item: Chat }) => {
    // Get the first two participants' photos (excluding the current user)
    const otherParticipants = item.participants.filter(
      (p) => p._id !== user?._id
    );

    // Default image if no photos
    const defaultImage = "https://via.placeholder.com/50";

    // Time ago for latest message
    const timeAgo = item.latestMessage
      ? formatTimeDifference(item.latestMessage.createdAt)
      : formatTimeDifference(item.updatedAt);

    return (
      <TouchableOpacity
        style={[styles.chatCard, { backgroundColor: cardBackground }]}
        onPress={() => handleChatPress(item._id)}
      >
        <View style={styles.avatarContainer}>
          {item.isDoubleDateChat ? (
            // Show double date icon or special avatar group
            <View style={styles.doubleDateAvatarContainer}>
              {otherParticipants.slice(0, 2).map((participant, index) => (
                <Image
                  key={participant._id}
                  source={{ uri: participant.photos?.[0] || defaultImage }}
                  style={[
                    styles.smallAvatar,
                    { top: index * 8, left: index * 8, zIndex: 2 - index },
                  ]}
                />
              ))}
              <View style={styles.doubleDateBadge}>
                <FontAwesome name="heart" size={10} color="#fff" />
              </View>
            </View>
          ) : (
            // Regular chat avatar
            <Image
              source={{
                uri: otherParticipants[0]?.photos?.[0] || defaultImage,
              }}
              style={styles.avatar}
            />
          )}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text
              style={[styles.chatName, { color: textColor }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={[styles.timestamp, { color: mutedTextColor }]}>
              {timeAgo}
            </Text>
          </View>

          <View style={styles.messagePreview}>
            <Text
              style={[styles.previewText, { color: mutedTextColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.latestMessage
                ? `${item.latestMessage.sender.name}: ${item.latestMessage.content}`
                : "No messages yet"}
            </Text>

            {item.isDoubleDateChat && (
              <View style={styles.doubleDateIndicator}>
                <Text style={styles.doubleDateText}>Double Date</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Empty state when no chats available
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={80} color={mutedTextColor} />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        No Chats Yet
      </Text>
      <Text style={[styles.emptyMessage, { color: mutedTextColor }]}>
        Your chats will appear here. Start swiping to find matches!
      </Text>
    </View>
  );

  // Loading state
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={primaryColor} />
      <Text style={[styles.loadingText, { color: mutedTextColor }]}>
        Loading chats...
      </Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Messages</Text>
      </View>

      <View
        style={[styles.searchContainer, { backgroundColor: inputBackground }]}
      >
        <Ionicons name="search" size={20} color={placeholderColor} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search messages..."
          placeholderTextColor={placeholderColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={placeholderColor} />
          </TouchableOpacity>
        ) : null}
      </View>

      {loading && !refreshing ? (
        renderLoading()
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          onRefresh={() => fetchChats(true)}
          refreshing={refreshing}
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 12,
    height: 46,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    paddingLeft: 8,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  chatCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  doubleDateAvatarContainer: {
    width: 50,
    height: 50,
    position: "relative",
  },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    position: "absolute",
    borderWidth: 2,
    borderColor: "#fff",
  },
  doubleDateBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF6B6B",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 3,
  },
  chatInfo: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 8,
  },
  messagePreview: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewText: {
    fontSize: 14,
    flex: 1,
  },
  doubleDateIndicator: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  doubleDateText: {
    fontSize: 10,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
});

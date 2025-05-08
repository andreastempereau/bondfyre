import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { apiService } from "../../services/apiService";
import { useThemeColor } from "../../hooks/useThemeColor";
import Text from "../ui/Text";

interface Friend {
  _id: string;
  name: string;
  photos: string[];
  username?: string;
}

interface DoubleDateFriendSelectorProps {
  onSelectionChange?: (selectedFriends: Friend[]) => void;
}

export const DoubleDateFriendSelector: React.FC<
  DoubleDateFriendSelectorProps
> = ({ onSelectionChange }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [doubleDateFriends, setDoubleDateFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const cardBackground = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const primaryColor = useThemeColor({}, "primary");

  // Fetch friends and currently selected double date friends
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get friends and double date friends in parallel
        const [friendsResponse, doubleDateResponse] = await Promise.all([
          apiService.get("/friends"),
          apiService.get("/users/double-date-friends"),
        ]);

        setFriends((friendsResponse as Friend[]) || []);
        setDoubleDateFriends((doubleDateResponse as Friend[]) || []);

        // Notify parent component of initial selection
        if (onSelectionChange) {
          onSelectionChange((doubleDateResponse as Friend[]) || []);
        }
      } catch (error) {
        console.error("Error fetching friends data:", error);
        setError("Failed to load friends. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Toggle selection of a friend for double dates
  const toggleFriendSelection = async (friend: Friend) => {
    try {
      const isSelected = doubleDateFriends.some((f) => f._id === friend._id);

      if (isSelected) {
        // Remove from double date friends
        await apiService.delete(`/users/double-date-friends/${friend._id}`);

        const updatedSelection = doubleDateFriends.filter(
          (f) => f._id !== friend._id
        );
        setDoubleDateFriends(updatedSelection);

        if (onSelectionChange) {
          onSelectionChange(updatedSelection);
        }
      } else {
        // Check if we've reached the maximum of 3
        if (doubleDateFriends.length >= 3) {
          Alert.alert(
            "Maximum Reached",
            "You can only select up to 3 friends for double dates."
          );
          return;
        }

        // Add to double date friends
        await apiService.post("/users/double-date-friends", {
          friendId: friend._id,
        });

        const updatedSelection = [...doubleDateFriends, friend];
        setDoubleDateFriends(updatedSelection);

        if (onSelectionChange) {
          onSelectionChange(updatedSelection);
        }
      }
    } catch (error) {
      console.error("Error updating double date friends:", error);
      Alert.alert(
        "Error",
        "Failed to update double date friends. Please try again."
      );
    }
  };

  // Render a friend item
  const renderFriendItem = ({ item }: { item: Friend }) => {
    const isSelected = doubleDateFriends.some((f) => f._id === item._id);
    const defaultImage = "https://via.placeholder.com/100";

    return (
      <TouchableOpacity
        style={[styles.friendItem, { backgroundColor: cardBackground }]}
        onPress={() => toggleFriendSelection(item)}
      >
        <Image
          source={{ uri: item.photos?.[0] || defaultImage }}
          style={styles.friendAvatar}
        />

        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, { color: textColor }]}>
            {item.name}
          </Text>
          {item.username && (
            <Text style={[styles.friendUsername, { color: mutedTextColor }]}>
              @{item.username}
            </Text>
          )}
        </View>

        <View
          style={[
            styles.selectionIndicator,
            {
              backgroundColor: isSelected ? primaryColor : "transparent",
              borderColor: isSelected ? primaryColor : mutedTextColor,
            },
          ]}
        >
          {isSelected && <FontAwesome name="check" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={[styles.loadingText, { color: mutedTextColor }]}>
          Loading friends...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={40} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: primaryColor }]}
          onPress={() => {
            setLoading(true);
            setError(null);
            // Re-fetch the data
            apiService
              .get("/friends")
              .then((response) => setFriends((response as Friend[]) || []))
              .catch(() => {
                setError("Failed to load friends. Please try again.");
              })
              .finally(() => setLoading(false));
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (friends.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={60} color={mutedTextColor} />
        <Text style={[styles.emptyTitle, { color: textColor }]}>
          No Friends Yet
        </Text>
        <Text style={[styles.emptyMessage, { color: mutedTextColor }]}>
          Add friends to select for double dates
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.selectionInfo}>
        <Text style={[styles.selectionTitle, { color: textColor }]}>
          Double Date Friends ({doubleDateFriends.length}/3)
        </Text>
        <Text style={[styles.selectionDescription, { color: mutedTextColor }]}>
          Select up to 3 friends you'd like to go on double dates with
        </Text>
      </View>

      <FlatList
        data={friends}
        renderItem={renderFriendItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginVertical: 10,
    fontSize: 16,
    textAlign: "center",
    color: "#FF3B30",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 10,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  selectionInfo: {
    padding: 16,
    marginBottom: 8,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  selectionDescription: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  selectionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DoubleDateFriendSelector;

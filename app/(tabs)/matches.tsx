import {
  StyleSheet,
  View,
  FlatList,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { apiService } from "../../src/services/apiService";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

// Define the Match type based on backend response
interface MatchUser {
  _id: string;
  name: string;
  age: number;
  photos: string[];
  gender?: string;
}

interface Match {
  _id: string;
  user: MatchUser;
  matchedUser: MatchUser;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export default function MatchesScreen() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const fetchMatches = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await apiService.get<Match[]>("/matches");

      // Sort matches by creation date - newest first
      const sortedMatches = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setMatches(sortedMatches);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
      setError("Failed to load matches");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch matches when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [fetchMatches])
  );

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return "just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleMatchPress = (match: Match) => {
    // Navigate to messages with the match ID
    router.push(`/messages/${match._id}`);
  };

  const renderMatch = ({ item }: { item: Match }) => {
    // Determine which user to display based on the current user
    const isCurrentUser = item.user._id === user?._id;
    const otherUser = isCurrentUser ? item.matchedUser : item.user;

    const profileImage =
      otherUser.photos?.length > 0
        ? otherUser.photos[0]
        : "https://via.placeholder.com/150";

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => handleMatchPress(item)}
      >
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <View style={styles.matchInfo}>
          <Text style={styles.name}>
            {otherUser.name}
            {otherUser.age ? `, ${otherUser.age}` : ""}
          </Text>
          <Text style={styles.matchType}>
            {otherUser.gender ? (
              <Text style={styles.lastMessage}>{otherUser.gender}</Text>
            ) : (
              <Text style={styles.lastMessage}>New match! Say hi 👋</Text>
            )}
          </Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timestamp}>{getTimeAgo(item.createdAt)}</Text>
          <View style={styles.newIndicator} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <ActivityIndicator size="large" color="#FF4C67" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centeredContent]}>
        <FontAwesome name="exclamation-circle" size={50} color="#FF4C67" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchMatches()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Matches</Text>
      </View>

      {matches.length > 0 ? (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchMatches(true)}
              colors={["#FF4C67"]}
              tintColor="#FF4C67"
            />
          }
        />
      ) : (
        <View style={[styles.container, styles.centeredContent]}>
          <FontAwesome
            name="heart"
            size={60}
            color="#FF4C67"
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>No matches yet</Text>
          <Text style={styles.emptySubText}>
            Swipe right to match with people!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centeredContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  listContainer: {
    padding: 16,
  },
  matchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
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
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#FF4C67",
  },
  matchInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  matchType: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  timeContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 40,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  newIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF4C67",
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
    backgroundColor: "#FF4C67",
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});

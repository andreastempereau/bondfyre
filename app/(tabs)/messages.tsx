import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Text,
} from "react-native";
import React, { useState } from "react";

// Temporary mock data - will be replaced with backend data later
const MOCK_MESSAGES = [
  {
    id: "1",
    matchId: "1",
    matchName: "Sarah",
    lastMessage: "Hey, how are you?",
    timestamp: "2m ago",
    unread: true,
  },
  {
    id: "2",
    matchId: "2",
    matchName: "Mike",
    lastMessage: "Want to grab coffee?",
    timestamp: "1h ago",
    unread: false,
  },
];

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const renderMessage = ({ item }: { item: (typeof MOCK_MESSAGES)[0] }) => (
    <TouchableOpacity style={styles.messageCard}>
      <View style={styles.messageInfo}>
        <Text style={styles.matchName}>{item.matchName}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      <View style={styles.messageMeta}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        {item.unread && <View style={styles.unreadBadge} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={MOCK_MESSAGES}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  messageCard: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  messageInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  messageMeta: {
    alignItems: "flex-end",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
  },
});

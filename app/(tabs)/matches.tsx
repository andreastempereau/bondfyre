import { StyleSheet, View, FlatList, Image, Text } from 'react-native';
import React from 'react';

// Temporary mock data - will be replaced with backend data later
const MOCK_MATCHES = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    lastMessage: 'Hey, how are you?',
    image: 'https://picsum.photos/200/200',
    timestamp: '2m ago',
  },
  {
    id: '2',
    name: 'Mike',
    age: 31,
    lastMessage: 'Want to grab coffee?',
    image: 'https://picsum.photos/200/200',
    timestamp: '1h ago',
  },
];

export default function MatchesScreen() {
  const renderMatch = ({ item }: { item: typeof MOCK_MATCHES[0] }) => (
    <View style={styles.matchCard}>
      <Image source={{ uri: item.image }} style={styles.profileImage} />
      <View style={styles.matchInfo}>
        <Text style={styles.name}>{item.name}, {item.age}</Text>
        <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      </View>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Matches</Text>
      <FlatList
        data={MOCK_MATCHES}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: 'white',
  },
  listContainer: {
    padding: 16,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
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
  },
  matchInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
}); 
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Text, 
  TextInput,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  age: number;
  gender: string;
  interests: string[];
  photos: string[];
}

export default function ProfileScreen() {
  const { user, token, signIn, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || '',
    bio: user?.profile?.bio || '',
    age: user?.profile?.age?.toString() || '',
    gender: user?.profile?.gender || '',
    interests: (user?.profile?.interests || []).join(', '),
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      const interestsArray = editedProfile.interests
        .split(',')
        .map((interest: string) => interest.trim())
        .filter((interest: string) => interest.length > 0);

      const response = await fetch('http://10.27.118.195:3000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editedProfile.name,
          profile: {
            bio: editedProfile.bio,
            age: parseInt(editedProfile.age),
            gender: editedProfile.gender,
            interests: interestsArray,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      
      // Update the user state with the new profile data
      if (user) {
        const updatedUser = {
          ...user,
          name: editedProfile.name,
          profile: {
            ...user.profile,
            bio: editedProfile.bio,
            age: parseInt(editedProfile.age),
            gender: editedProfile.gender,
            interests: interestsArray,
          }
        };
        await signIn(token!, updatedUser);
      }

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Please sign in to view your profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: user.profile?.photos?.[0] || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editedProfile.name}
            onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
            placeholder="Name"
          />
        ) : (
          <Text style={styles.name}>{user.name}</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <FontAwesome name={isEditing ? "times" : "edit"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={editedProfile.bio}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, bio: text })}
              placeholder="Bio"
              multiline
            />
            <TextInput
              style={styles.input}
              value={editedProfile.age}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, age: text })}
              placeholder="Age"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={editedProfile.gender}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, gender: text })}
              placeholder="Gender"
            />
            <TextInput
              style={styles.input}
              value={editedProfile.interests}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, interests: text })}
              placeholder="Interests (comma separated)"
            />
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {user.profile?.bio && (
              <Text style={styles.bio}>{user.profile.bio}</Text>
            )}
            {user.profile?.age && (
              <Text style={styles.detail}>{user.profile.age} years old</Text>
            )}
            {user.profile?.gender && (
              <Text style={styles.detail}>{user.profile.gender}</Text>
            )}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.interestsContainer}>
          {user.profile?.interests && user.profile.interests.length > 0 ? (
            user.profile.interests.map((interest: string, index: number) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No interests added yet</Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={20} color="#FF6B6B" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 10,
  },
  detail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: '#333',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
}); 
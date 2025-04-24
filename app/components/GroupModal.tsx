import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface GroupModalProps {
  visible: boolean;
  onClose: () => void;
  onGroupCreated?: () => void;
}

export default function GroupModal({ visible, onClose, onGroupCreated }: GroupModalProps) {
  const [isCreating, setIsCreating] = useState(true);
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    try {
      setLoading(true);
      console.log('Creating group with name:', name);
      console.log('Using token:', token);

      const response = await fetch('http://localhost:3000/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name,
          description: '', // Add default description
          isPrivate: false, // Default to public
          maxMembers: 2, // Fixed to 2 for duo groups
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Create group error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(errorData?.message || 'Failed to create group');
      }

      const data = await response.json();
      console.log('Group created successfully:', data);
      
      Alert.alert('Success', 'Group created successfully');
      setName('');
      onGroupCreated?.();
      onClose();
    } catch (error) {
      console.error('Create group error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/groups/join/${inviteCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to join group');
      }

      Alert.alert('Success', 'Joined group successfully');
      setInviteCode('');
      onGroupCreated?.();
      onClose();
    } catch (error) {
      console.error('Join group error:', error);
      Alert.alert('Error', 'Failed to join group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, isCreating && styles.activeToggle]}
              onPress={() => setIsCreating(true)}
            >
              <MaterialCommunityIcons
                name="plus-circle"
                size={24}
                color={isCreating ? 'white' : '#666'}
                style={styles.toggleIcon}
              />
              <Text style={[styles.toggleText, isCreating && styles.activeToggleText]}>
                Create Group
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isCreating && styles.activeToggle]}
              onPress={() => setIsCreating(false)}
            >
              <MaterialCommunityIcons
                name="account-plus"
                size={24}
                color={!isCreating ? 'white' : '#666'}
                style={styles.toggleIcon}
              />
              <Text style={[styles.toggleText, !isCreating && styles.activeToggleText]}>
                Join Group
              </Text>
            </TouchableOpacity>
          </View>

          {isCreating ? (
            <>
              <Text style={styles.label}>Group Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter group name"
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleCreateGroup}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Creating...' : 'Create Group'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Invite Code</Text>
              <TextInput
                style={styles.input}
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder="Enter invite code"
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleJoinGroup}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Joining...' : 'Join Group'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    color: '#666',
    fontWeight: '500',
  },
  activeToggleText: {
    color: 'white',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
  toggleIcon: {
    marginRight: 8,
  },
}); 
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, FlatList } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

interface Member {
  _id: string;
  name: string;
  photos: string[];
}

interface Group {
  _id: string;
  name: string;
  description: string;
  members: Member[];
  interests: string[];
  isPrivate: boolean;
  maxMembers: number;
  creator: string;
}

interface GroupSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  group: Group;
  onLeave: () => void;
  onUpdate: (updates: Partial<Group>) => void;
  isCreator: boolean;
}

export default function GroupSettingsModal({
  visible,
  onClose,
  group,
  onLeave,
  onUpdate,
  isCreator,
}: GroupSettingsModalProps) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description);
  const [isPrivate, setIsPrivate] = useState(group.isPrivate);
  const [maxMembers, setMaxMembers] = useState(group.maxMembers.toString());
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSave = async () => {
    try {
      setLoading(true);
      const updates = {
        name,
        description,
        isPrivate,
        maxMembers: parseInt(maxMembers, 10),
      };

      const response = await fetch(`http://localhost:3000/api/groups/${group._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update group');
      }

      onUpdate(updates);
      onClose();
    } catch (error) {
      console.error('Update group error:', error);
      Alert.alert('Error', 'Failed to update group settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await fetch(`http://localhost:3000/api/groups/${group._id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to delete group');
              }

              onClose();
            } catch (error) {
              console.error('Delete group error:', error);
              Alert.alert('Error', 'Failed to delete group');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderMember = ({ item }: { item: Member }) => (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        {item._id === group.creator && (
          <Text style={styles.creatorBadge}>Creator</Text>
        )}
      </View>
      {isCreator && item._id !== group.creator && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            Alert.alert(
              'Remove Member',
              `Are you sure you want to remove ${item.name} from the group?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const response = await fetch(
                        `http://localhost:3000/api/groups/${group._id}/members/${item._id}`,
                        {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                          },
                        }
                      );

                      if (!response.ok) {
                        throw new Error('Failed to remove member');
                      }

                      onUpdate({
                        members: group.members.filter(m => m._id !== item._id),
                      });
                    } catch (error) {
                      console.error('Remove member error:', error);
                      Alert.alert('Error', 'Failed to remove member');
                    }
                  },
                },
              ]
            );
          }}
        >
          <Ionicons name="remove-circle" size={24} color="#FF3B30" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Group Settings</Text>

          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Text style={styles.label}>Group Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter group name"
            editable={isCreator}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter group description"
            multiline
            editable={isCreator}
          />

          {isCreator && (
            <>
              <Text style={styles.label}>Maximum Members</Text>
              <TextInput
                style={styles.input}
                value={maxMembers}
                onChangeText={setMaxMembers}
                placeholder="Enter maximum members"
                keyboardType="numeric"
              />

              <View style={styles.privacyContainer}>
                <Text style={styles.label}>Privacy</Text>
                <TouchableOpacity
                  style={styles.privacyToggle}
                  onPress={() => setIsPrivate(!isPrivate)}
                >
                  <Text style={styles.privacyText}>
                    {isPrivate ? 'Private' : 'Public'}
                  </Text>
                  <Ionicons
                    name={isPrivate ? 'lock-closed' : 'globe'}
                    size={20}
                    color="#007AFF"
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Members ({group.members.length})</Text>
          <FlatList
            data={group.members}
            renderItem={renderMember}
            keyExtractor={(item) => item._id}
            style={styles.membersList}
          />

          <View style={styles.buttonContainer}>
            {isCreator ? (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleDeleteGroup}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Delete Group</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.leaveButton]}
                onPress={onLeave}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Leave Group</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
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
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
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
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  privacyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  privacyText: {
    marginRight: 8,
    color: '#333',
  },
  membersList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 16,
    color: '#333',
  },
  creatorBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#007AFF',
    color: 'white',
    borderRadius: 4,
    fontSize: 12,
  },
  removeButton: {
    padding: 4,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  leaveButton: {
    backgroundColor: '#FF9500',
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
}); 
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, FlatList, Clipboard } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const [description, setDescription] = useState(group.description || '');
  const [isPrivate, setIsPrivate] = useState(group.isPrivate || false);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleCopyInviteCode = () => {
    Clipboard.setString(group._id);
    Alert.alert('Success', 'Invite code copied to clipboard!');
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updates = {
        name,
        description,
        isPrivate,
        maxMembers: 2, // Always 2 for duo groups
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
        const errorData = await response.json().catch(() => null);
        console.error('Update group error response:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(errorData?.message || 'Failed to update group');
      }

      onUpdate(updates);
      onClose();
    } catch (error) {
      console.error('Update group error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update group settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    Alert.alert(
      'Delete Duo Profile',
      'Are you sure you want to delete this duo profile? This action cannot be undone.',
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
                throw new Error('Failed to delete duo profile');
              }

              onClose();
            } catch (error) {
              console.error('Delete group error:', error);
              Alert.alert('Error', 'Failed to delete duo profile');
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
        <MaterialCommunityIcons name="account" size={24} color="#666" style={styles.memberIcon} />
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
              'Remove Partner',
              `Are you sure you want to remove ${item.name} from the duo?`,
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
                        throw new Error('Failed to remove partner');
                      }

                      onUpdate({
                        members: group.members.filter(m => m._id !== item._id),
                      });
                    } catch (error) {
                      console.error('Remove member error:', error);
                      Alert.alert('Error', 'Failed to remove partner');
                    }
                  },
                },
              ]
            );
          }}
        >
          <MaterialCommunityIcons name="account-remove" size={24} color="#FF3B30" />
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
          <Text style={styles.title}>Duo Profile Settings</Text>

          <Text style={styles.sectionTitle}>Invite Code</Text>
          <View style={styles.inviteCodeContainer}>
            <Text style={styles.inviteCode}>{group._id}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyInviteCode}
            >
              <MaterialCommunityIcons name="content-copy" size={20} color="#007AFF" />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Profile Information</Text>
          <Text style={styles.label}>Duo Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter duo name"
            editable={isCreator}
          />

          <Text style={styles.label}>About Us</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Tell others about your duo"
            multiline
            editable={isCreator}
          />

          {isCreator && (
            <View style={styles.privacyContainer}>
              <Text style={styles.label}>Profile Visibility</Text>
              <TouchableOpacity
                style={styles.privacyToggle}
                onPress={() => setIsPrivate(!isPrivate)}
              >
                <Text style={styles.privacyText}>
                  {isPrivate ? 'Private' : 'Public'}
                </Text>
                <MaterialCommunityIcons
                  name={isPrivate ? 'lock' : 'earth'}
                  size={20}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.sectionTitle}>Duo Members</Text>
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
                  <Text style={styles.buttonText}>Delete Duo Profile</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.leaveButton]}
                onPress={onLeave}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Leave Duo</Text>
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
    gap: 10,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
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
  memberIcon: {
    marginRight: 8,
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  inviteCode: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#333',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  copyButtonText: {
    marginLeft: 4,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
}); 
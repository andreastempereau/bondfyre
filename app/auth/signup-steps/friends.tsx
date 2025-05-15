import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { router } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StepContainer } from "../../../src/components/forms/StepContainer";
import { InviteCodeCard, JoinGroupModal } from "../../../src/components/groups";
import { useSignup } from "../../../src/contexts/SignupContext";

// Friend data structure
interface Friend {
  _id: string;
  name: string;
  username?: string;
  phoneNumber?: string;
  photos: string[];
  selected?: boolean;
}

// Contact data structure
interface ContactItem {
  id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  selected?: boolean;
}

export default function FriendsStep() {
  const { signupData, updateSignupData } = useSignup();
  const [phoneNumber, setPhoneNumber] = useState(signupData.phoneNumber || "");
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showInviteCodeModal, setShowInviteCodeModal] = useState(false);
  const [showJoinGroupModal, setShowJoinGroupModal] = useState(false);
  const [inviteCode, setInviteCode] = useState(
    "BF" + Math.random().toString(36).substring(2, 10).toUpperCase()
  );
  const [isCopied, setIsCopied] = useState(false);

  // Max number of friends allowable
  const MAX_FRIENDS = 3;

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

      setLoading(true);
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
            id: contact.id as string, // Ensure id is treated as string
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
      setLoading(false);
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
    // For now, we'll just show an alert
    Alert.alert(
      "Invitations Sent",
      `Invitations sent to ${selectedContacts.length} contacts`
    );
    setShowContactsModal(false);
  };

  const handleContinue = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Missing Information", "Please enter your mobile number");
      return;
    }

    setLoading(true);
    try {
      // Update signup data with selected friends and phone number
      updateSignupData(
        "friends",
        selectedFriends.map((friend) => friend._id)
      );
      updateSignupData("phoneNumber", phoneNumber);

      // Navigate to the complete step
      router.push("/auth/signup-steps/complete");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to save information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Missing Information", "Please enter your mobile number");
      return;
    }

    // Save the phone number but skip adding friends
    updateSignupData("phoneNumber", phoneNumber);
    updateSignupData("friends", []);
    router.push("/auth/signup-steps/complete");
  };

  // Render contact item for contacts modal
  const renderContactItem = ({ item }: { item: ContactItem }) => (
    <TouchableOpacity
      style={[styles.contactItem, item.selected && styles.selectedContactItem]}
      onPress={() => toggleContactSelection(item.id)}
    >
      <View style={styles.contactAvatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>

      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        {item.phoneNumber && (
          <Text style={styles.contactDetail}>{item.phoneNumber}</Text>
        )}
      </View>

      <View style={styles.selectedIndicator}>
        {item.selected ? (
          <MaterialIcons name="check-circle" size={24} color="#FF4C67" />
        ) : (
          <MaterialIcons name="radio-button-unchecked" size={24} color="#CCC" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <StepContainer
        title="Add Friends"
        subtitle="Connect with friends and add your mobile number"
        onNext={handleContinue}
        nextDisabled={loading || !phoneNumber.trim()}
        nextButtonText={loading ? "Saving..." : "Continue"}
      >
        {/* Phone number input */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 100 }}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Your Mobile Number</Text>
          <Text style={styles.sectionSubtitle}>
            Add your phone number to help your friends find you
          </Text>

          <View style={styles.inputContainer}>
            <MaterialIcons
              name="phone"
              size={20}
              color="#666"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your mobile number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>
        </MotiView>

        {/* Connect with friends section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Connect With Friends</Text>
          <Text style={styles.sectionSubtitle}>
            Choose one of the options below to connect with friends
          </Text>

          {/* Option cards */}
          <View style={styles.optionsContainer}>
            {/* Import from contacts */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={getContacts}
              disabled={loading}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  { backgroundColor: "#E3F2FD" },
                ]}
              >
                <MaterialIcons name="contacts" size={24} color="#2196F3" />
              </View>
              <Text style={styles.optionTitle}>Import from Contacts</Text>
              <Text style={styles.optionDescription}>
                Find friends already using 2UO
              </Text>
            </TouchableOpacity>

            {/* Share invite code */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setShowInviteCodeModal(true)}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  { backgroundColor: "#FFF8E1" },
                ]}
              >
                <MaterialIcons name="share" size={24} color="#FFC107" />
              </View>
              <Text style={styles.optionTitle}>Share Invite Code</Text>
              <Text style={styles.optionDescription}>
                Invite friends to join 2UO
              </Text>
            </TouchableOpacity>

            {/* Enter invite code */}
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => setShowJoinGroupModal(true)}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  { backgroundColor: "#E8F5E9" },
                ]}
              >
                <MaterialIcons name="group-add" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.optionTitle}>Enter Invite Code</Text>
              <Text style={styles.optionDescription}>
                Join your friends using their code
              </Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Skip option */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip adding friends</Text>
        </TouchableOpacity>

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

              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF4C67" />
                  <Text style={styles.loadingText}>Loading contacts...</Text>
                </View>
              ) : (
                <>
                  <FlatList
                    data={contacts}
                    renderItem={renderContactItem}
                    keyExtractor={(item) => item.id}
                    style={styles.contactsList}
                    contentContainerStyle={styles.contactsListContent}
                  />

                  <TouchableOpacity
                    style={styles.primaryButton}
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
                  <MotiView
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                    style={styles.copiedMessage}
                  >
                    <MaterialIcons
                      name="check-circle"
                      size={16}
                      color="#4CAF50"
                    />
                    <Text style={styles.copiedText}>Copied to clipboard!</Text>
                  </MotiView>
                )}

                <TouchableOpacity
                  style={[styles.primaryButton, { marginTop: 16 }]}
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
      </StepContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F8F8F8",
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  optionsContainer: {
    marginTop: 8,
  },
  optionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 14,
    color: "#666",
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  skipText: {
    color: "#777",
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
    backgroundColor: "#FF4C67",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
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
});

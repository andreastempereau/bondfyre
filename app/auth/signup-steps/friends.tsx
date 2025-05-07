import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSignup } from "../../contexts/SignupContext";
import { StepContainer } from "../../components/forms/StepContainer";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { MotiView } from "moti";
import apiService from "../../services/apiService";

// Friend data structure
interface Friend {
  _id: string;
  name: string;
  username?: string;
  phoneNumber?: string;
  photos: string[];
  selected?: boolean;
}

export default function FriendsStep() {
  const { signupData, updateSignupData, completeSignup } = useSignup();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"username" | "phone">(
    "username"
  );
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Friend[]>([]);

  const isSearchButtonDisabled = searchQuery.trim().length < 2;

  // Max number of friends allowable
  const MAX_FRIENDS = 3;

  const handleSearch = async () => {
    if (isSearchButtonDisabled) return;

    setSearching(true);
    try {
      // This would be replaced with an actual API call in a real app
      const response = await apiService.get(
        `/friends/search?query=${encodeURIComponent(
          searchQuery
        )}&type=${searchType}`
      );

      // Map the results and mark already selected friends
      const results = response.data.map((user: Friend) => ({
        ...user,
        selected: selectedFriends.some((friend) => friend._id === user._id),
      }));

      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert(
        "Search Error",
        "Failed to search for friends. Please try again."
      );
    } finally {
      setSearching(false);
    }
  };

  const toggleFriendSelection = (friend: Friend) => {
    const isSelected = selectedFriends.some((f) => f._id === friend._id);

    if (isSelected) {
      // Remove from selected friends
      setSelectedFriends(selectedFriends.filter((f) => f._id !== friend._id));
    } else {
      // Check if we've reached the maximum number of friends
      if (selectedFriends.length >= MAX_FRIENDS) {
        Alert.alert(
          "Limit Reached",
          `You can only select up to ${MAX_FRIENDS} friends.`
        );
        return;
      }

      // Add to selected friends
      setSelectedFriends([...selectedFriends, friend]);
    }

    // Update the search results to reflect the new selection state
    setSearchResults(
      searchResults.map((result) =>
        result._id === friend._id
          ? { ...result, selected: !isSelected }
          : result
      )
    );
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      // For the last step, we'll call completeSignup which should handle the final submission
      await completeSignup({
        ...signupData,
        friends: selectedFriends.map((friend) => friend._id),
      });

      // Navigate to the complete step
      router.push("/auth/signup-steps/complete");
    } catch (error: any) {
      Alert.alert(
        "Signup Error",
        error.message || "Failed to complete signup. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // If the user wants to skip adding friends, still call completeSignup but with no friends
    completeSignup(signupData)
      .then(() => {
        router.push("/auth/signup-steps/complete");
      })
      .catch((error) => {
        Alert.alert(
          "Signup Error",
          error.message || "Failed to complete signup. Please try again."
        );
      });
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={[styles.friendItem, item.selected && styles.selectedFriendItem]}
      onPress={() => toggleFriendSelection(item)}
    >
      <View style={styles.friendAvatar}>
        {item.photos && item.photos.length > 0 ? (
          <Image source={{ uri: item.photos[0] }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        )}
      </View>

      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        {item.username && (
          <Text style={styles.friendDetail}>@{item.username}</Text>
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

  const renderSelectedFriendItem = ({ item }: { item: Friend }) => (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 300 }}
      style={styles.selectedFriendChip}
    >
      <View style={styles.chipContent}>
        {item.photos && item.photos.length > 0 ? (
          <Image source={{ uri: item.photos[0] }} style={styles.chipAvatar} />
        ) : (
          <View style={styles.chipAvatarFallback}>
            <Text style={styles.chipAvatarText}>{item.name.charAt(0)}</Text>
          </View>
        )}

        <Text style={styles.chipName}>{item.name}</Text>

        <TouchableOpacity
          style={styles.chipRemove}
          onPress={() => toggleFriendSelection(item)}
        >
          <Ionicons name="close-circle" size={20} color="#FF4C67" />
        </TouchableOpacity>
      </View>
    </MotiView>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <StepContainer
        title="Add Friends"
        description="Find your friends who are already on BondFyre. You can add up to 3 friends to improve your chances of group matches."
        currentStep={7}
        totalSteps={7}
        onBack={() => router.back()}
        onContinue={handleContinue}
        continueDisabled={loading}
        continueText={loading ? "Creating Account..." : "Complete Signup"}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBarContainer}>
            <View style={styles.searchInputContainer}>
              <FontAwesome
                name="search"
                size={18}
                color="#999"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search by username or phone"
                placeholderTextColor="#999"
                autoCapitalize="none"
                onSubmitEditing={handleSearch}
              />
              {searching && <ActivityIndicator size="small" color="#FF4C67" />}
            </View>

            <TouchableOpacity
              style={[
                styles.searchButton,
                isSearchButtonDisabled && styles.disabledButton,
              ]}
              onPress={handleSearch}
              disabled={isSearchButtonDisabled || searching}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchTypeContainer}>
            <TouchableOpacity
              style={[
                styles.searchTypeButton,
                searchType === "username" && styles.activeSearchTypeButton,
              ]}
              onPress={() => setSearchType("username")}
            >
              <Text
                style={[
                  styles.searchTypeText,
                  searchType === "username" && styles.activeSearchTypeText,
                ]}
              >
                Username
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.searchTypeButton,
                searchType === "phone" && styles.activeSearchTypeButton,
              ]}
              onPress={() => setSearchType("phone")}
            >
              <Text
                style={[
                  styles.searchTypeText,
                  searchType === "phone" && styles.activeSearchTypeText,
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected friends section */}
        {selectedFriends.length > 0 && (
          <View style={styles.selectedFriendsContainer}>
            <Text style={styles.sectionTitle}>
              Selected Friends ({selectedFriends.length}/{MAX_FRIENDS})
            </Text>
            <FlatList
              data={selectedFriends}
              renderItem={renderSelectedFriendItem}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedFriendsList}
            />
          </View>
        )}

        {/* Search results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            <FlatList
              data={searchResults}
              renderItem={renderFriendItem}
              keyExtractor={(item) => item._id}
              style={styles.resultsList}
              contentContainerStyle={styles.resultsListContent}
            />
          </View>
        )}

        {/* No results message */}
        {searchQuery.length > 0 && searchResults.length === 0 && !searching && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search-outline" size={50} color="#CCC" />
            <Text style={styles.noResultsText}>No users found.</Text>
            <Text style={styles.noResultsSubText}>
              Try a different search term or invite your friends to join
              BondFyre.
            </Text>
          </View>
        )}

        {/* Skip option */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip this step</Text>
        </TouchableOpacity>
      </StepContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: 20,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 48,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#333",
  },
  searchButton: {
    backgroundColor: "#FF4C67",
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#FFCDD2",
  },
  searchButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  searchTypeContainer: {
    flexDirection: "row",
    borderRadius: 20,
    backgroundColor: "#F3F3F3",
    overflow: "hidden",
  },
  searchTypeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  activeSearchTypeButton: {
    backgroundColor: "#FF4C67",
  },
  searchTypeText: {
    fontSize: 14,
    color: "#777",
  },
  activeSearchTypeText: {
    color: "white",
    fontWeight: "600",
  },
  selectedFriendsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#555",
  },
  selectedFriendsList: {
    paddingVertical: 5,
  },
  selectedFriendChip: {
    backgroundColor: "#FFF0F0",
    borderRadius: 25,
    marginRight: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: "#FFD6DE",
  },
  chipContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  chipAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 5,
  },
  chipAvatarFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF4C67",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  chipAvatarText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  chipName: {
    fontSize: 14,
    marginRight: 5,
    color: "#333",
  },
  chipRemove: {
    padding: 2,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsList: {
    flex: 1,
  },
  resultsListContent: {
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedFriendItem: {
    backgroundColor: "#FFF0F0",
    borderColor: "#FFD6DE",
    borderWidth: 1,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFEFEF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  friendDetail: {
    fontSize: 14,
    color: "#777",
  },
  selectedIndicator: {
    width: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginTop: 10,
  },
  noResultsSubText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginTop: 5,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  skipText: {
    color: "#777",
    fontSize: 14,
  },
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface InterestTagsProps {
  interests: string[];
}

const InterestTags: React.FC<InterestTagsProps> = ({ interests }) => {
  return (
    <View style={styles.interestsContainer}>
      {interests.map((interest, index) => (
        <View key={index} style={styles.interestTag}>
          <Text style={styles.interestText}>{interest}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  interestText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "500",
  },
});

// Adding default export to prevent Expo Router from treating this as a route
export default InterestTags;

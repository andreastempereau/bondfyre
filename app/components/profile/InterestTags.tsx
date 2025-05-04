import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface InterestTagsProps {
  interests: string[];
  highlightInterests?: string[]; // New prop to highlight matching interests
}

const InterestTags: React.FC<InterestTagsProps> = ({
  interests,
  highlightInterests = [],
}) => {
  return (
    <View style={styles.interestsContainer}>
      {interests.map((interest, index) => {
        const isMatching = highlightInterests.includes(interest);
        return (
          <View
            key={index}
            style={[
              styles.interestTag,
              isMatching && styles.matchingInterestTag,
            ]}
          >
            <Text
              style={[
                styles.interestText,
                isMatching && styles.matchingInterestText,
              ]}
            >
              {interest}
            </Text>
          </View>
        );
      })}
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
  matchingInterestTag: {
    backgroundColor: "#FFE5E5",
    borderColor: "#FFCDD2",
    borderWidth: 1,
  },
  interestText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "500",
  },
  matchingInterestText: {
    color: "#FF4C67",
    fontWeight: "600",
  },
});

// Adding default export to prevent Expo Router from treating this as a route
export default InterestTags;

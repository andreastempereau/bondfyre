import React from "react";
import { View, Text, StyleSheet } from "react-native";

export interface InterestTagsProps {
  interests?: string[];
}

export const InterestTags = ({ interests }: InterestTagsProps) => (
  <View style={styles.interestsContainer}>
    {interests && interests.length > 0 ? (
      interests.map((interest: string, index: number) => (
        <View key={index} style={styles.interestTag}>
          <Text style={styles.interestText}>{interest}</Text>
        </View>
      ))
    ) : (
      <Text style={styles.emptyText}>No interests added yet</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: "#333",
    fontSize: 14,
  },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
  },
});

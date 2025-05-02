import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SwipeDirection } from "./types";

interface ActionButtonsProps {
  onSwipe: (direction: SwipeDirection) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onSwipe }) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        onPress={() => onSwipe("left")}
        style={[styles.button, styles.nopeButton]}
        activeOpacity={0.8}
      >
        <View style={styles.buttonInner}>
          <FontAwesome name="times" size={30} color="white" />
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onSwipe("right")}
        style={[styles.button, styles.likeButton]}
        activeOpacity={0.8}
      >
        <View style={styles.buttonInner}>
          <FontAwesome name="heart" size={26} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonInner: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  nopeButton: {
    backgroundColor: "#FF4C67",
  },
  likeButton: {
    backgroundColor: "#4ECFAE",
  },
});

export default ActionButtons;

import React, { useState, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Platform } from "react-native";
import { State } from "react-native-gesture-handler";
import {
  GroupProfile,
  SwipeDirection,
  SwipeCard,
  ActionButtons,
  EmptyState,
} from "../components/discover";
import { StatusBar } from "expo-status-bar";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

// Mock data
const MOCK_GROUP_PROFILES: GroupProfile[] = [
  {
    id: "1",
    name: "Weekend Warriors",
    members: [
      {
        id: "1",
        name: "John Doe",
        age: 29,
        gender: "male",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZmFjZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=200&q=60",
      },
      {
        id: "2",
        name: "Mike Smith",
        age: 31,
        gender: "male",
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjF8fGZhY2V8ZW58MHx8MHx8&auto=format&fit=crop&w=200&q=60",
      },
    ],
    bio: "Looking for fun double dates!",
    interests: ["Hiking", "Travel", "Food"],
    photos: [
      "https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aGlraW5nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8aGlraW5nJTIwZ3JvdXB8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
    ],
  },
  {
    id: "2",
    name: "Adventure Seekers",
    members: [
      {
        id: "3",
        name: "Sarah Wilson",
        age: 28,
        gender: "female",
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFjZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=200&q=60",
      },
      {
        id: "4",
        name: "Emma Davis",
        age: 27,
        gender: "female",
        image:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8ZmFjZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=200&q=60",
      },
    ],
    bio: "Love exploring new places together!",
    interests: ["Adventure", "Photography", "Coffee"],
    photos: [
      "https://images.unsplash.com/photo-1504209342968-21977e932bf0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8YWR2ZW50dXJlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1530866495561-57f273b91216?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8YWR2ZW50dXJlJTIwZ3JvdXB8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
    ],
  },
  {
    id: "3",
    name: "City Explorers",
    members: [
      {
        id: "5",
        name: "Alex Johnson",
        age: 30,
        gender: "male",
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8ZmFjZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=200&q=60",
      },
      {
        id: "6",
        name: "Jessica Brown",
        age: 29,
        gender: "female",
        image:
          "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8ZmFjZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=200&q=60",
      },
    ],
    bio: "We love discovering hidden gems in the city!",
    interests: ["Urban Exploration", "Food", "Art"],
    photos: [
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8dXJiYW4lMjBleHBsb3JlcnN8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1521336993297-77c5a81ce4d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8Y2l0eSUyMGdyb3VwfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
    ],
  },
];

export default function DiscoverScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState(MOCK_GROUP_PROFILES);
  const position = useRef(new Animated.ValueXY()).current;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: position.x, translationY: position.y } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      if (Math.abs(translationX) > SWIPE_THRESHOLD) {
        const direction = translationX > 0 ? "right" : "left";
        handleSwipe(direction);
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const handleSwipe = (direction: SwipeDirection) => {
    const x = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex((prev) => prev + 1);
      setCurrentPhotoIndex(0);
    });
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-30deg", "0deg", "30deg"],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  const handlePhotoPress = () => {
    const currentProfile = profiles[currentIndex];
    setCurrentPhotoIndex((prev) =>
      prev === currentProfile.photos.length - 1 ? 0 : prev + 1
    );
  };

  if (currentIndex >= profiles.length) {
    return (
      <View style={styles.container}>
        <EmptyState />
      </View>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.cardContainer}>
        <SwipeCard
          profile={currentProfile}
          currentPhotoIndex={currentPhotoIndex}
          onPhotoPress={handlePhotoPress}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          cardStyle={getCardStyle()}
        />
      </View>
      <View style={styles.actionButtonContainer}>
        <ActionButtons onSwipe={handleSwipe} />
      </View>
      {/* Add a spacer to prevent overlap with tab bar */}
      <View style={styles.bottomSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 5, // Reduced top padding
    paddingHorizontal: 20,
    justifyContent: "space-between", // Distribute space evenly
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonContainer: {
    alignItems: "center",
    paddingBottom: 5,
  },
  bottomSpacer: {
    height: Platform.OS === "ios" ? 60 : 50, // Add space at bottom to prevent tab bar overlap
  },
});

import React from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { GroupProfile } from "./types";
import PhotoCarousel from "./PhotoCarousel";
import MatchProfileInfo from "./MatchProfileInfo";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

interface SwipeCardProps {
  profile: GroupProfile;
  currentPhotoIndex: number;
  onPhotoPress: () => void;
  onGestureEvent: any;
  onHandlerStateChange: any;
  cardStyle: any;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  currentPhotoIndex,
  onPhotoPress,
  onGestureEvent,
  onHandlerStateChange,
  cardStyle,
}) => {
  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={[-10, 10]}
    >
      <Animated.View style={[styles.card, cardStyle]}>
        <View style={styles.photoContainer}>
          <PhotoCarousel
            photos={profile.photos}
            currentPhotoIndex={currentPhotoIndex}
            onPhotoPress={onPhotoPress}
          />
        </View>
        <View style={styles.infoContainer}>
          <MatchProfileInfo profile={profile} />
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.7, // Increased card height from 0.55 to 0.65
    marginBottom: 5,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  photoContainer: {
    flex: 0.6, // Reduced from 0.65 to 0.6 to give more space to info
  },
  infoContainer: {
    flex: 0.4, // Increased from 0.35 to 0.4 to show more content including interests
  },
});

export default SwipeCard;

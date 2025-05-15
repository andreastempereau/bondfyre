import React from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
  ViewStyle,
} from "react-native";

interface ParallaxScrollViewProps {
  headerComponent?: React.ReactNode;
  headerImage?: React.ReactNode;
  headerBackgroundColor?: {
    light: string;
    dark: string;
  };
  headerHeight?: number;
  scrollEventThrottle?: number;
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const ParallaxScrollView: React.FC<ParallaxScrollViewProps> = ({
  headerComponent,
  headerImage,
  headerBackgroundColor,
  headerHeight = 250, // Default value to avoid undefined errors
  scrollEventThrottle = 16,
  children,
  style,
  contentContainerStyle,
}) => {
  const colorScheme = useColorScheme() || "light";
  const scrollY = new Animated.Value(0);

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight / 2],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight / 2, headerHeight],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const backgroundColorStyle = headerBackgroundColor
    ? {
        backgroundColor: headerBackgroundColor[colorScheme as "light" | "dark"],
      }
    : {};

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.headerContainer,
          backgroundColorStyle,
          {
            height: headerHeight,
            transform: [{ translateY: headerTranslate }],
            opacity: headerOpacity,
          },
        ]}
      >
        {headerImage || headerComponent}
      </Animated.View>

      <ScrollView
        scrollEventThrottle={scrollEventThrottle}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: headerHeight },
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});

// Adding default export to prevent Expo Router from treating this as a route
export default ParallaxScrollView;

import React, { useEffect } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { theme } from "../../theme";

interface HelloWaveProps {
  size?: number;
  color?: string;
  duration?: number;
}

const HelloWave: React.FC<HelloWaveProps> = ({
  size = 50,
  color = theme.palette.primary,
  duration = 2000,
}) => {
  // Animation values
  const waveAnim1 = new Animated.Value(0);
  const waveAnim2 = new Animated.Value(0);
  const waveAnim3 = new Animated.Value(0);

  // Create the wave animation
  useEffect(() => {
    const createWaveAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.timing(animValue, {
          toValue: 1,
          duration: duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]);
    };

    // Start animations in loop
    Animated.loop(
      Animated.parallel([
        createWaveAnimation(waveAnim1, 0),
        createWaveAnimation(waveAnim2, duration / 3),
        createWaveAnimation(waveAnim3, (2 * duration) / 3),
      ])
    ).start();

    return () => {
      // Clean up animations
      waveAnim1.stopAnimation();
      waveAnim2.stopAnimation();
      waveAnim3.stopAnimation();
    };
  }, []);

  // Interpolate values for scaling and opacity
  const getAnimatedStyle = (animValue: Animated.Value) => {
    const scale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2.5],
    });

    const opacity = animValue.interpolate({
      inputRange: [0, 0.6, 1],
      outputRange: [1, 0.3, 0],
    });

    return {
      transform: [{ scale }],
      opacity,
    };
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.dot,
          { backgroundColor: color, width: size / 3, height: size / 3 },
        ]}
      />

      <Animated.View
        style={[
          styles.wave,
          { borderColor: color, width: size, height: size },
          getAnimatedStyle(waveAnim1),
        ]}
      />

      <Animated.View
        style={[
          styles.wave,
          { borderColor: color, width: size, height: size },
          getAnimatedStyle(waveAnim2),
        ]}
      />

      <Animated.View
        style={[
          styles.wave,
          { borderColor: color, width: size, height: size },
          getAnimatedStyle(waveAnim3),
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    borderRadius: 999,
    position: "absolute",
    zIndex: 1,
  },
  wave: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: 999,
  },
});

export default HelloWave;

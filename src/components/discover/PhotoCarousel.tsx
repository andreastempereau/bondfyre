import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import { MotiView } from "moti";

// Define props type
type PhotoCarouselProps = {
  photos: string[];
  currentPhotoIndex: number;
  onPhotoPress: () => void;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 40;

// Fixed sample images that definitely work - use these as fallbacks
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjF8fGdyb3VwJTIwb2YlMjBwZW9wbGV8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8Z3JvdXAlMjBvZiUyMGZyaWVuZHN8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JvdXAlMjBvZiUyMGZyaWVuZHN8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
];

// Use the simplest function form possible
function PhotoCarousel(props: PhotoCarouselProps) {
  const photos = props.photos;
  const currentPhotoIndex = props.currentPhotoIndex;
  const onPhotoPress = props.onPhotoPress;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageAttempts, setImageAttempts] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Cache of failed image URLs to avoid repeated failed attempts
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset states when photo changes
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if this image has previously failed
    const currentImageUrl = photos[currentPhotoIndex];
    if (failedImages.has(currentImageUrl)) {
      setLoading(false);
      setError(true);
      return;
    }

    // Start fresh loading state
    setLoading(true);
    setError(false);
    setNetworkError(false);
    setImageAttempts(0);

    // Set new timeout - shorter timeout for better UX
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setError(true);

      // Add to failed images
      setFailedImages((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentImageUrl);
        return newSet;
      });
    }, 4000); // Reduced timeout for better UX
  }, [currentPhotoIndex, photos]);

  // Determine image source based on error state
  const imageSrc = !error
    ? { uri: photos[currentPhotoIndex] }
    : { uri: FALLBACK_IMAGES[currentPhotoIndex % FALLBACK_IMAGES.length] };

  // Handle image load error with retry logic
  const handleImageError = () => {
    // Only retry up to 1 time
    if (imageAttempts < 1) {
      setImageAttempts((prev) => prev + 1);

      // Clear the timeout and create a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Try again after a short delay
      timeoutRef.current = setTimeout(() => {
        setLoading(true);
        setError(false);
      }, 800);
    } else {
      // After several attempts, mark as failed and use fallback
      setLoading(false);
      setError(true);

      // Add to failed images
      setFailedImages((prev) => {
        const newSet = new Set(prev);
        newSet.add(photos[currentPhotoIndex]);
        return newSet;
      });
    }
  };

  const handleNetworkError = () => {
    setNetworkError(true);
    setTimeout(() => {
      setNetworkError(false);
    }, 3000);
  };

  return (
    <View style={styles.imageContainer}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPhotoPress}
        style={styles.touchable}
      >
        <Image
          source={imageSrc}
          style={styles.image}
          onLoadStart={() => {
            // Only set loading if not already in error state
            if (!error) {
              setLoading(true);
            }
          }}
          onLoad={() => {
            setLoading(false);
            setError(false);

            // Clear timeout to prevent false errors
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
          }}
          onError={handleImageError}
        />

        {loading ? (
          <MotiView
            style={styles.loadingContainer}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 300 }}
          >
            <ActivityIndicator size="large" color="#ffffff" />
          </MotiView>
        ) : null}

        {error ? (
          <MotiView
            style={styles.errorContainer}
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <FontAwesome name="image" size={32} color="#ffffff" />
            <Text style={styles.errorText}>Using backup image</Text>
          </MotiView>
        ) : null}

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.5)"]}
          style={styles.gradient}
        />
      </TouchableOpacity>

      <View style={styles.photoIndicator}>
        {photos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.photoDot,
              index === currentPhotoIndex ? styles.photoDotActive : null,
            ]}
          />
        ))}
      </View>

      {networkError ? (
        <MotiView
          style={styles.networkErrorContainer}
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -20 }}
          transition={{ type: "timing", duration: 300 }}
        >
          <FontAwesome name="exclamation-triangle" size={16} color="white" />
          <Text style={styles.networkErrorText}>Network connection issue</Text>
        </MotiView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  touchable: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  errorText: {
    color: "white",
    fontWeight: "bold",
    marginTop: 10,
  },
  networkErrorContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(220, 53, 69, 0.85)",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  networkErrorText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "600",
  },
  photoIndicator: {
    position: "absolute",
    top: 10,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    zIndex: 10,
  },
  photoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 3,
  },
  photoDotActive: {
    width: 8,
    height: 8,
    backgroundColor: "white",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "30%",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
});

export default PhotoCarousel;

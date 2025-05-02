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

interface PhotoCarouselProps {
  photos: string[];
  currentPhotoIndex: number;
  onPhotoPress: () => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 40;

// Fixed sample images that definitely work - use these as fallbacks
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjF8fGdyb3VwJTIwb2YlMjBwZW9wbGV8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Z3JvdXAlMjBvZiUyMGZyaWVuZHN8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
];

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({
  photos,
  currentPhotoIndex,
  onPhotoPress,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageAttempts, setImageAttempts] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    setImageAttempts(0);

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log("Image loading timed out");
      setLoading(false);
      setError(true);

      // Add to failed images
      setFailedImages((prev) => {
        const newSet = new Set(prev);
        newSet.add(currentImageUrl);
        return newSet;
      });
    }, 5000); // Reduced timeout for better UX
  }, [currentPhotoIndex, photos]);

  // Determine image source based on error state
  const imageSrc = !error
    ? { uri: photos[currentPhotoIndex] }
    : { uri: FALLBACK_IMAGES[currentPhotoIndex % FALLBACK_IMAGES.length] };

  // Handle image load error with retry logic
  const handleImageError = () => {
    console.log("Image load error");

    // Only retry up to 2 times
    if (imageAttempts < 2) {
      setImageAttempts((prev) => prev + 1);

      // Clear the timeout and create a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Try again after a short delay
      timeoutRef.current = setTimeout(() => {
        console.log(`Retrying image load, attempt ${imageAttempts + 1}`);
        setLoading(true);
        setError(false);
      }, 1000);
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
            console.log("Image load started");
            // Only set loading if not already in error state
            if (!error) {
              setLoading(true);
            }
          }}
          onLoad={() => {
            console.log("Image loaded successfully");
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

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <FontAwesome name="image" size={32} color="#ffffff" />
            <Text style={styles.errorText}>Using backup image</Text>
          </View>
        )}

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
              index === currentPhotoIndex && styles.photoDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

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
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  errorText: {
    color: "white",
    fontWeight: "bold",
    marginTop: 10,
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
  },
});

export default PhotoCarousel;

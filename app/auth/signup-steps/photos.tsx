import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSignup } from "../../contexts/SignupContext";
import { StepContainer } from "../../components/forms/StepContainer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export default function PhotosStep() {
  const { data, updateData, setCurrentStep, getNextStep } = useSignup();
  const [photos, setPhotos] = useState<string[]>(data.photos || []);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setCurrentStep(8); // Update to match step ID in SIGNUP_STEPS

    // Request permissions on component mount
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Sorry, we need camera roll permissions to upload photos!",
            [{ text: "OK" }]
          );
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      setLoading(true);

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedAsset = result.assets[0];

        // Check file size (limit to 5MB)
        const fileInfo = await FileSystem.getInfoAsync(selectedAsset.uri);
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB

        if (fileInfo.exists && fileInfo.size && fileInfo.size > MAX_SIZE) {
          Alert.alert(
            "Image Too Large",
            "Please select an image smaller than 5MB",
            [{ text: "OK" }]
          );
          setLoading(false);
          return;
        }

        // Add new photo
        const newPhotos = [...photos, selectedAsset.uri];
        setPhotos(newPhotos);
        updateData("photos", newPhotos);

        // Scroll to end to show new photo
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    updateData("photos", newPhotos);
  };

  // Calculate the "Add Photo" button opacity based on number of photos
  const addButtonOpacity = Math.min(
    1,
    0.6 + (4 - Math.min(photos.length, 4)) * 0.1
  );

  const handleNext = async () => {
    updateData("photos", photos);
    // Navigate to the next step using the getNextStep function
    router.push(getNextStep(8));
  };

  const PhotoItem = ({ uri, index }: { uri: string; index: number }) => {
    // Setup animation values for drag gesture
    const offset = useSharedValue({ x: 0, y: 0 });
    const scale = useSharedValue(1);
    const rotation = useSharedValue(0);
    const saved = useSharedValue({ x: 0, y: 0 });
    const isRemovalActive = useSharedValue(false);

    // Pan gesture for the remove animation
    const panGesture = Gesture.Pan()
      .onBegin(() => {
        scale.value = withSpring(1.05);
      })
      .onChange((event) => {
        offset.value = {
          x: event.translationX + saved.value.x,
          y: event.translationY + saved.value.y,
        };

        // Calculate the distance from origin to determine removal threshold
        const distance = Math.sqrt(
          Math.pow(offset.value.x, 2) + Math.pow(offset.value.y, 2)
        );

        // Update rotation based on horizontal movement
        rotation.value = offset.value.x * 0.05;

        // If dragged far enough, activate removal state
        if (distance > 100) {
          isRemovalActive.value = true;
        } else {
          isRemovalActive.value = false;
        }
      })
      .onEnd(() => {
        if (isRemovalActive.value) {
          // Remove the photo
          removePhoto(index);
        } else {
          // Spring back to original position
          offset.value = withSpring({ x: 0, y: 0 });
          scale.value = withSpring(1);
          rotation.value = withSpring(0);
        }

        saved.value = { x: 0, y: 0 };
      })
      .onFinalize(() => {
        scale.value = withSpring(1);
        isRemovalActive.value = false;
      });

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: offset.value.x },
          { translateY: offset.value.y },
          { scale: scale.value },
          { rotateZ: `${rotation.value}deg` },
        ],
        opacity: isRemovalActive.value ? 0.5 : 1,
      };
    });

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.photoContainer, animatedStyle]}>
          <Image source={{ uri }} style={styles.photo} />
          <View style={styles.removeIconContainer}>
            <MaterialCommunityIcons name="drag" size={20} color="#FFF" />
          </View>
          <MotiView
            style={styles.dragHintContainer}
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "timing",
              duration: 500,
              delay: 1000,
              loop: true,
            }}
          >
            <Text style={styles.dragHintText}>Drag to remove</Text>
          </MotiView>
        </Animated.View>
      </GestureDetector>
    );
  };

  return (
    <View style={styles.container}>
      <StepContainer
        title="Add your photos"
        subtitle="Show yourself to the community"
        onNext={handleNext}
        nextLabel={photos.length > 0 ? "Continue" : "Skip for now"}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 500, delay: 100 }}
          style={styles.content}
        >
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosContainer}
          >
            {photos.map((photo, index) => (
              <PhotoItem key={`${photo}-${index}`} uri={photo} index={index} />
            ))}

            {photos.length < 5 && (
              <MotiView
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: addButtonOpacity, scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
              >
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={pickImage}
                  disabled={loading}
                >
                  {loading ? (
                    <MaterialCommunityIcons
                      name="loading"
                      size={30}
                      color="#FF6B6B"
                    />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="camera-plus"
                        size={30}
                        color="#FF6B6B"
                      />
                      <Text style={styles.addPhotoText}>
                        {photos.length === 0 ? "Add Photo" : "Add More"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </MotiView>
            )}
          </ScrollView>

          <View style={styles.infoContainer}>
            <MaterialCommunityIcons name="information" size={18} color="#666" />
            <Text style={styles.infoText}>
              Add up to 5 photos. You can drag photos to remove them.
            </Text>
          </View>
        </MotiView>
      </StepContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  photosContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 220,
  },
  photoContainer: {
    width: 160,
    height: 200,
    borderRadius: 12,
    marginHorizontal: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeIconContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 15,
    padding: 5,
  },
  dragHintContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 4,
  },
  dragHintText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  addPhotoButton: {
    width: 160,
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  addPhotoText: {
    color: "#666",
    marginTop: 10,
    fontWeight: "500",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  infoText: {
    color: "#666",
    fontSize: 14,
    marginLeft: 5,
  },
});

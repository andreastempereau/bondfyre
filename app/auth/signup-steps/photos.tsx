import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  FlatList,
} from "react-native";
import { useSignup } from "../../../src/contexts/SignupContext";
import { StepContainer } from "../../../src/components/forms/StepContainer";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "../../../src/services/storageService";
import { MotiView } from "moti";

export default function PhotosStep() {
  const {
    signupData,
    updateSignupData,
    setCurrentStep,
    getNextStep,
    getStepByName,
  } = useSignup();
  const [photos, setPhotos] = useState<string[]>(signupData.photos || []);
  const [uploading, setUploading] = useState(false);
  const MAX_PHOTOS = 6;

  useEffect(() => {
    // Set current step using the step ID from context
    const photosStep = getStepByName("photos");
    setCurrentStep(photosStep.id);
  }, [setCurrentStep, getStepByName]);

  // Photos are now optional - users can continue without adding any photos
  const canContinue = true;
  const canAddMore = photos.length < MAX_PHOTOS;

  const pickImage = async () => {
    if (!canAddMore) {
      Alert.alert(
        "Maximum Photos",
        `You can only upload up to ${MAX_PHOTOS} photos.`
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploading(true);
        try {
          const { url, error } = await uploadImage(
            result.assets[0].uri,
            `photos/${Date.now()}.jpg`
          );

          if (error) {
            console.error("Upload error:", error);
            Alert.alert("Error", "Failed to upload image. Please try again.");
          } else if (url) {
            const newPhotos = [...photos, url];
            setPhotos(newPhotos);
            updateSignupData("photos", newPhotos);
          }
        } catch (error) {
          console.error("Upload error:", error);
          Alert.alert("Error", "Failed to upload image. Please try again.");
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
    updateSignupData("photos", newPhotos);
  };

  const handleNext = () => {
    try {
      // Make sure the correct step is set
      const photosStep = getStepByName("photos");
      setCurrentStep(photosStep.id);

      // Get the next path
      const nextPath = getNextStep();

      if (nextPath) {
        // Always allow continuing to the next step
        router.push(nextPath);
      } else {
        // Fallback to explicit path if getNextStep fails
        router.push("/auth/signup-steps/username");
      }
    } catch (error) {
      console.error("Error in photos handleNext:", error);
      // Fallback navigation
      router.push("/auth/signup-steps/username");
    }
  };

  const renderPhoto = ({ item, index }: { item: string; index: number }) => (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 300 }}
      style={styles.photoContainer}
    >
      <Image source={{ uri: item }} style={styles.photo} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removePhoto(index)}
      >
        <Ionicons name="close-circle" size={26} color="#FF4C67" />
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <StepContainer
      onNext={handleNext}
      nextDisabled={uploading}
      nextButtonText={photos.length > 0 ? "Continue" : "Skip for now"}
    >
      <View style={styles.container}>
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          columnWrapperStyle={styles.photoRow}
          ListFooterComponent={
            canAddMore ? (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={pickImage}
                disabled={uploading}
              >
                {uploading ? (
                  <MaterialCommunityIcons
                    name="loading"
                    size={32}
                    color="#FF4C67"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={32}
                    color="#FF4C67"
                  />
                )}
                <Text style={styles.addPhotoText}>
                  {uploading ? "Uploading..." : "Add Photo"}
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />

        <View style={styles.photoCounter}>
          <Text style={styles.photoCounterText}>
            {photos.length} / {MAX_PHOTOS} photos
          </Text>
        </View>

        <Text style={styles.infoText}>
          {photos.length > 0
            ? "Your first photo will be your main profile picture."
            : "Adding photos is optional. You can always add them later from your profile page."}
        </Text>
      </View>
    </StepContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  photoRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  photoContainer: {
    width: "48%",
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeButton: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  addPhotoButton: {
    width: "48%",
    aspectRatio: 3 / 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CCCCCC",
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666666",
  },
  photoCounter: {
    marginTop: 8,
    marginBottom: 16,
  },
  photoCounterText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginVertical: 16,
  },
});

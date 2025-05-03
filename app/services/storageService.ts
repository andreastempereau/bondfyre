import { supabase } from "../../lib/supabase";
import { decode } from "base64-arraybuffer";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";

const BUCKET_NAME = "profile-photos";

export interface UploadImageResult {
  url: string;
  error: Error | null;
}

/**
 * Generate a unique ID without using crypto
 */
const generateUniqueId = () => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 10);
};

/**
 * Uploads an image to Supabase Storage
 * @param uri Local image URI
 * @param userId User ID for organizing uploads
 */
export const uploadImage = async (
  uri: string,
  userId: string
): Promise<UploadImageResult> => {
  try {
    // Generate a unique file path using our custom function instead of uuid
    const fileExt = uri.substring(uri.lastIndexOf(".") + 1);
    const uniqueId = generateUniqueId();
    const filePath = `${userId}/${uniqueId}.${fileExt}`;

    // Handle different platforms
    let base64Image;
    if (Platform.OS === "web") {
      // For web, fetch the image and convert to base64
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      base64Image = arrayBuffer;
    } else {
      // For mobile, read the file as base64
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        return { url: "", error: new Error("File does not exist") };
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      base64Image = decode(base64);
    }

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, base64Image, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error.message);
      return { url: "", error };
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error("Error uploading image:", error);
    return {
      url: "",
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

/**
 * Delete an image from Supabase Storage
 * @param url Full public URL of the image
 */
export const deleteImage = async (
  url: string
): Promise<{ error: Error | null }> => {
  try {
    // Extract file path from URL
    const urlParts = url.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) {
      return { error: new Error("Invalid URL format") };
    }

    const filePath = urlParts[1];

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    return { error };
  } catch (error) {
    console.error("Error deleting image:", error);
    return {
      error: error instanceof Error ? error : new Error("Unknown error"),
    };
  }
};

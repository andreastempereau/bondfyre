import React from "react";
import { View, StyleSheet } from "react-native";
import { useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput, FormButton } from "../forms";
import {
  profileEditSchema,
  ProfileEditFormData,
} from "../forms/validationSchemas";

export type ProfileEditValues = ProfileEditFormData;

export interface ProfileEditFormProps {
  defaultValues: ProfileEditValues;
  onSave: (data: ProfileEditValues) => Promise<void>;
  loading: boolean;
}

export const ProfileEditForm = ({
  defaultValues,
  onSave,
  loading,
}: ProfileEditFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileEditValues>({
    resolver: yupResolver(
      profileEditSchema
    ) as unknown as Resolver<ProfileEditValues>,
    defaultValues,
    mode: "onBlur",
  });

  return (
    <View style={styles.container}>
      <FormInput<ProfileEditValues>
        control={control}
        name="name"
        label="Full Name"
        placeholder="Your name"
        icon="account"
        error={errors.name}
        containerStyle={styles.inputContainer}
      />

      <FormInput<ProfileEditValues>
        control={control}
        name="bio"
        label="Bio"
        placeholder="Tell us about yourself"
        icon="text"
        multiline
        numberOfLines={4}
        error={errors.bio}
        containerStyle={styles.inputContainer}
      />

      <FormInput<ProfileEditValues>
        control={control}
        name="age"
        label="Age"
        placeholder="Your age"
        icon="calendar"
        keyboardType="numeric"
        error={errors.age}
        containerStyle={styles.inputContainer}
      />

      <FormInput<ProfileEditValues>
        control={control}
        name="gender"
        label="Gender"
        placeholder="male/female/other"
        icon="gender-male-female"
        error={errors.gender}
        containerStyle={styles.inputContainer}
      />

      <FormInput<ProfileEditValues>
        control={control}
        name="interests"
        label="Interests"
        placeholder="Interests (comma separated)"
        icon="tag-multiple"
        error={errors.interests}
        containerStyle={styles.inputContainer}
      />

      <FormInput<ProfileEditValues>
        control={control}
        name="phoneNumber"
        label="Phone Number"
        placeholder="Your phone number"
        icon="phone"
        error={errors.phoneNumber}
        containerStyle={styles.inputContainer}
      />

      <FormButton
        title="Save Changes"
        onPress={handleSubmit(onSave)}
        loading={loading}
        style={styles.saveButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 20,
  },
});

// Adding default export to prevent Expo Router from treating this as a route
export default ProfileEditForm;

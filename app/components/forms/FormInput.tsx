import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Text,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Controller,
  Control,
  FieldValues,
  FieldError,
  Path,
  FieldPath,
} from "react-hook-form";

export interface FormInputProps<TFieldValues extends FieldValues = FieldValues>
  extends Omit<TextInputProps, "onChange" | "onBlur" | "value"> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  error?: FieldError;
  containerStyle?: object;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
  rules?: object;
}

export function FormInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  icon,
  error,
  containerStyle,
  showPasswordToggle,
  isPasswordVisible,
  onTogglePassword,
  rules,
  ...props
}: FormInputProps<TFieldValues>) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error: fieldError },
        }) => (
          <>
            <View
              style={[
                styles.inputContainer,
                fieldError || error ? styles.inputError : null,
                props.multiline ? styles.multilineInput : null,
              ]}
            >
              {icon && (
                <MaterialCommunityIcons
                  name={icon}
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
              )}

              <TextInput
                style={[
                  styles.input,
                  icon ? styles.inputWithIcon : null,
                  props.multiline ? styles.textArea : null,
                ]}
                placeholderTextColor="#999"
                autoCapitalize="none"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value as string}
                {...props}
              />

              {showPasswordToggle && (
                <TouchableOpacity
                  onPress={onTogglePassword}
                  style={styles.toggleButton}
                >
                  <MaterialCommunityIcons
                    name={isPasswordVisible ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              )}
            </View>

            {(fieldError || error) && (
              <Text style={styles.errorText}>
                {fieldError?.message || error?.message || "Error"}
              </Text>
            )}
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  multilineInput: {
    minHeight: 100,
    alignItems: "flex-start",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
    marginLeft: 4,
  },
  toggleButton: {
    padding: 8,
  },
});

export default FormInput;

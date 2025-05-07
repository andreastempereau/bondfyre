import * as yup from "yup";

// Sign In validation schema
export const signInSchema = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// Sign Up validation schema
export const signUpSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
  age: yup
    .string()
    .required("Age is required")
    .matches(/^\d+$/, "Age must be a number"),
  gender: yup.string().required("Gender is required"),
  bio: yup.string().optional(),
  interests: yup.string().optional(),
  phoneNumber: yup.string().optional(),
  username: yup.string().optional(),
});

// Profile Edit validation schema
export const profileEditSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  bio: yup.string().optional(),
  age: yup
    .string()
    .required("Age is required")
    .matches(/^\d+$/, "Age must be a number"),
  gender: yup.string().required("Gender is required"),
  interests: yup.string().optional(),
  phoneNumber: yup.string().optional(),
  username: yup.string().optional(),
});

// Types based on schemas
export type SignInFormData = yup.InferType<typeof signInSchema>;
export type SignUpFormData = yup.InferType<typeof signUpSchema>;
export type ProfileEditFormData = yup.InferType<typeof profileEditSchema>;

// Adding default export to prevent Expo Router from treating this as a route
export default { signInSchema, signUpSchema, profileEditSchema };

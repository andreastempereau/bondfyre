// Form validation helpers
export type ValidationRules = {
  required?: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  match?: { field: string; message: string };
  custom?: (value: any, formData?: any) => string | undefined;
};

export type ValidationErrors = Record<string, string>;

export const validateField = (
  name: string,
  value: any,
  rules: ValidationRules,
  formData?: any
): string | undefined => {
  if (
    rules.required &&
    (!value || (typeof value === "string" && !value.trim()))
  ) {
    return `${name} is required`;
  }

  if (rules.email && value && !/\S+@\S+\.\S+/.test(value)) {
    return "Please enter a valid email address";
  }

  if (
    rules.minLength &&
    value &&
    typeof value === "string" &&
    value.length < rules.minLength
  ) {
    return `${name} must be at least ${rules.minLength} characters`;
  }

  if (
    rules.maxLength &&
    value &&
    typeof value === "string" &&
    value.length > rules.maxLength
  ) {
    return `${name} must be less than ${rules.maxLength} characters`;
  }

  if (rules.match && formData && value !== formData[rules.match.field]) {
    return rules.match.message;
  }

  if (rules.custom) {
    return rules.custom(value, formData);
  }

  return undefined;
};

export const validateForm = (
  formData: Record<string, any>,
  validationSchema: Record<string, ValidationRules>
): { isValid: boolean; errors: ValidationErrors } => {
  const errors: ValidationErrors = {};
  let isValid = true;

  Object.keys(validationSchema).forEach((fieldName) => {
    const error = validateField(
      fieldName,
      formData[fieldName],
      validationSchema[fieldName],
      formData
    );

    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Adding default export to prevent Expo Router from treating this as a route
export default { validateField, validateForm };

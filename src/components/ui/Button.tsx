import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator,
  TouchableOpacityProps
} from 'react-native';
import { theme } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text' | 'error';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...rest
}) => {
  const buttonStyles: ViewStyle[] = [
    styles.button,
    styles[`${variant}Container`],
    styles[`${size}Container`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabledContainer,
    style as ViewStyle,
  ];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
    textStyle as TextStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outlined' || variant === 'text' ? theme.palette.primary : 'white'} 
          size="small"
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={textStyles}>{title}</Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  fullWidth: {
    width: '100%',
  },
  // Variant styles
  primaryContainer: {
    backgroundColor: theme.palette.primary,
  },
  secondaryContainer: {
    backgroundColor: theme.palette.secondary,
  },
  outlinedContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.palette.primary,
    ...StyleSheet.flatten({ shadowOpacity: 0, elevation: 0 }),
  },
  textContainer: {
    backgroundColor: 'transparent',
    ...StyleSheet.flatten({ shadowOpacity: 0, elevation: 0 }),
  },
  errorContainer: {
    backgroundColor: theme.palette.error,
  },
  
  // Size styles
  smallContainer: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    minHeight: 36,
  },
  mediumContainer: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 44,
  },
  largeContainer: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 52,
  },
  
  // Disabled state
  disabledContainer: {
    backgroundColor: theme.palette.grey[300],
    borderColor: theme.palette.grey[300],
  },
  
  // Text styles
  text: {
    ...theme.typography.button,
    textAlign: 'center',
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: 'white',
  },
  outlinedText: {
    color: theme.palette.primary,
  },
  textText: {
    color: theme.palette.primary,
  },
  errorText: {
    color: 'white',
  },
  
  // Text sizes
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  
  // Disabled text
  disabledText: {
    color: theme.palette.grey[600],
  },
});

export default Button;

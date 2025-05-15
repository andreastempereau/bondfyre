import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../../theme';
import { useColorScheme } from 'react-native';

interface ThemedViewProps extends ViewProps {
  lightBg?: string;
  darkBg?: string;
}

const ThemedView: React.FC<ThemedViewProps> = ({ 
  style, 
  lightBg,
  darkBg,
  children,
  ...rest 
}) => {
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';
  
  const backgroundColor = isDark 
    ? (darkBg || theme.palette.background.dark) 
    : (lightBg || theme.palette.background.light);

  return (
    <View 
      style={[
        { backgroundColor },
        style
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

export default ThemedView;

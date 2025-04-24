import { View, ViewProps, StyleSheet } from 'react-native';
import React from 'react';

export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined';
}

export function Card({ style, variant = 'elevated', children, ...props }: CardProps) {
  return (
    <View style={[styles.card, styles[variant], style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
}); 
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import React from 'react';

export interface TextProps extends RNTextProps {
  variant?: 'body' | 'title' | 'subtitle' | 'caption';
}

export function Text({ style, variant = 'body', ...props }: TextProps) {
  return <RNText style={[styles[variant], style]} {...props} />;
}

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  caption: {
    fontSize: 14,
    color: '#666',
  },
}); 
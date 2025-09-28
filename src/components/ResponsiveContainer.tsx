import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SIZES, COLORS } from '../constants/theme';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
  centered?: boolean;
}

export function ResponsiveContainer({ 
  children, 
  style, 
  padding = true, 
  centered = false 
}: ResponsiveContainerProps) {
  return (
    <View style={[
      styles.container,
      padding && styles.withPadding,
      centered && styles.centered,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  withPadding: {
    paddingHorizontal: SIZES.containerPadding,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { COLORS, SIZES } from '../constants/theme'; // 👈 Importe o tema

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
}

export function CustomButton({ title, ...props }: CustomButtonProps) {
  return (
    <TouchableOpacity style={styles.button} {...props}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '85%',
    backgroundColor: COLORS.primary, 
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: COLORS.white, 
    fontSize: 18,
    fontWeight: 'bold',
  },
});
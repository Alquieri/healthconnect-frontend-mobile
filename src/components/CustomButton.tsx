import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { COLORS, SIZES, createResponsiveStyle } from '../constants/theme';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export function CustomButton({ 
  title, 
  disabled, 
  variant = 'primary',
  size = 'medium',
  fullWidth = true,
  style,
  ...props 
}: CustomButtonProps) {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style
  ];

  const textStyle = [
    styles.buttonText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText
  ];

  return (
    <TouchableOpacity style={buttonStyle} disabled={disabled} {...props}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Variantes
  primary: {
    backgroundColor: COLORS.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  secondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    // Sem sombra para evitar o efeito "por dentro"
  },
  
  // Tamanhos
  small: {
    paddingVertical: createResponsiveStyle(10),
    paddingHorizontal: createResponsiveStyle(16),
    minHeight: createResponsiveStyle(40),
  },
  medium: {
    paddingVertical: createResponsiveStyle(14),
    paddingHorizontal: createResponsiveStyle(20),
    minHeight: createResponsiveStyle(50),
  },
  large: {
    paddingVertical: createResponsiveStyle(18),
    paddingHorizontal: createResponsiveStyle(24),
    minHeight: createResponsiveStyle(58),
  },
  
  // Largura total
  fullWidth: {
    width: SIZES.buttonWidth,
  },
  
  // Estados
  disabled: {
    backgroundColor: '#CCCCCC',
    elevation: 0,
    shadowOpacity: 0,
    borderColor: '#CCCCCC',
  },
  
  // Textos
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.text,
  },
  outlineText: {
    color: COLORS.primary,
  },
  smallText: {
    fontSize: SIZES.small,
  },
  mediumText: {
    fontSize: SIZES.font,
  },
  largeText: {
    fontSize: SIZES.medium,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
});

export default CustomButton;
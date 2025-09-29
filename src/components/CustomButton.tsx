import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { getTheme, SIZES, createResponsiveStyle } from '../constants/theme';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  userType?: 'patient' | 'doctor' | 'default';
}

export function CustomButton({ 
  title, 
  variant = 'primary', 
  size = 'medium',
  fullWidth = true,
  userType = 'default',
  style, 
  disabled, 
  ...props 
}: CustomButtonProps) {
  
  try {
    const COLORS = getTheme(userType);
    
    const getButtonColors = () => {
      if (disabled) {
        return {
          backgroundColor: '#CCCCCC',
          borderColor: '#CCCCCC',
          textColor: '#999999'
        };
      }

      switch (variant) {
        case 'primary':
          return {
            backgroundColor: COLORS.primary,
            borderColor: COLORS.primary,
            textColor: COLORS.white
          };
        case 'secondary':
          if (userType === 'doctor') {
            return {
              backgroundColor: COLORS.primary,
              borderColor: COLORS.primary,
              textColor: COLORS.white
            };
          }
          return {
            backgroundColor: COLORS.white,
            borderColor: COLORS.border,
            textColor: COLORS.text
          };
        case 'outline':
          return {
            backgroundColor: 'transparent',
            borderColor: COLORS.primary,
            textColor: COLORS.primary
          };
        default:
          return {
            backgroundColor: COLORS.primary,
            borderColor: COLORS.primary,
            textColor: COLORS.white
          };
      }
    };

    const colors = getButtonColors();

    const getSizeStyles = () => {
      switch (size) {
        case 'small':
          return {
            paddingVertical: 8,
            paddingHorizontal: 16,
            fontSize: SIZES.small
          };
        case 'large':
          return {
            paddingVertical: 16,
            paddingHorizontal: 24,
            fontSize: SIZES.medium
          };
        default:
          return {
            paddingVertical: 12,
            paddingHorizontal: 20,
            fontSize: SIZES.font
          };
      }
    };

    const sizeStyles = getSizeStyles();

    return (
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.backgroundColor,
            borderColor: colors.borderColor,
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            width: fullWidth ? '100%' : 'auto',
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
        disabled={disabled}
        {...props}
      >
        <Text
          style={{
            color: colors.textColor,
            fontSize: sizeStyles.fontSize,
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  } catch (error) {
    console.error('[CustomButton] Erro no render:', error);
    
    return (
      <TouchableOpacity
        style={[
          styles.fallbackButton,
          { width: fullWidth ? '100%' : 'auto' },
          style,
        ]}
        disabled={disabled}
        {...props}
      >
        <Text style={styles.fallbackText}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    borderWidth: 1,
  },
  
  fallbackButton: {
    backgroundColor: '#A41856',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A41856',
  },
  
  fallbackText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  }
});

export default CustomButton;

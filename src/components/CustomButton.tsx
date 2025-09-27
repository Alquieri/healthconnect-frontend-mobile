import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

interface CustomButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
  labelStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  style,
  labelStyle,
  disabled = false,
  loading = false,
}) => {
  // --- Lógica de estilos ajustada para ser type-safe ---
  
  // 1. Começamos com os estilos base
  const containerStyles: ViewStyle[] = [
    styles.container,
    variant === 'primary' ? styles.primaryContainer : styles.secondaryContainer,
  ];
  const labelStyles: TextStyle[] = [
    styles.label,
    variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel,
  ];

  // 2. Adicionamos os estilos condicionais (disabled/loading)
  if (disabled || loading) {
    containerStyles.push(styles.disabledContainer);
    labelStyles.push(styles.disabledLabel);
  }
  
  // 3. Adicionamos estilos customizados passados via props, se existirem
  if (style) {
    containerStyles.push(style);
  }
  if (labelStyle) {
    labelStyles.push(labelStyle);
  }
  // --- Fim da lógica de estilos ajustada ---

  return (
    <TouchableOpacity style={containerStyles} onPress={onPress} disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.white : COLORS.primary} />
      ) : (
        <Text style={labelStyles}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SIZES.padding,
    width: '100%',
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  label: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
  },
  primaryContainer: {
    backgroundColor: COLORS.primary,
  },
  primaryLabel: {
    color: COLORS.white,
  },
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  secondaryLabel: {
    color: COLORS.primary,
  },
  disabledContainer: {
    backgroundColor: COLORS.border,
    borderColor: COLORS.border, // Garantimos que a borda também muda
    borderWidth: 2, // Mantemos a consistência da borda
  },
  disabledLabel: {
    color: COLORS.placeholder,
  },
});

export default CustomButton;
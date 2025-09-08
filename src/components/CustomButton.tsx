import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { COLORS } from '../constants/theme';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
}

export function CustomButton({ title, disabled, ...props }: CustomButtonProps) {
  return (
    // Adicionamos um estilo condicional: se 'disabled' for true, aplica o estilo 'disabledButton'
    <TouchableOpacity style={[styles.button, disabled && styles.disabledButton]} disabled={disabled} {...props}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '85%',
    backgroundColor: COLORS.primary, // Cor normal A41856
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  // 👇 NOVO ESTILO PARA O BOTÃO DESABILITADO
  disabledButton: {
    backgroundColor: '#CCCCCC', // Um cinza claro para indicar que não é clicável
    elevation: 0,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
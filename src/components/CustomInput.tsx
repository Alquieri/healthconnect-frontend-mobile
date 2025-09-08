import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, SIZES } from '../constants/theme'; // 👈 Importe o tema

type CustomInputProps = TextInputProps;

export function CustomInput(props: CustomInputProps) {
  return (
    <TextInput
      style={styles.input}
      placeholderTextColor={COLORS.placeholder} // 👈 Use a cor do tema
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '85%',
    backgroundColor: COLORS.white, // 👈 Use a cor do tema
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: SIZES.font,
    color: COLORS.text,
  },
});
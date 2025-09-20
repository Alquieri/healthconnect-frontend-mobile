import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

// O componente agora recebe propriedades para se tornar um "componente controlado"
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export function SearchBar({ value, onChangeText, onSubmit }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Pesquisar especialistas..."
        placeholderTextColor={COLORS.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit} // Esta função é chamada ao pressionar "Enter"
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 50,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
});


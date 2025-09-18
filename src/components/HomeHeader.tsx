import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from './SearchBar'; // 👈 1. Importe a SearchBar aqui

interface HomeHeaderProps {
  userName: string;
}

export function HomeHeader({ userName }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.greeting}>Olá, {userName}</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <SearchBar /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary, // Sua cor #A41856
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20, // Aumentamos o padding inferior para dar espaço
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Espaço entre a saudação e a barra de pesquisa
  },
  greeting: {
    fontSize: 24,
    color: COLORS.white,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORSDOCTOR, SIZES } from "../constants/theme";
import  Ionicons  from '@expo/vector-icons';
import { SearchBar } from './SearchBar';


interface HomeHeaderProps {
  userName: string;
  onNotificationsPress: () => void;
  hasUnreadNotifications?: boolean;
}

export function HeaderDoctor({ userName, onNotificationsPress, hasUnreadNotifications }: HomeHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/searchDoctor',
        params: { query: searchQuery.trim() }
      });
    } else {
      router.push('/searchDoctor');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.greeting}>Olá, {userName}!</Text>
        <TouchableOpacity 
          onPress={onNotificationsPress}
          style={styles.notificationButton}
        >
          <Ionicons name="notifications-outline" size={24} color={COLORSDOCTOR.white} />
          {hasUnreadNotifications && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearch}
        placeholder="Busque por pacientes ou agendamentos..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORSDOCTOR.primary,
    paddingTop: 50,
    paddingHorizontal: SIZES.containerPadding,
    paddingBottom: SIZES.medium,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORSDOCTOR .white,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff3b30',
    borderWidth: 1.5,
    borderColor: COLORSDOCTOR .primary,
  },
});

export const HEADER_CONSTANTS = {
  paddingTop: 50,           // Distância da câmera/status bar
  paddingHorizontal: SIZES.containerPadding, // 20px
  paddingBottom: SIZES.medium,
  minHeight: 100,           // Altura mínima do header
  titleFontSize: SIZES.large,
  titleFontWeight: '700' as const,
};

// Função para criar header padronizado
export const createStandardHeader = () => ({
  paddingTop: HEADER_CONSTANTS.paddingTop,
  paddingHorizontal: HEADER_CONSTANTS.paddingHorizontal, 
  paddingBottom: HEADER_CONSTANTS.paddingBottom,
  minHeight: HEADER_CONSTANTS.minHeight,
});
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from './SearchBar';

interface HomeHeaderProps {
  userName: string;
  onNotificationsPress: () => void;
  hasUnreadNotifications: boolean; 
}

export function HomeHeader({ userName, onNotificationsPress, hasUnreadNotifications }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.greeting}>Olá, {userName}</Text>
        <TouchableOpacity onPress={onNotificationsPress} style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={28} color={COLORS.white} />
          {hasUnreadNotifications && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>
      <SearchBar /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    color: COLORS.white,
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
    borderColor: COLORS.primary,
  },
});


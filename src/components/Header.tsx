import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../constants/theme';
import { Sidebar } from './Sidebar';

interface StandardHeaderProps {
  title: string;
  showBackButton?: boolean;
  showSidebar?: boolean;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  userType?: 'default' | 'doctor';
}

export function StandardHeader({ 
  title, 
  showBackButton = true,
  showSidebar = true,
  rightComponent,
  onBackPress,
  userType = 'default'
}: StandardHeaderProps) {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const headerColor = userType === 'doctor' ? '#00A651' : COLORS.primary;

  return (
    <View style={[styles.header, { backgroundColor: headerColor }]}>
      {/* Left Side - Sidebar ou Back Button */}
      <View style={styles.leftSection}>
        {showSidebar ? (
          <Sidebar userType={userType} />
        ) : showBackButton ? (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      {/* Right Side */}
      <View style={styles.rightSection}>
        {rightComponent || <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.containerPadding,
    paddingTop: 50,
    paddingBottom: SIZES.medium,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginHorizontal: SIZES.small,
  },
  placeholder: {
    width: 44,
    height: 44,
  },
});
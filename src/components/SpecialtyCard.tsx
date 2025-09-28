import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../constants/theme';

interface SpecialtyCardProps {
  item: {
    id: string;
    name: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  };
}

export function SpecialtyCard({ item }: SpecialtyCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/searchDoctor',
      params: { 
        specialty: item.name,
        specialtyId: item.id,
        query: '' // ✅ Limpar query quando vier de especialidade
      }
    });
  };

  return (
    <View style={styles.cardOuterContainer}>
      <TouchableOpacity 
        style={styles.cardInnerContainer}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={item.icon} size={28} color={COLORS.white} />
        </View>
        <Text style={styles.cardText} numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuterContainer: {
    width: '33.33%',
    padding: 6,      
  },
  cardInnerContainer: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#A78282',
    borderRadius: SIZES.radius * 2,
    paddingVertical: 12, 
    paddingHorizontal: 4,
  },
  iconCircle: {
    width: 56, 
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 14,
  },
});
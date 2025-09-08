import React from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

interface SpecialtyCardProps {
  item: {
    id: string;
    name: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  };
}

export function SpecialtyCard({ item }: SpecialtyCardProps) {
  return (
    <View style={styles.cardOuterContainer}>
      <TouchableOpacity style={styles.cardInnerContainer}>
        <View style={styles.iconCircle}>
          {/* Ícone menor */}
          <MaterialCommunityIcons name={item.icon} size={28} color={COLORS.white} />
        </View>
        <Text style={styles.name}>{item.name}</Text>
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
    backgroundColor: COLORS.primary, // Cor #A41856
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  isOnline: boolean;
}

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <TouchableOpacity style={styles.card}>
      <Image 
        source={{ uri: `https://i.pravatar.cc/150?u=${doctor.id}` }} 
        style={styles.avatar} 
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{doctor.name}</Text>
        <Text style={styles.specialty} numberOfLines={1}>{doctor.specialty}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFC700" />
        <Text style={styles.rating}>{doctor.rating.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent', // Fundo transparente
    paddingVertical: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  specialty: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});


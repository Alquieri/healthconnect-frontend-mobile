import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { DoctorCard } from './DoctorCard';

// Dados fictícios definidos diretamente no ficheiro
const featuredDoctors = [
  {
    id: '1',
    name: 'Dr. Luke Whitesell',
    specialty: 'Cardiologista',
    rating: 4.95,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Dra. Ana Costa',
    specialty: 'Dermatologista',
    rating: 4.92,
    isOnline: false,
  },
  {
    id: '3',
    name: 'Dr. Pedro Martins',
    specialty: 'Pediatra',
    rating: 4.89,
    isOnline: true,
  },
];


export function FeaturedDoctorsList() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Especialistas mais bem avaliados da região!</Text>
      
      {featuredDoctors.map(doctor => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    paddingBottom: 0, // Remover padding inferior para o último card alinhar
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
});


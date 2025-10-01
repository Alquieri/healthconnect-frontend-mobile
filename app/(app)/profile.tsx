import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomButton } from '../../src/components/CustomButton';
import { ResponsiveContainer } from '../../src/components/ResponsiveContainer';
import { COLORS, SIZES } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GuestProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ResponsiveContainer centered>
        <View style={styles.guestContainer}>
          <Ionicons name="person-circle-outline" size={SIZES.width * 0.25} color={COLORS.textSecondary} />
          <Text style={styles.guestTitle}>Acesse sua Conta</Text>
          <Text style={styles.guestSubtitle}>
            Faça login ou crie uma conta para agendar consultas e gerir o seu perfil.
          </Text>
          
          <View style={styles.guestButtonsContainer}>
            <CustomButton 
              title="Entrar" 
              onPress={() => router.push('/(auth)/login')} 
              style={styles.guestButton}
            />
            
            <CustomButton 
              title="Criar Conta de Paciente" 
              variant="outline"
              onPress={() => router.push('/(auth)/register')}
              style={styles.guestButton}
            />

            <CustomButton 
              title="Sou Médico - Cadastrar" 
              variant="secondary"
              userType="doctor"
              onPress={() => router.push('/(auth)/registerDoctor')}
              style={[styles.guestButton, styles.doctorButton]}
            />
          </View>
        </View>
      </ResponsiveContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  guestContainer: { 
    alignItems: 'center', 
    paddingHorizontal: SIZES.large 
  },
  guestTitle: { 
    fontSize: SIZES.xLarge, 
    fontWeight: 'bold', 
    color: COLORS.text, 
    marginBottom: SIZES.small,
    marginTop: SIZES.large,
    textAlign: 'center',
  },
  guestSubtitle: { 
    fontSize: SIZES.medium, 
    color: COLORS.textSecondary, 
    textAlign: 'center', 
    lineHeight: SIZES.large,
    marginBottom: SIZES.xLarge,
  },
  guestButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: SIZES.medium,
  },
  guestButton: {
    width: '100%',
  },
  doctorButton: {
    backgroundColor: '#00A651',
    borderColor: '#00A651',
  },
});
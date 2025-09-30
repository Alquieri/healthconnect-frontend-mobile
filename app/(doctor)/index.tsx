import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function DoctorDashboard() {
  const router = useRouter();
  const COLORS = getTheme('doctor');
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza de que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard Médico</Text>
        <Text style={styles.subtitle}>Em desenvolvimento pelo seu amigo</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/(doctor)/create-availability')}
        >
          <Ionicons name="calendar-outline" size={32} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Cadastrar Horários</Text>
          <Text style={styles.cardDescription}>
            Defina seus horários disponíveis para consultas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botão de logout */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00A651' },
  subtitle: { fontSize: 16, color: '#666666', marginTop: 5 },
  content: { flex: 1, padding: 20 },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginTop: 10, color: '#333333' },
  cardDescription: { fontSize: 14, color: '#666666', textAlign: 'center', marginTop: 5 },
  // Estilos para o botão de logout
  logoutButton: {
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
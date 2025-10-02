import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SIZES } from '../../src/constants/theme';
import { getClientProfileByUserId } from '../../src/api/services/patient';
import { ResponsiveContainer } from '../../src/components/ResponsiveContainer';
import { SafeAreaView } from 'react-native-safe-area-context'
interface PatientProfile {
  id: string;
  name: string;
  email: string;
}

export default function PatientProfileScreen() {
  const { logout, session } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    if (!session.userId) return;

    setLoading(true);
    try {
      const patientData = await getClientProfileByUserId(session.userId);
      setUserProfile({
        id: patientData.id,
        name: patientData.name,
        email: patientData.email,
      });
    } catch (error) {
      console.error("Erro ao buscar perfil do paciente:", error);
      Alert.alert('Erro', 'Não foi possível carregar o seu perfil.');
    } finally {
      setLoading(false);
    }
  }, [session.userId]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

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

  const menuOptions = [
    { id: '1', label: 'Meus Dados', icon: 'person-circle-outline' as const, action: () => router.push('/myDetails') },
    { id: '2', label: 'Meus Agendamentos', icon: 'calendar-outline' as const, action: () => router.push('/MyScheduling') },
    { id: '3', label: 'Médicos Favoritos', icon: 'heart-outline' as const, action: () => { /* Navegar para Favoritos */ } },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ResponsiveContainer centered>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
        <SafeAreaView style={styles.safeArea}>
        <ResponsiveContainer centered>
          <Text>Erro ao carregar o perfil.</Text>
        </ResponsiveContainer>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.userInfoSection}>
          <Image 
            source={{ uri: `https://i.pravatar.cc/150?u=${userProfile.id}` }} 
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
        </View>

        <View style={styles.menuSection}>
          {menuOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.menuItem} onPress={option.action}>
              <View style={styles.menuItemContent}>
                <Ionicons name={option.icon} size={24} color={COLORS.primary} />
                <Text style={styles.menuItemLabel}>{option.label}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={styles.menuItemContent}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
              <Text style={[styles.menuItemLabel, { color: COLORS.error }]}>Sair</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  loadingText: { marginTop: 10, color: COLORS.textSecondary },
  scrollContainer: { flexGrow: 1, paddingVertical: SIZES.large },
  userInfoSection: { alignItems: 'center', marginBottom: SIZES.xLarge, paddingHorizontal: SIZES.containerPadding },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: SIZES.medium, borderWidth: 3, borderColor: COLORS.primary },
  userName: { fontSize: SIZES.large, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.tiny },
  userEmail: { fontSize: SIZES.medium, color: COLORS.textSecondary },
  menuSection: { paddingHorizontal: SIZES.containerPadding },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: SIZES.large, borderRadius: SIZES.radius, marginBottom: SIZES.medium, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  menuItemContent: { flexDirection: 'row', alignItems: 'center' },
  menuItemLabel: { fontSize: SIZES.font, color: COLORS.text, marginLeft: SIZES.medium, fontWeight: '500' },
  logoutItem: { marginTop: SIZES.medium },
});
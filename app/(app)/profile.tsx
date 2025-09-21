import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/constants/theme';
import { getMyProfile } from '../../src/api/services/user';
// import { User } from '../../src/api/models/user'; // Removido para corrigir o erro
import { AxiosError } from 'axios';

// 1. A interface 'User' agora está definida diretamente aqui.
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
}

export default function ProfileScreen() {
  const { logout, refreshAuth, forceLogout } = useAuth();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Dados para os itens da lista de menu
  const menuOptions = [
    { id: '1', label: 'Meus Dados', icon: 'person-circle-outline' as const, action: () => router.push('/myDetails') },
    { id: '2', label: 'Meus Agendamentos', icon: 'calendar-outline' as const, action: () => console.log('Navegar para Agendamentos') },
    { id: '3', label: 'Médicos Favoritos', icon: 'heart-outline' as const, action: () => console.log('Navegar para Favoritos') },
    { id: '4', label: 'Ajuda e Suporte', icon: 'help-circle-outline' as const, action: () => console.log('Navegar para Ajuda') },
  ];

  useEffect(() => {
    const fetchUserProfile = async (isRetry = false) => {
      try {
        if (!isRetry) setLoading(true);
        const profileData = await getMyProfile();
        setUserProfile(profileData);
      } catch (error: any) {
        if (error instanceof AxiosError && error.response?.status === 401 && !isRetry) {
          try {
            console.log('[ProfileScreen] 🔄 Sessão expirada, a tentar refresh...');
            await refreshAuth();
            await fetchUserProfile(true); // Tenta buscar o perfil novamente após o refresh
          } catch (retryError) {
            console.error('[ProfileScreen] ❌ Falha no refresh, a forçar logout:', retryError);
            await forceLogout();
            Alert.alert('Sessão Expirada', 'A sua sessão expirou. Por favor, faça login novamente.');
          }
        } else {
          console.error("Erro ao buscar perfil na tela de Perfil:", error);
          Alert.alert(
            'Erro de Comunicação', 
            'Não foi possível carregar os dados do seu perfil.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.userInfoSection}>
          <Image 
            source={{ uri: `https://picsum.photos/seed/${userProfile?.id || 'default'}/200` }} 
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userProfile?.name || 'Nome do Utilizador'}</Text>
          <Text style={styles.userEmail}>{userProfile?.email || 'email@exemplo.com'}</Text>
        </View>

        <View style={styles.menuSection}>
          {menuOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.menuItem} onPress={option.action}>
              <View style={styles.menuItemContent}>
                <Ionicons name={option.icon} size={24} color={COLORS.text} />
                <Text style={styles.menuItemLabel}>{option.label}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.menuItem} onPress={logout}>
            <View style={styles.menuItemContent}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
              <Text style={[styles.menuItemLabel, { color: COLORS.error }]}>Sair</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={22} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  userInfoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  menuSection: {
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
    color: COLORS.text,
  },
});


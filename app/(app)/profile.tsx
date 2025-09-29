import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SIZES } from '../../src/constants/theme';
import { getClientProfileByUserId } from '../../src/api/services/patient'
import { CustomButton } from '../../src/components/CustomButton';
import { ResponsiveContainer } from '../../src/components/ResponsiveContainer';
import { getDoctorByIdDetail } from '../../src/api/services/doctor';
import { HEADER_CONSTANTS } from '../../src/constants/layout';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  userId?: string;
  sex?: string;
}

// ✅ Componente para usuários não logados
const GuestProfileView = () => {
  const router = useRouter();
  return (
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
            onPress={() => router.push('/login')} 
            style={styles.guestButton}
          />
          
          <CustomButton 
            title="Criar Conta de Paciente" 
            variant="outline"
            onPress={() => router.push('/register')}
            style={styles.guestButton}
          />

          {/* ✅ Novo botão para cadastro médico */}
          <CustomButton 
            title="Sou Médico - Cadastrar" 
            variant="secondary"
            userType="doctor"
            onPress={() => router.push('/registerDoctor')}
            style={[styles.guestButton, styles.doctorButton]}
          />
        </View>
      </View>
    </ResponsiveContainer>
  );
};

interface UserProfileViewProps {
  userProfile: UserProfile;
  onLogout: () => void;
}

// ✅ Componente para usuários logados
const UserProfileView: React.FC<UserProfileViewProps> = ({ userProfile, onLogout }) => {
  const router = useRouter();

  const menuOptions = [
    { id: '1', label: 'Meus Dados', icon: 'person-circle-outline' as const, action: () => router.push('/myDetails') },
    { id: '2', label: 'Meus Agendamentos', icon: 'calendar-outline' as const, action: () => router.push('/MyScheduling') },
    { id: '3', label: 'Médicos Favoritos', icon: 'heart-outline' as const, action: () => console.log('Navegar para Favoritos') },
  ];

  return (
    <ResponsiveContainer>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userInfoSection}>
          <Image 
            source={{ uri: `https://picsum.photos/seed/${userProfile?.id || 'default'}/200` }} 
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userProfile?.name || 'Nome do Usuário'}</Text>
          <Text style={styles.userEmail}>{userProfile?.email || 'email@exemplo.com'}</Text>
        </View>

        <View style={styles.menuSection}>
          {menuOptions.map((option) => (
            <TouchableOpacity key={option.id} style={styles.menuItem} onPress={option.action}>
              <View style={styles.menuItemContent}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={option.icon} size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.menuItemLabel}>{option.label}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={onLogout}>
            <View style={styles.menuItemContent}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
              </View>
              <Text style={[styles.menuItemLabel, { color: COLORS.error }]}>Sair</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ResponsiveContainer>
  );
};

export default function ProfileScreen() {
  const { logout, session, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false); // ✅ Inicia como false

  useEffect(() => {
    const fetchUserProfile = async () => {
      // ✅ Só carrega perfil se estiver autenticado
      if (!isAuthenticated || !session.userId) {
        setLoading(false);
        setUserProfile(null);
        return;
      }

      setLoading(true);
      try {
        let profileData: UserProfile;
        
        if (session.role === 'client' || session.role === 'patient' || session.role === 'admin') {
          const patientData = await getClientProfileByUserId(session.userId);
          console.log("DADOS RECEBIDOS DA API", JSON.stringify(patientData, null, 2));
          
          profileData = {
            id: patientData.id,
            userId: patientData.userId,
            name: patientData.name,
            email: patientData.email,
            phone: patientData.phone,
            cpf: patientData.cpf,
            birthDate: (patientData.birthDate || '').toString(),
            sex: patientData.sex,
          };
        } else if (session.role === 'doctor') {
          const doctorData = await getDoctorByIdDetail(session.userId);
          profileData = {
            id: doctorData.id,
            name: doctorData.name,
            email: doctorData.email,
            phone: doctorData.phone,
            cpf: doctorData.cpf,
            birthDate: doctorData.birthDate,
          };
        } else {
          throw new Error(`Role de usuário desconhecido: ${session.role}`);
        }
        
        setUserProfile(profileData);
      } catch (error: any) {
        console.error("Erro ao buscar perfil:", error);
        
        // ✅ Se erro 401, significa token inválido - mostrar tela de guest
        if (error.response?.status === 401) {
          console.log('[Profile] Token inválido, mostrando tela de guest');
          setUserProfile(null);
        } else {
          Alert.alert('Erro', 'Não foi possível carregar o perfil do usuário.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isAuthenticated, session.userId, session.role]);

  const handleLogout = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza de que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  // ✅ Se estiver carregando, mostrar loading
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

  // ✅ Se não estiver logado OU não tiver perfil, mostrar tela de guest
  if (!isAuthenticated || !userProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <GuestProfileView />
      </SafeAreaView>
    );
  }

  // ✅ Se estiver logado E tiver perfil, mostrar perfil do usuário
  return (
    <SafeAreaView style={styles.safeArea}>
      <UserProfileView userProfile={userProfile} onLogout={handleLogout} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  scrollContainer: { 
    flexGrow: 1, 
    paddingVertical: SIZES.large 
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
    gap: SIZES.medium, // ✅ Espaçamento uniforme entre botões
  },
  guestButton: {
    marginBottom: 0, // ✅ Remove margin pois usamos gap
  },
  // ✅ Estilo melhorado para o botão médico
  doctorButton: {
    backgroundColor: '#00A651', // Verde médico
    borderColor: '#00A651',
    elevation: 3, // ✅ Sombra mais destacada
    shadowColor: '#00A651',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loadingText: {
    fontSize: SIZES.medium,
    color: COLORS.textSecondary,
    marginTop: SIZES.medium,
    textAlign: 'center',
  },
  userInfoSection: { 
    alignItems: 'center', 
    marginBottom: SIZES.xLarge,
    paddingHorizontal: SIZES.containerPadding,
  },
  avatar: { 
    width: SIZES.width * 0.3, 
    height: SIZES.width * 0.3, 
    borderRadius: SIZES.width * 0.15, 
    marginBottom: SIZES.medium, 
    borderWidth: 3, 
    borderColor: COLORS.primary 
  },
  userName: { 
    fontSize: SIZES.large, 
    fontWeight: 'bold', 
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.tiny,
  },
  userEmail: { 
    fontSize: SIZES.medium, 
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  menuSection: { 
    paddingHorizontal: SIZES.containerPadding,
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: COLORS.white, 
    padding: SIZES.large, 
    borderRadius: SIZES.radius * 1.5, 
    marginBottom: SIZES.medium, 
    // ✅ Sombra corrigida - mais sutil
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuItemContent: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  menuItemLabel: { 
    fontSize: SIZES.font, 
    fontWeight: '500', 
    color: COLORS.text,
    flex: 1,
  },
  logoutItem: {
    marginTop: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.error + '20',
  },
});
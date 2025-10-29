import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '../../src/constants/theme';
import { HomeHeader } from '../../src/components/HomeHeader';
import { SpecialtyGrid } from '../../src/components/SpecialtyGrid';
import { VideoCard } from '../../src/components/VideoCard';
import { SecondOpinionCard } from '../../src/components/SecondOpinionCard';
import { FeaturedDoctorsList } from '../../src/components/FeaturedDoctorsList';
import { NotificationsPopup, Notification } from '../../src/components/NotificationsPopup';
import { useAuth } from '../../src/context/AuthContext';
import { getClientProfileByUserId } from '../../src/api/services/patient';
import { getDoctorByIdDetail } from '../../src/api/services/doctor';

const initialNotifications: Notification[] = [
  { 
    id: '1', 
    title: 'Bem-vindo!', 
    message: 'Explore os nossos especialistas e agende a sua primeira consulta.', 
    time: '2 dias atrás', 
    read: false, 
    link: '/searchDoctor', 
    type: 'default' 
  },
  { 
    id: '2', 
    title: 'Complete o seu Cadastro', 
    message: 'Percebemos que o seu perfil não está completo. Toque aqui para finalizar.', 
    time: '3 dias atrás', 
    read: false, 
    link: '/register', 
    type: 'default' 
  },
  { 
    id: '3', 
    title: 'É um Profissional de Saúde?', 
    message: 'Clique aqui para se cadastrar como médico e oferecer seus serviços.', 
    time: '3 dias atrás', 
    read: true, 
    link: '/registerDoctor',
    type: 'doctor' 
  },
];

export default function HomeScreen() {
  const { session, isAuthenticated } = useAuth();
  
  // ✅ Estados organizados
  const [userName, setUserName] = useState('Visitante'); 
  const [loadingUserName, setLoadingUserName] = useState(false);
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [hasUnread, setHasUnread] = useState(false); // ✅ Estado adicionado

  // ✅ Função otimizada para carregar nome do usuário
  const loadUserName = useCallback(async () => {
    if (!isAuthenticated || !session.userId) {
      setUserName('Visitante');
      return;
    }

    setLoadingUserName(true);
    
    try {
      if (session.role === 'patient') {
        const patientData = await getClientProfileByUserId(session.userId);
        const firstName = patientData.name.split(' ')[0];
        setUserName(firstName);
        console.log('[HomeScreen] ✅ Nome do paciente carregado:', firstName);
        
      } else if (session.role === 'doctor') {
        if (!session.profileId) {
          console.warn('[HomeScreen] ⚠️ profileId não encontrado para médico');
          setUserName('Doutor');
          return;
        }
        
        const doctorData = await getDoctorByIdDetail(session.profileId);
        const firstName = doctorData.name.split(' ')[0];
        setUserName(firstName);
        console.log('[HomeScreen] ✅ Nome do médico carregado:', firstName);
        
      } else {
        setUserName('Visitante');
      }
      
    } catch (error: any) {
      console.error('[HomeScreen] ❌ Erro ao carregar nome do usuário:', error);
      
      // ✅ Tratamento de erro melhorado
      if (error.response?.status === 401) {
        console.log('[HomeScreen] 🔒 Token inválido, usando nome padrão');
        setUserName('Visitante');
      } else if (error.response?.status === 404) {
        console.log('[HomeScreen] 🔍 Usuário não encontrado, usando nome padrão');
        if (session.role === 'doctor') {
          setUserName('Doutor');
        } else if (session.role === 'patient') {
          setUserName('Paciente');
        } else {
          setUserName('Usuário');
        }
      } else {
        // ✅ Fallback baseado no role
        if (session.role === 'doctor') {
          setUserName('Doutor');
        } else if (session.role === 'patient') {
          setUserName('Paciente');
        } else if (session.role) {
          setUserName('Usuário');
        } else {
          setUserName('Visitante');
        }
      }
    } finally {
      setLoadingUserName(false);
    }
  }, [isAuthenticated, session.userId, session.role, session.profileId]);

  // ✅ Effect para carregar nome do usuário
  useEffect(() => {
    loadUserName();
  }, [loadUserName]);

  // ✅ Effect para verificar notificações não lidas
  useEffect(() => {
    const unreadExists = notifications.some(n => !n.read);
    setHasUnread(unreadExists);
    console.log('[HomeScreen] 📧 Notificações não lidas:', unreadExists);
  }, [notifications]);

  // ✅ Função para marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ 
        ...notification, 
        read: true 
      }))
    );
    console.log('[HomeScreen] ✅ Todas as notificações marcadas como lidas');
  }, []);

  // ✅ Função para abrir popup de notificações
  const handleNotificationsPress = useCallback(() => {
    console.log('[HomeScreen] 🔔 Abrindo popup de notificações');
    setIsNotificationsVisible(true);
    markAllAsRead(); // Marca todas como lidas ao abrir
  }, [markAllAsRead]);

  // ✅ Função para fechar popup de notificações
  const handleCloseNotifications = useCallback(() => {
    console.log('[HomeScreen] ❌ Fechando popup de notificações');
    setIsNotificationsVisible(false);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <HomeHeader 
        userName={loadingUserName ? 'Carregando...' : userName}
        onNotificationsPress={handleNotificationsPress}
        hasUnreadNotifications={hasUnread}
      />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SpecialtyGrid />
        <VideoCard />
        <SecondOpinionCard />
        <FeaturedDoctorsList />
      </ScrollView>
      
      <NotificationsPopup 
        visible={isNotificationsVisible}
        onClose={handleCloseNotifications}
        notifications={notifications}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // ✅ Padding inferior para melhor UX
  },
});


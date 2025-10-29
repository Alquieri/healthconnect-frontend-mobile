import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, ScrollView } from 'react-native';
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
  const { session } = useAuth();
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  useEffect(() => {
    const loadUserName = async () => {
      if (!session.userId) {
        setUserName('Visitante');
        return;
      }

      try {
        if (session.role === 'patient') {
          const patientData = await getClientProfileByUserId(session.userId);
          const firstName = patientData.name.split(' ')[0];
          setUserName(firstName);
        } else if (session.role === 'doctor') {
          const doctorData = await getDoctorByIdDetail(session.profileId!);
          const firstName = doctorData.name.split(' ')[0];
          setUserName(firstName);
        } else {
          setUserName('Visitante');
        }
        
      } catch (error: any) {
        console.error('[HomeScreen] Erro ao carregar nome do usuário:', error);
        
        // ✅ Se houver erro 401 ou similar, voltar ao padrão
        if (error.response?.status === 401) {
          console.log('[HomeScreen] Token inválido, usando nome padrão');
          setUserName('Visitante');
        } else {
          // Em caso de outros erros, usar nome baseado no role ou padrão
          if (session.role === 'doctor') {
            setUserName('Doutor');
          } else if (session.role) {
            setUserName('Usuário');
          } else {
            setUserName('Visitante');
          }
        }
      }
    };

    loadUserName();
  }, [session.userId, session.role]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <HomeHeader 
        userName={userName}
        onNotificationsPress={() => setIsNotificationsVisible(true)}
        hasUnreadNotifications={notifications.some(n => !n.read)}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <SpecialtyGrid />
        <VideoCard />
        <SecondOpinionCard />
        <FeaturedDoctorsList />
      </ScrollView>
      
      <NotificationsPopup 
        visible={isNotificationsVisible}
        onClose={() => setIsNotificationsVisible(false)}
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
});


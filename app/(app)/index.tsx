import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS } from '../../src/constants/theme';
import { HomeHeader } from '../../src/components/HomeHeader';
import { SpecialtyGrid } from '../../src/components/SpecialtyGrid';
import { VideoCard } from '../../src/components/VideoCard';
import { FeaturedDoctorsList } from '../../src/components/FeaturedDoctorsList';
import { NotificationsPopup, Notification } from '../../src/components/NotificationsPopup';
import { useAuth } from '../../src/context/AuthContext';
import { getClientProfileByUserId } from '../../src/api/services/patient';
import { getDoctorByIdDetail } from '../../src/api/services/doctor';

// Os dados das notificações agora são geridos aqui
const initialNotifications: Notification[] = [
  { id: '1', title: 'Bem-vindo!', message: 'Explore os nossos especialistas e agende a sua primeira consulta.', time: '2 dias atrás', read: false, link: '/searchDoctor', type: 'default' },
  { id: '2', title: 'Complete o seu Cadastro', message: 'Percebemos que o seu perfil não está completo. Toque aqui para finalizar.', time: '3 dias atrás', read: false, link: '/register', type: 'default' },
  { id: '3', title: 'É um Profissional de Saúde?', message: 'Clique aqui para conhecer a nossa área para médicos.', time: '3 dias atrás', read: true, link: '/doctor-portal', type: 'doctor' },
];

export default function HomeScreen() {
  // ✅ Estado para o nome do usuário com valor padrão
  const { session, isAuthenticated } = useAuth();
  const [userName, setUserName] = useState('Visitante'); // ✅ Padrão para não logados
  const [loadingUserName, setLoadingUserName] = useState(false);
  
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  
  // Estado para gerir a lista e o status de 'não lido'
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [hasUnread, setHasUnread] = useState(false);

  // ✅ Carregar nome do usuário da API APENAS se estiver logado
  useEffect(() => {
    const loadUserName = async () => {
      // ✅ Se não estiver autenticado, usar nome padrão
      if (!isAuthenticated || !session.userId) {
        setUserName('Visitante');
        return;
      }

      try {
        setLoadingUserName(true);
        
        if (session.role === 'client' || session.role === 'patient' || session.role === 'admin') {
          const patientData = await getClientProfileByUserId(session.userId);
          // Extrair apenas o primeiro nome
          const firstName = patientData.name.split(' ')[0];
          setUserName(firstName);
        } else if (session.role === 'doctor') {
          const doctorData = await getDoctorByIdDetail(session.userId);
          // Extrair apenas o primeiro nome
          const firstName = doctorData.name.split(' ')[0];
          setUserName(firstName);
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
      } finally {
        setLoadingUserName(false);
      }
    };

    loadUserName();
  }, [isAuthenticated, session.userId, session.role]);

  // Verifica se existem notificações não lidas sempre que a lista muda
  useEffect(() => {
    const unreadExists = notifications.some(n => !n.read);
    setHasUnread(unreadExists);
  }, [notifications]);

  // Função chamada ao clicar no sino
  const handleNotificationsPress = () => {
    setIsNotificationsVisible(true);
    markAllAsRead(); // Marca tudo como lido para a bolinha desaparecer
  };
  
  const markAllAsRead = () => {
    // Simula a marcação de todas as notificações como lidas
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HomeHeader 
        userName={userName} // ✅ Mostra "Visitante" se não logado, nome real se logado
        onNotificationsPress={handleNotificationsPress}
        hasUnreadNotifications={hasUnread}
      />
      <ScrollView>
        <SpecialtyGrid />
        <VideoCard />
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


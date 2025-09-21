import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS } from '../../src/constants/theme';
import { HomeHeader } from '../../src/components/HomeHeader';
import { SpecialtyGrid } from '../../src/components/SpecialtyGrid';
import { VideoCard } from '../../src/components/VideoCard';
import { FeaturedDoctorsList } from '../../src/components/FeaturedDoctorsList';
import { NotificationsPopup, Notification } from '../../src/components/NotificationsPopup';

// Os dados das notificações agora são geridos aqui
const initialNotifications: Notification[] = [
  { id: '1', title: 'Bem-vindo!', message: 'Explore os nossos especialistas e agende a sua primeira consulta.', time: '2 dias atrás', read: false, link: '/searchDoctor', type: 'default' },
  { id: '2', title: 'Complete o seu Cadastro', message: 'Percebemos que o seu perfil não está completo. Toque aqui para finalizar.', time: '3 dias atrás', read: false, link: '/register', type: 'default' },
  { id: '3', title: 'É um Profissional de Saúde?', message: 'Clique aqui para conhecer a nossa área para médicos.', time: '3 dias atrás', read: true, link: '/doctor-portal', type: 'doctor' },
];

export default function HomeScreen() {
  const userName = "Barry"; 
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  
  // Estado para gerir a lista e o status de 'não lido'
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [hasUnread, setHasUnread] = useState(false);

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
        userName={userName} 
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


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.75;

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  requireAuth?: boolean;
  roles?: ('client' | 'doctor')[];
}

interface SidebarProps {
  userType?: 'default' | 'doctor';
}

export function Sidebar({ userType = 'default' }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-SIDEBAR_WIDTH));
  const [rotateAnim] = useState(new Animated.Value(0));
  const router = useRouter();
  const { isAuthenticated, session, logout } = useAuth();

  const THEME_COLORS = userType === 'doctor' 
    ? { primary: '#00A651', background: '#f8f9fa' }
    : { primary: COLORS.primary, background: COLORS.background };

  const menuItems: MenuItem[] = [
    { id: '1', label: 'Início', icon: 'home-outline', route: '/', requireAuth: false },
    { id: '2', label: 'Buscar Médicos', icon: 'search-outline', route: '/searchDoctor', requireAuth: false },
    
    { id: '3', label: 'Meus Dados', icon: 'person-circle-outline', route: '/myDetails', requireAuth: true },
    
    { id: '4', label: 'Meus Agendamentos', icon: 'calendar-outline', route: '/MyScheduling', requireAuth: true, roles: ['client'] },
    
    { id: '5', label: 'Gerenciar Agenda', icon: 'calendar-outline', route: '/myAgenda', requireAuth: true, roles: ['doctor'] },
    { id: '6', label: 'Criar Disponibilidade', icon: 'add-circle-outline', route: '/createAvailability', requireAuth: true, roles: ['doctor'] },
    
    { id: '7', label: 'Médicos Favoritos', icon: 'heart-outline', route: '/favorites', requireAuth: true, roles: ['client'] },
  ];


  // Filtrar menu items baseado em autenticação e role
  const filteredMenuItems = menuItems.filter(item => {
    if (item.requireAuth && !isAuthenticated) return false;
    if (item.roles && !item.roles.includes(session.role as any)) return false;
    return true;
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOpen]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (route: string) => {
    setIsOpen(false);
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const handleLogout = () => {
    setIsOpen(false);
    setTimeout(() => {
      logout();
    }, 300);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <>
      {/* Botão Hambúrguer */}
      <TouchableOpacity 
        style={[styles.hamburgerButton, { backgroundColor: THEME_COLORS.primary }]} 
        onPress={toggleSidebar}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
          {isOpen ? (
            <Ionicons name="close" size={24} color={COLORS.white} />
          ) : (
            <Ionicons name="menu" size={24} color={COLORS.white} />
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Modal Sidebar */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={toggleSidebar}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={toggleSidebar}
        >
          <Animated.View
            style={[
              styles.sidebar,
              { 
                transform: [{ translateX: slideAnim }],
                backgroundColor: COLORS.white 
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Header da Sidebar */}
            <View style={[styles.sidebarHeader, { backgroundColor: THEME_COLORS.primary }]}>
              <Image
                source={require('../../assets/logo_1.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              {isAuthenticated && (
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    Olá, {session.role === 'doctor' ? 'Dr.' : ''} {session?.userId?.split('-')[0] || 'Usuário'}
                  </Text>
                  <Text style={styles.userRole}>
                    {session.role === 'doctor' ? 'Médico' : 'Paciente'}
                  </Text>
                </View>
              )}
            </View>

            {/* Menu Items */}
            <ScrollView 
              style={styles.menuContainer}
              showsVerticalScrollIndicator={false}
            >
              {filteredMenuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => handleNavigation(item.route)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={item.icon} 
                    size={24} 
                    color={THEME_COLORS.primary} 
                  />
                  <Text style={styles.menuItemText}>{item.label}</Text>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={COLORS.textSecondary} 
                  />
                </TouchableOpacity>
              ))}

              {/* Separador */}
              {isAuthenticated && <View style={styles.separator} />}

              {/* Botão de Login/Logout */}
              {!isAuthenticated ? (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigation('/(auth)/login')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="log-in-outline" size={24} color={THEME_COLORS.primary} />
                    <Text style={styles.menuItemText}>Entrar</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleNavigation('/(auth)/register')}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="person-add-outline" size={24} color={THEME_COLORS.primary} />
                    <Text style={styles.menuItemText}>Criar Conta</Text>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.menuItem, styles.logoutItem]}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                  <Text style={[styles.menuItemText, styles.logoutText]}>Sair</Text>
                </TouchableOpacity>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>HealthConnect</Text>
              <Text style={styles.footerVersion}>v1.0.0</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  hamburgerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  sidebarHeader: {
    paddingTop: 60,
    paddingBottom: SIZES.large,
    paddingHorizontal: SIZES.large,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 80,
    marginBottom: SIZES.medium,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.tiny,
  },
  userRole: {
    fontSize: SIZES.small,
    color: COLORS.white,
    opacity: 0.9,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: SIZES.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.large,
    marginHorizontal: SIZES.medium,
    borderRadius: SIZES.radius,
  },
  menuItemText: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginLeft: SIZES.medium,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.medium,
    marginHorizontal: SIZES.large,
  },
  logoutItem: {
    marginTop: SIZES.small,
  },
  logoutText: {
    color: COLORS.error,
  },
  footer: {
    padding: SIZES.large,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  footerVersion: {
    fontSize: SIZES.xSmall,
    color: COLORS.placeholder,
    marginTop: SIZES.tiny,
  },
});
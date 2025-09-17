import { Tabs, useRouter } from 'expo-router';
import { Button, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { HeaderLogo } from '../../src/components/HeaderLogo';
import { COLORS } from '../../src/constants/theme';

export default function AppLayout() {
  const { logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    logout(); 
    router.replace('/login'); 
  };

  return (
    <Tabs
      screenOptions={{
        headerLeft: () => <Button title="Sair" onPress={handleLogout} />,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'android' ? insets.bottom + 8 : 5,
          paddingTop: 8,
          height: Platform.OS === 'android' ? 60 + insets.bottom : 60,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerRight: () => <HeaderLogo />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="searchDoctor"
        options={{
          title: 'Buscar',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerRight: () => <HeaderLogo />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          href: null, 
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
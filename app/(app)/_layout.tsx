import { Tabs } from 'expo-router';
import { Button } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { HeaderLogo } from '../../src/components/HeaderLogo';

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerLeft: () => <Button title="Sair" onPress={logout} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerRight: () => <HeaderLogo />, 
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerRight: () => <HeaderLogo />, 
        }}
      />
    </Tabs>
  );
}
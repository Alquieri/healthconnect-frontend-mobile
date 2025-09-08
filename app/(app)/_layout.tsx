import { Tabs } from 'expo-router';
import { Button } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { HeaderLogo } from '../../src/components/HeaderLogo'; // 👈 1. IMPORTE O COMPONENTE

export default function AppLayout() {
  const { signOut } = useAuth();

  return (
    <Tabs
      screenOptions={{
        // Você pode definir opções padrão para todas as abas aqui
        headerLeft: () => <Button title="Sair" onPress={signOut} />, // Movendo o botão Sair para a esquerda
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
import { Tabs } from 'expo-router';
import { Button } from 'react-native';
import { useAuth } from '../../src/context/AuthContext'; // Ajuste o caminho de importação

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerRight: () => <Button title="Sair" onPress={logout} />,
        }}
      />
    </Tabs>
  );
}
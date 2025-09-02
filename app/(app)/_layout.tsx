import { Tabs } from 'expo-router';
import { Button } from 'react-native';
import { useAuth } from '../../src/context/AuthContext'; // Ajuste o caminho de importação

// Exemplo de layout com abas para a área logada
export default function AppLayout() {
  const { signOut } = useAuth();

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerRight: () => <Button title="Sair" onPress={signOut} />,
        }}
      />
      {/* Você pode adicionar outras telas aqui, como a de perfil */}
      {/* <Tabs.Screen name="profile" options={{ title: 'Perfil' }} /> */}
    </Tabs>
  );
}
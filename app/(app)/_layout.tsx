import { Tabs } from 'expo-router'; // Ou 'Stack' se você estiver usando Stack

export default function AppLayout() {
  return (
    <Tabs> {/* Ou <Stack> */}
      <Tabs.Screen 
        name="index" 
        options={{ 
          // ... outras opções que você já tem ...
          headerShown: false, // 👈 Adicione esta linha!
          title: "Início" // O título ainda pode ser útil para a Tab Bar/Menu
        }} 
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          // headerShown: false, se você quiser um header customizado aqui também
        }}
      />
    </Tabs>
  );
}
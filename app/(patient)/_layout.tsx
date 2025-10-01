// app/(patient)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';

export default function PatientLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.primary, /* ...seus estilos... */ }}>
      {/* Você pode decidir se a home do paciente é a mesma da pública ou outra */}
      <Tabs.Screen
        name="index" // Vai renderizar app/(patient)/index.tsx
        options={{
          title: 'Início',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      {/* Aqui você pode adicionar abas exclusivas do paciente */}
       <Tabs.Screen
        name="MyScheduling" // Agora visível na Tab Bar
        options={{
          title: 'Agenda',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" // Vai renderizar app/(patient)/profile.tsx
        options={{
          title: 'Meu Perfil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
              name="myDetails" 
              options={{
                href: null,
                headerShown: false,
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
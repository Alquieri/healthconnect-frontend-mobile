// app/(doctor)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTheme } from '../../src/constants/theme'; // Supondo que você tenha um tema para médico

export default function DoctorLayout() {
  const insets = useSafeAreaInsets();
  const COLORS = getTheme('doctor'); // Usa as cores do tema de médico

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.primary, /* ...seus estilos... */ }}>
      {/* ESTA É A HOME PERSONALIZADA DO MÉDICO */}
      <Tabs.Screen
        name="index" // Vai renderizar app/(doctor)/index.tsx
        options={{
          title: 'Dashboard', // Nome diferente na aba
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      {/* Abas exclusivas do médico */}
       <Tabs.Screen
        name="myAgenda"
        options={{
          title: 'Minha Agenda',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" // Vai renderizar app/(doctor)/profile.tsx
        options={{
          title: 'Meu Perfil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
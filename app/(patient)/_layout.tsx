import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';

export default function PatientLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e0e0e0',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 5,
        },
      }}
    >
      {/* ✅ ROTA PRINCIPAL - Home do paciente */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      
      {/* ✅ ROTAS PÚBLICAS - acessíveis para pacientes logados */}
      <Tabs.Screen
        name="/(public)/searchDoctor"
        options={{
          title: 'Buscar Médicos',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="/(public)/AboutUs"
        options={{
          title: 'Sobre Nós',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle" size={size} color={color} />
          ),
        }}
      />
      
      {/* ✅ ROTAS ESPECÍFICAS DO PACIENTE */}
      <Tabs.Screen
        name="MyScheduling"
        options={{
          title: 'Agendamentos',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* ✅ Rotas ocultas - acessíveis via navegação programática */}
      <Tabs.Screen name="appointments" options={{ href: null }} />
      <Tabs.Screen name="myDetails" options={{ href: null }} />
    </Tabs>
  );
}
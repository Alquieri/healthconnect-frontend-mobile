import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTheme } from '../../src/constants/theme';

export default function DoctorLayout() {
  const insets = useSafeAreaInsets();
  const COLORS = getTheme('doctor');

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
      {/* ✅ ROTA PRINCIPAL - Dashboard do médico */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* ✅ ROTAS PÚBLICAS - acessíveis para médicos logados */}
      <Tabs.Screen
        name="/(public)/searchDoctor"
        options={{
          title: 'Colegas',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="/(public)/AboutUs"
        options={{
          title: 'Sobre',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* ✅ ROTAS ESPECÍFICAS DO MÉDICO */}
      <Tabs.Screen
        name="/(public)/createAvailability"
        options={{
          title: 'Horários',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Pacientes',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medical-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* ✅ Rotas ocultas - acessíveis via navegação programática */}
      <Tabs.Screen name="myDetails" options={{ href: null }} />
      <Tabs.Screen name="dashboardTemporario" options={{ href: null }} />
    </Tabs>
  );
}
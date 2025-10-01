// app/(doctor)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTheme } from '../../src/constants/theme'; 


export default function DoctorLayout() {
  const insets = useSafeAreaInsets();
  const COLORS = getTheme('doctor');

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: COLORS.primary, }}>
      <Tabs.Screen
        name="index" 
        options={{
          title: 'Dashboard', 
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
       <Tabs.Screen
        name="myAgenda"
        options={{
          title: 'Minha Agenda',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile" 
        options={{
          title: 'Meu Perfil',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
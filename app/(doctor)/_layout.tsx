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
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 5,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="createAvailability"
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
            <Ionicons name="people-outline" size={size} color={color} />
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

      <Tabs.Screen 
        name="schedule" 
        options={{ href: null, headerShown: false }} 
      />
      <Tabs.Screen 
        name="appointments" 
        options={{ href: null, headerShown: false }} 
      />
      <Tabs.Screen 
        name="availability" 
        options={{ href: null, headerShown: false }} 
      />
      <Tabs.Screen 
        name="myDetails" 
        options={{ href: null, headerShown: false }} 
      />
      
      <Tabs.Screen 
        name="dashboardTemporario" 
        options={{ href: null, headerShown: false }} 
      />
    </Tabs>
  );
}
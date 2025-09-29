import 'expo-dev-client';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

function MainLayout() {
  const { status } = useAuth();

  useEffect(() => {
    if (status !== 'pending') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === 'pending') {
    return null;
  }

  return (
    <>
      <StatusBar 
        style="dark" 
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      
      <Stack screenOptions={{ headerShown: false }}>
  {/* 🌐 Grupo Público - Exploração */}
  <Stack.Screen name="(public)" />
  
  {/* 🔓 Grupo Auth - Login/Registro */}
  <Stack.Screen 
    name="(auth)" 
    options={{ 
      presentation: 'modal',
      gestureEnabled: false 
    }} 
  />
  
  {/* 👤 App do Paciente */}
  <Stack.Screen name="(patient)" />
  
  {/* 🩺 App do Médico */}
  <Stack.Screen name="(doctor)" />
</Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <MainLayout />
      <Toast />
    </AuthProvider>
  );
}
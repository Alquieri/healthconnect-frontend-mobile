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

  // Enquanto o status de autenticação é verificado, não mostramos nada.
  // A SplashScreen do próprio dispositivo continua visível.
  if (status === 'pending') {
    return null;
  }

  // A lógica principal foi alterada aqui
  return (
    <>
      <StatusBar 
        style="dark" 
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      
      <Stack screenOptions={{ headerShown: false }}>
        {/* 1. O grupo (app) agora está SEMPRE acessível, tornando-se a entrada principal */}
        <Stack.Screen name="(app)" />
        
        {/* 2. O grupo (auth) também fica disponível para ser navegado quando necessário */}
        {/* Apresentá-lo como 'modal' cria uma experiência de login mais agradável */}
        <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
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
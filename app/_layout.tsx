// app/_layout.tsx - A Versão Correta e Definitiva

import 'expo-dev-client';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SplashScreen, Stack } from 'expo-router';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

function MainLayout() {
  const { status } = useAuth();
  console.log('[MainLayout] Renderizando com status:', status);

  useEffect(() => {
    if (status !== 'pending') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === 'pending') {
    return null;
  }

  return (
    <Stack key={status} screenOptions={{ headerShown: false }}>
      {status === 'authenticated' ? (
        <Stack.Screen name="(app)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
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
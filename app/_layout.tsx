import 'expo-dev-client'; 
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SplashScreen, Stack } from 'expo-router';


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
    console.log('[MainLayout] Status é "pending", retornando null.');

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
    </AuthProvider>
  );
}
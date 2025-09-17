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
    <>
      <StatusBar 
        style="dark" 
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />
      
      <Stack screenOptions={{ headerShown: false }}>
        {status === 'authenticated' ? (
          <Stack.Screen name="(app)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
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
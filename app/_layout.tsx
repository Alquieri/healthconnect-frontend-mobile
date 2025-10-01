// app/_layout.tsx
import 'expo-dev-client';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { status, session } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (status === 'pending') {
      return; // Não faz nada enquanto o status não for definido.
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (status === 'authenticated') {
      const targetGroup = session.role === 'doctor' ? '(doctor)' : '(patient)';
      if (segments[0] !== targetGroup) {
        router.replace(`/${targetGroup}`);
      }
    } else if (status === 'unauthenticated') {
      if (!inAuthGroup && segments[0] !== '(app)') {
        router.replace('/(app)');
      }
    }
  }, [status, session.role, segments, router]);
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(patient)" />
      <Stack.Screen name="(doctor)" />
      <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

function Main() {
    const { status } = useAuth();

    useEffect(() => {
        if (status !== 'pending') {
            SplashScreen.hideAsync();
        }
    }, [status]);

    return <RootLayoutNav />;
}


export default function RootLayout() {
  return (
    <AuthProvider>
      <Main />
      <Toast />
    </AuthProvider>
  );
}
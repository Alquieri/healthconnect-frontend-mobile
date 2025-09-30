// app/_layout.tsx
import 'expo-dev-client';
import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SplashScreen, Stack } from 'expo-router';
import Toast from 'react-native-toast-message';

// Oculta a splash screen nativa
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { status, session } = useAuth();

  useEffect(() => {
    // Mostra o app quando o status de autenticação for decidido
    if (status !== 'pending') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === 'pending') {
    return null; // A splash screen nativa continua visível
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {status === 'authenticated' ? (
        // Usuário LOGADO
        <>
          {session.role === 'doctor' ? (
            // Se for médico, mostra o grupo do médico
            <Stack.Screen name="(doctor)" />
          ) : (
            // Para outros roles (paciente, admin), mostra o grupo do paciente
            <Stack.Screen name="(patient)" />
          )}
        </>
      ) : (
        // Usuário DESLOGADO
        // Mostra o grupo público (app)
        <Stack.Screen name="(app)" />
      )}
      
      {/* O grupo (auth) fica sempre disponível como um modal */}
      <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
      <Toast />
    </AuthProvider>
  );
}
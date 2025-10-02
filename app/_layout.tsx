import 'expo-dev-client';
import React, { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native'; 
import { StatusBar } from 'expo-status-bar';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { status, session } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (status === 'pending') {
      console.log('[RootLayout] ⏳ Aguardando verificação de autenticação...');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    const inPatientGroup = segments[0] === '(patient)';
    const inDoctorGroup = segments[0] === '(doctor)';

    console.log('[RootLayout] 🧭 Status:', status, 'Segments:', segments, 'Role:', session.role);

    if (status === 'authenticated') {
      const targetGroup = session.role === 'doctor' ? '(doctor)' : '(patient)';
      
      if (segments[0] !== targetGroup) {
        console.log(`[RootLayout] 🔄 Redirecionando usuário ${session.role} para ${targetGroup}`);
        router.replace(`/${targetGroup}`);
      }
    } else if (status === 'unauthenticated') {
      if (!inAuthGroup && !inAppGroup) {
        console.log('[RootLayout] 🔄 Redirecionando usuário não autenticado para (app)');
        router.replace('/(app)');
      }
    }
  }, [status, session.role, segments, router]);
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="(app)" 
        options={{
          title: 'Público'
        }}
      />
      
      <Stack.Screen 
        name="(patient)" 
        options={{
          title: 'Área do Paciente'
        }}
      />
      
      <Stack.Screen 
        name="(doctor)" 
        options={{
          title: 'Área do Médico'
        }}
      />
      
      <Stack.Screen 
        name="(auth)" 
        options={{ 
          presentation: 'modal',
          title: 'Autenticação'
        }} 
      />
      
      <Stack.Screen 
        name="(_screens)" 
        options={{ 
          headerShown: false,
          title: 'Telas Compartilhadas'
        }} 
      />
    </Stack>
  );
}

function Main() {
  const { status } = useAuth();

  useEffect(() => {
    if (status !== 'pending') {
      console.log('[RootLayout] ✅ Autenticação verificada, ocultando splash screen');
      SplashScreen.hideAsync();
    }
  }, [status]);

  useEffect(() => {
    const onBackPress = () => {
      console.log('[RootLayout] 📱 Botão voltar pressionado - bloqueado');
      return true; // Bloqueia o comportamento padrão
    };

    if (Platform.OS === 'android') {
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      return () => {
        subscription.remove();
      };
    }
  }, []); 

  return <RootLayoutNav />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar 
        style="dark" 
        backgroundColor="transparent" 
        translucent={true}
      />
      
      <Main />
      
      <Toast />
    </AuthProvider>
  );
}
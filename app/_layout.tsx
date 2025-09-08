import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import { COLORS } from '../src/constants/theme';

const InitialLayout = () => {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Se o contexto de autenticação ainda está carregando, não fazemos nada.
    if (loading) {
      return; // CORREÇÃO: Removido o 'a' extra que causava o erro.
    }

    const inAuthGroup = segments[0] === '(auth)';

    // Se o usuário está logado E está em uma tela de autenticação (ex: login),
    // redirecionamos para a tela principal do app.
    if (token && inAuthGroup) {
      router.replace('/');
    } 
    // Se o usuário NÃO está logado E tenta acessar uma tela protegida,
    // redirecionamos para a tela de login.
    else if (!token && !inAuthGroup) {
      router.replace('/login');
    }
  }, [token, loading, segments]);

  // Enquanto o estado de `loading` do AuthContext for verdadeiro,
  // mostramos uma tela de carregamento para evitar um "flash" de tela.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Este Stack é o navegador raiz. Ele não mostra um cabeçalho próprio,
  // permitindo que os layouts de cada grupo ((app) e (auth)) controlem seus cabeçalhos.
  return <Stack screenOptions={{ headerShown: false }} />;
};

// Componente principal que envolve todo o aplicativo no Provedor de Autenticação e no Toast
export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
      <Toast />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

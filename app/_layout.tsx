import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

const InitialLayout = () => {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Se ainda estamos verificando se existe um token, não faça nada.
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    // Se o usuário está logado E está tentando acessar uma tela do grupo de login,
    // nós o redirecionamos para a tela principal do app.
    if (token && inAuthGroup) {
      router.replace('/');
    } 
    // Se o usuário NÃO está logado E não está em uma tela do grupo de login,
    // nós o redirecionamos para a tela de login.
    else if (!token && !inAuthGroup) {
      router.replace('/login');
    }
  }, [token, loading, segments]); // Adicionado 'segments' ao array de dependências

  // Enquanto o estado de `loading` do AuthContext for verdadeiro,
  // mostramos uma tela de carregamento para evitar um "flash" da tela errada.
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Isso configura um navegador do tipo "Stack", mas sem cabeçalhos visíveis,
  // permitindo que os layouts de cada grupo (app) e (auth) definam seus próprios cabeçalhos.
  return <Stack screenOptions={{ headerShown: false }} />;
};

// Componente principal que envolve tudo no Provedor de Autenticação
export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
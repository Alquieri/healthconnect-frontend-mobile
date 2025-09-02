import { Stack } from 'expo-router';

// Layout simples para as telas de autenticação
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
import { Stack } from 'expo-router';
import { HeaderLogo } from '../../src/components/HeaderLogo';

export default function AuthLayout() {
  return (
    <Stack
  
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerRight: () => <HeaderLogo />, // O logo aparece por padrão
      }}
    >
      <Stack.Screen
        name="register" 
        options={{
          headerRight: () => null, 
        }}
      />

    </Stack>
  );
}
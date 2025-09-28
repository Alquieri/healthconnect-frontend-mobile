import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderLogo } from '../../src/components/HeaderLogo';
import { COLORS } from '../../src/constants/theme';
import { HEADER_CONSTANTS } from '../../src/constants/layout';

export default function AuthLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTitleStyle: {
          color: COLORS.text,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerRight: () => <HeaderLogo />,
          headerStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      
      <Stack.Screen
        name="register" 
        options={{
          headerRight: () => null, 
          headerStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      
      <Stack.Screen
        name="registerDoctor" 
        options={{
          headerShown: true, // ✅ Permite header customizado
          headerTransparent: false, // ✅ Header sólido
          headerRight: () => null, // ✅ Sem logo no cadastro médico
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerTitleStyle: {
            color: COLORS.text,
          },
        }}
      />
    </Stack>
  );
}
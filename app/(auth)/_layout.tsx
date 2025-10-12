import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderLogo } from '../../src/components/HeaderLogo';
import { COLORS } from '../../src/constants/theme';

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
          headerShown: true,
          headerTransparent: false,
          headerRight: () => null,
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
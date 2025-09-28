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
        headerRight: () => <HeaderLogo />,
        // ✅ Header padronizado para auth
        headerStyle: {
          backgroundColor: 'transparent',
          height: HEADER_CONSTANTS.minHeight + insets.top,
        },
        headerRightContainerStyle: {
          paddingRight: HEADER_CONSTANTS.paddingHorizontal,
          paddingTop: HEADER_CONSTANTS.paddingTop,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerRight: () => <HeaderLogo />,
        }}
      />
      <Stack.Screen
        name="register" 
        options={{
          headerRight: () => null, 
        }}
      />
    </Stack>
  );
}
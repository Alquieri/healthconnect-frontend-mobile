import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/theme';

export default function MyDetailsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Configuração do cabeçalho da página */}
      <Stack.Screen
        options={{
          headerTitle: 'Meus Dados',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Ionicons name="chevron-back" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <Text style={styles.title}>Meus Dados</Text>
      <Text style={styles.subtitle}>Aqui você poderá visualizar e editar as suas informações pessoais.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});


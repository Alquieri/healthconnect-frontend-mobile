// app/(auth)/login.tsx

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
// import { useAuth } from '../../src/context/AuthContext'; // Se você for usar a lógica de login aqui

export default function LoginScreen() {
  // const { signIn } = useAuth(); // Se for fazer o login real aqui

  return (
    <View style={styles.container}>
      {/* <Image source={require('../../../assets/logo.png')} style={styles.logo} /> */} {/* Se tiver logo */}
      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.subtitle}>Bem-vindo de volta!</Text>

      <TextInput
        style={styles.input}
        placeholder="Informe seu e-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#889" // Cor para o placeholder
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        placeholderTextColor="#889" // Cor para o placeholder
      />

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={() => console.log('Login pressed')}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>Continuar com Google</Text>

      <TouchableOpacity style={styles.googleButton}>
        {/* <Image source={require('../../../assets/google-icon.png')} style={styles.googleIcon} /> */}
        <Text style={styles.googleButtonText}>Google</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F2F8', // Azul claro acinzentado para o fundo
    alignItems: 'center',
    paddingTop: 80,
    // ... outros estilos que você tiver
  },
  // Se tiver um logo, ajuste aqui
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50', // Azul marinho escuro para o título
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#5B7C99', // Azul médio para o subtítulo
    marginBottom: 40,
  },
  input: {
    width: '80%',
    backgroundColor: '#FFFFFF', // Manter branco
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#A8D0E6', // Azul claro para a borda do input
    fontSize: 16,
    color: '#334D66', // Cor do texto digitado
  },
  forgotPassword: {
    color: '#007BFF', // Azul vibrante para "Esqueci minha senha"
    marginTop: 5,
    marginBottom: 20,
    fontSize: 14,
  },
  loginButton: {
    width: '80%',
    backgroundColor: '#007BFF', // Azul vibrante para o botão principal
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF', // Texto branco
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    color: '#5B7C99', // Azul médio para "Continuar com Google"
    marginTop: 30,
    marginBottom: 15,
  },
  googleButton: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // Manter branco
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A8D0E6', // Azul claro para a borda do botão Google
  },
  googleButtonText: {
    color: '#334D66', // Azul escuro para o texto do Google
    fontSize: 16,
    marginLeft: 10,
  },
  // Se tiver ícone do Google
  googleIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  }
});
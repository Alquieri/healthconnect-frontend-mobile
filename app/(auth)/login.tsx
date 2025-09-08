import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    console.log('Botão "Entrar" clicado! Tentando fazer login com:', { email, password }); // <-- ADICIONE AQUI
    if (loading) return;
      setLoading(true);
    try {
      await login({ email, password });
      router.replace('/(app)');
    } catch (error: any) {
        Alert.alert("Erro no Login", error.message || "Não foi possível entrar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
     <View style={styles.container}>
      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.subtitle}>Bem-vindo de volta!</Text>

      <TextInput
        style={styles.input}
        placeholder="Informe seu e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#889"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#889"
      />

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        <Text style={styles.loginButtonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
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
    backgroundColor: '#E8F2F8',
    alignItems: 'center',
    paddingTop: 80,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#5B7C99',
    marginBottom: 40,
  },
  input: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#A8D0E6',
    fontSize: 16,
    color: '#334D66',
  },
  forgotPassword: {
    color: '#007BFF',
    marginTop: 5,
    marginBottom: 20,
    fontSize: 14,
  },
  loginButton: {
    width: '80%',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    color: '#5B7C99',
    marginTop: 30,
    marginBottom: 15,
  },
  googleButton: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A8D0E6',
  },
  googleButtonText: {
    color: '#334D66',
    fontSize: 16,
    marginLeft: 10,
  },
  googleIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  }
});
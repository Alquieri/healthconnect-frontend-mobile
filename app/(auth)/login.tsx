import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter, Link } from 'expo-router';
import { CustomInput } from '../../src/components/CustomInput';
import { CustomButton } from '../../src/components/CustomButton';
import { COLORS } from '../../src/constants/theme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
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
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>Entrar</Text>
                <Text style={styles.subtitle}>Bem-vindo de volta!</Text>

                <CustomInput
                    placeholder="Informe seu e-mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                <CustomInput
                    placeholder="Senha"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
                </TouchableOpacity>
                
                <CustomButton title={loading ? 'Entrando...' : 'Entrar'} onPress={handleLogin} loading={loading} />

                <Text style={styles.orText}>Continuar com</Text>

                <TouchableOpacity style={styles.googleButton}>
                    <Text style={styles.googleButtonText}>Google</Text>
                </TouchableOpacity>
                
                <View style={styles.registerRedirect}>
                    <Text style={styles.registerRedirectText}>Não tem uma conta? </Text>
                    <Link href="/register" asChild>
                        <TouchableOpacity>
                            <Text style={styles.registerLink}>Cadastre-se</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, 
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 40,
    },
    forgotPasswordContainer: {
        width: '85%',
        marginBottom: 20,
        alignItems: 'flex-end', 
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontSize: 14,
    },
    orText: {
        color: COLORS.textSecondary, 
        marginTop: 30,
        marginBottom: 15,
    },
    googleButton: {
        width: '85%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border, 
    },
    googleButtonText: {
        color: COLORS.text, 
        fontSize: 16,
        fontWeight: '600',
    },
    registerRedirect: {
        flexDirection: 'row',
        marginTop: 40,
    },
    registerRedirectText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    registerLink: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});
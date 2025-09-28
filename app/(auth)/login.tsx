import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter, Link } from 'expo-router';
import { CustomInput } from '../../src/components/CustomInput';
import { CustomButton } from '../../src/components/CustomButton';
import { ResponsiveContainer } from '../../src/components/ResponsiveContainer';
import { COLORS, SIZES } from '../../src/constants/theme';

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
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.content}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Entrar</Text>
                            <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <CustomInput
                                placeholder="Informe seu e-mail"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                autoCorrect={false}
                            />
                            
                            {/* ✅ Input de senha com toggle de visualização */}
                            <CustomInput
                                placeholder="Senha"
                                secureTextEntry={true}
                                showPasswordToggle={true} // ✅ Ativa o toggle de senha
                                value={password}
                                onChangeText={setPassword}
                                autoCapitalize="none"
                            />
                            
                            <View style={styles.forgotPasswordContainer}>
                                <TouchableOpacity>
                                    <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <CustomButton 
                                title={loading ? 'Entrando...' : 'Entrar'} 
                                onPress={handleLogin} 
                                disabled={loading} 
                            />

                            <Text style={styles.orText}>Continuar com</Text>

                            <CustomButton 
                                title="Google" 
                                variant="secondary"
                                onPress={() => {}}
                            />
                        </View>

                        <View style={styles.registerRedirectContainer}>
                            <View style={styles.registerRedirect}>
                                <Text style={styles.registerRedirectText}>Não tem uma conta? </Text>
                                <Link href="/register" asChild>
                                    <TouchableOpacity style={styles.registerLinkButton}>
                                        <Text style={styles.registerLink}>Cadastre-se</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                            
                            {/* ✅ Link médico com cor verde específica */}
                            <View style={styles.doctorRedirect}>
                                <Text style={styles.doctorRedirectText}>É médico? </Text>
                                <Link href="/registerDoctor" asChild>
                                    <TouchableOpacity style={styles.doctorLinkButton}>
                                        <Text style={styles.doctorRegisterLink}>Cadastro Profissional</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: SIZES.large,
        paddingHorizontal: SIZES.containerPadding,
    },
    content: {
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: SIZES.height * 0.8,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: SIZES.xLarge,
        width: '100%',
    },
    title: {
        fontSize: SIZES.xxLarge,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.small,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: SIZES.medium,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    formContainer: {
        alignItems: 'center',
        marginBottom: SIZES.large,
        width: '100%',
    },
    forgotPasswordContainer: {
        width: SIZES.inputWidth,
        alignItems: 'flex-end',
        marginBottom: SIZES.large,
        alignSelf: 'center',
    },
    forgotPasswordText: {
        color: COLORS.primary,
        fontSize: SIZES.small,
        fontWeight: '500',
        textAlign: 'center',
    },
    orText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.font,
        marginVertical: SIZES.large,
        textAlign: 'center',
    },
    registerRedirectContainer: {
        alignItems: 'center',
        paddingTop: SIZES.large,
        width: '100%',
    },
    registerRedirect: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SIZES.small,
    },
    registerRedirectText: {
        fontSize: SIZES.font,
        color: COLORS.textSecondary,
    },
    registerLinkButton: {
        paddingVertical: SIZES.tiny,
        paddingHorizontal: SIZES.tiny,
    },
    registerLink: {
        fontSize: SIZES.font,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    doctorRedirect: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: SIZES.medium,
    },
    doctorRedirectText: {
        fontSize: SIZES.font,
        color: COLORS.textSecondary,
    },
    doctorLinkButton: {
        paddingVertical: SIZES.tiny,
        paddingHorizontal: SIZES.tiny,
    },
    doctorRegisterLink: {
        fontSize: SIZES.font,
        color: '#00A651', // ✅ Verde médico específico
        fontWeight: 'bold',
    },
});
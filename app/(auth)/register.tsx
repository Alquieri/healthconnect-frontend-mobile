import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Platform, KeyboardAvoidingView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import Toast from 'react-native-toast-message'; 
import { registerPatient } from '../../src/api/services/user';
import { CustomInput } from '../../src/components/CustomInput';
import { CustomButton } from '../../src/components/CustomButton';
import { ResponsiveContainer } from '../../src/components/ResponsiveContainer';
import { COLORS, SIZES } from '../../src/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [sex, setSex] = useState<'Male' | 'Female' | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Validações de campos obrigatórios
      if (!name || !email || !password || !cpf || !phone || !date || !sex) {
        Toast.show({ 
          type: 'error',
          text1: 'Campos Incompletos',
          text2: 'Por favor, preencha todos os campos.'
        });
        return;
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Toast.show({ 
          type: 'error',
          text1: 'Email Inválido',
          text2: 'Por favor, insira um email válido.'
        });
        return;
      }

      // Validar senha (mínimo 6 caracteres)
      if (password.length < 6) {
        Toast.show({ 
          type: 'error',
          text1: 'Senha Muito Curta',
          text2: 'A senha deve ter pelo menos 6 caracteres.'
        });
        return;
      }

      // Validar se as senhas coincidem
      if (password !== confirmPassword) {
        Toast.show({ 
          type: 'error',
          text1: 'Erro de Validação',
          text2: 'As senhas não coincidem!'
        });
        return;
      }

      // Validar CPF (formato básico)
      const cpfCleaned = cpf.replace(/\D/g, '');
      if (cpfCleaned.length !== 11) {
        Toast.show({ 
          type: 'error',
          text1: 'CPF Inválido',
          text2: 'O CPF deve ter 11 dígitos.'
        });
        return;
      }

      // Validar telefone (formato básico)
      const phoneCleaned = phone.replace(/\D/g, '');
      if (phoneCleaned.length < 10) {
        Toast.show({ 
          type: 'error',
          text1: 'Telefone Inválido',
          text2: 'Por favor, insira um telefone válido.'
        });
        return;
      }

      // Validar se os termos foram aceitos
      if (!termsAccepted) {
        Toast.show({ 
          type: 'error',
          text1: 'Termos não aceitos',
          text2: 'Você deve aceitar os termos para continuar.'
        });
        return;
      }

      const payload = { 
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneCleaned,
        password,
        cpf: cpfCleaned,
        sex: sex,
        birthDate: date.toISOString().slice(0, 10),
      };

      await registerPatient(payload);
      
      Toast.show({
        type: 'success', 
        text1: 'Cadastro realizado com sucesso!',
        text2: 'Você será redirecionado para o login.',
      });

      setTimeout(() => {
        router.push('/login');
      }, 2500);

    } catch (error: any) {
      console.error('Erro no registro:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro no Cadastro',
        text2: error.message || 'Não foi possível completar o registro.',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // Formatar CPF
  const formatCPF = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    setCpf(formatted);
  };

  // Formatar telefone
  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 11) {
      formatted = cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length >= 10) {
      formatted = cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length >= 6) {
      formatted = cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (cleaned.length >= 2) {
      formatted = cleaned.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    
    setPhone(formatted);
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
          <ResponsiveContainer>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Crie sua conta</Text>
              <Text style={styles.subtitle}>
                Insira seus dados pessoais para realizar o cadastro
              </Text>
            </View>

            <View style={styles.formContainer}>
              <CustomInput 
                placeholder="Nome completo" 
                value={name} 
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />

              <CustomInput 
                placeholder="E-mail" 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none" 
                autoCorrect={false}
              />

              <CustomInput 
                placeholder="Telefone" 
                value={phone} 
                onChangeText={formatPhone} 
                keyboardType="phone-pad"
                maxLength={15}
              />

              <CustomInput 
                placeholder="CPF" 
                value={cpf} 
                onChangeText={formatCPF} 
                keyboardType="numeric"
                maxLength={14}
              />

              {/* ✅ Inputs de senha com toggle de visualização */}
              <CustomInput 
                placeholder="Senha" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry={true}
                showPasswordToggle={true} // ✅ Ativa o toggle de senha
                autoCapitalize="none"
              />

              <CustomInput 
                placeholder="Confirme sua senha" 
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
                secureTextEntry={true}
                showPasswordToggle={true} // ✅ Ativa o toggle de senha
                autoCapitalize="none"
              />

              {/* Campo de sexo */}
              <View style={styles.sexSelectorContainer}>
                <Text style={styles.sectionLabel}>Sexo</Text>
                <View style={styles.sexOptionsRow}>
                  <TouchableOpacity
                    style={[styles.sexOption, sex === 'Male' && styles.selectedSexOption]}
                    onPress={() => setSex('Male')}
                  >
                    <Text style={[styles.sexOptionText, sex === 'Male' && styles.selectedSexOptionText]}>
                      Masculino
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sexOption, sex === 'Female' && styles.selectedSexOption]}
                    onPress={() => setSex('Female')}
                  >
                    <Text style={[styles.sexOptionText, sex === 'Female' && styles.selectedSexOptionText]}>
                      Feminino
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.dateContainer}>
                <Text style={styles.sectionLabel}>Data de Nascimento</Text>
                <TouchableOpacity 
                  onPress={toggleDatePicker} 
                  style={styles.dateInput}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[styles.dateInputText, !date && styles.placeholderText]}
                  >
                    {date ? date.toLocaleDateString('pt-BR') : 'Selecione sua data de nascimento'}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker 
                  mode="date" 
                  display="spinner" 
                  value={date || new Date()} 
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                />
              )}

              <View style={styles.checkboxContainer}>
                <Checkbox
                  style={styles.checkbox}
                  value={termsAccepted}
                  onValueChange={setTermsAccepted}
                  color={termsAccepted ? COLORS.primary : undefined}
                />
                <Text style={styles.checkboxLabel}>
                  Eu li e autorizo a coleta e o uso dos meus dados conforme a Política de Privacidade.
                </Text>
              </View>

              <CustomButton
                title={loading ? 'Cadastrando...' : 'Cadastrar'}
                onPress={handleRegister}
                disabled={!termsAccepted || loading}
              />
            </View>

            <View style={styles.loginRedirectContainer}>
              <View style={styles.loginRedirect}>
                <Text style={styles.loginRedirectText}>Já tem uma conta? </Text>
                <Link href="/login" asChild>
                  <TouchableOpacity style={styles.loginLinkButton}>
                    <Text style={styles.loginLink}>Entre aqui</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </ResponsiveContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: COLORS.background 
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: SIZES.large,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xLarge,
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
    lineHeight: SIZES.large,
  },
  formContainer: {
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  sectionLabel: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.small,
    alignSelf: 'flex-start',
  },
  sexSelectorContainer: {
    width: SIZES.inputWidth,
    marginBottom: SIZES.medium,
  },
  sexOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sexOption: { 
    flex: 1, 
    paddingVertical: SIZES.medium, 
    paddingHorizontal: SIZES.small,
    borderRadius: SIZES.radius, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    alignItems: 'center',
    marginHorizontal: SIZES.tiny,
    backgroundColor: COLORS.white,
  },
  selectedSexOption: { 
    borderColor: COLORS.primary, 
    backgroundColor: COLORS.primary + '10',
  },
  sexOptionText: { 
    fontSize: SIZES.font, 
    color: COLORS.text 
  },
  selectedSexOptionText: { 
    color: COLORS.primary, 
    fontWeight: '600',
  },
  dateContainer: {
    width: SIZES.inputWidth,
    marginBottom: SIZES.medium,
  },
  dateInput: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: SIZES.font,
    color: COLORS.text 
  },
  placeholderText: {
    color: COLORS.placeholder,
  },
  checkboxContainer: {
    flexDirection: 'row',
    width: SIZES.inputWidth,
    marginVertical: SIZES.large,
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: SIZES.small,
    marginTop: SIZES.tiny,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    lineHeight: SIZES.medium,
  },
  loginRedirectContainer: {
    alignItems: 'center',
    paddingTop: SIZES.large,
  },
  loginRedirect: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginRedirectText: { 
    fontSize: SIZES.font, 
    color: COLORS.textSecondary 
  },
  loginLinkButton: {
    paddingVertical: SIZES.tiny,
    paddingHorizontal: SIZES.tiny,
  },
  loginLink: { 
    fontSize: SIZES.font, 
    color: COLORS.primary, 
    fontWeight: 'bold' 
  },
});
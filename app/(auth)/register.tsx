import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import Toast from 'react-native-toast-message'; 
import { registerPatient } from '../../src/api/services/user';
import { CustomInput } from '../../src/components/CustomInput';
import { CustomButton } from '../../src/components/CustomButton';
import { COLORS } from '../../src/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpf, setCpf] = useState('');
  // const [cep, setCep] = useState(''); // <-- REMOVIDO
  const [sex, setSex] = useState<'Masculino' | 'Feminino' | 'Outros' | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Verificar se já está carregando
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Validações de campos obrigatórios
      if (!name || !email || !password || !cpf || !phone || !date) {
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
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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

          <CustomInput 
            placeholder="Senha" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            autoCapitalize="none"
          />

          <CustomInput 
            placeholder="Confirme sua senha" 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
            secureTextEntry 
            autoCapitalize="none"
          />

          {/* Futuro campo de sexo - comentado para uso futuro */}
          {/* <View style={styles.sexSelectorContainer}>
            <TouchableOpacity
              style={[styles.sexOption, sex === 'Masculino' && styles.selectedSexOption]}
              onPress={() => setSex('Masculino')}
            >
              <Text style={[styles.sexOptionText, sex === 'Masculino' && styles.selectedSexOptionText]}>Masculino</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sexOption, sex === 'Feminino' && styles.selectedSexOption]}
              onPress={() => setSex('Feminino')}
            >
              <Text style={[styles.sexOptionText, sex === 'Feminino' && styles.selectedSexOptionText]}>Feminino</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sexOption, sex === 'Outros' && styles.selectedSexOption]}
              onPress={() => setSex('Outros')}
            >
              <Text style={[styles.sexOptionText, sex === 'Outros' && styles.selectedSexOptionText]}>Outro</Text>
            </TouchableOpacity>
          </View> */}

          <TouchableOpacity 
            onPress={toggleDatePicker} 
            style={styles.dateInput}
            activeOpacity={0.7}
          >
            <Text 
              style={[styles.dateInputText, !date && styles.placeholderText]}
            >
              {date ? date.toLocaleDateString('pt-BR') : 'Data de nascimento'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker 
              mode="date" 
              display="spinner" 
              value={date || new Date()} 
              onChange={onChangeDate}
              maximumDate={new Date()} // Não permitir datas futuras
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

        {/* Container separado para o link de login com padding extra */}
        <View style={styles.loginRedirectContainer}>
          <View style={styles.loginRedirect}>
            <Text style={styles.loginRedirectText}>Já tem uma conta? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity 
                style={styles.loginLinkButton}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>Entre aqui</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: COLORS.background 
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40, // Padding extra para evitar sobreposição com botões do sistema
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 30,
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: COLORS.text, 
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: { 
    fontSize: 16, 
    color: COLORS.textSecondary, 
    textAlign: 'center', 
    lineHeight: 22,
  },
  formContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dateInput: {
    width: '85%', 
    backgroundColor: COLORS.white, 
    paddingHorizontal: 15, 
    paddingVertical: 15, 
    borderRadius: 8,
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    justifyContent: 'center',
  },
  dateInputText: { 
    fontSize: 16,
    color: COLORS.text 
  },
  placeholderText: {
    color: COLORS.placeholder,
  },
  // Estilos para futuro uso (sexo)
  sexSelectorContainer: {
    width: '85%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  sexOption: { 
    flex: 1, 
    padding: 15, 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 8, 
    marginHorizontal: 4 
  },
  selectedSexOption: { 
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary 
  },
  sexOptionText: { 
    fontSize: 16, 
    color: COLORS.text 
  },
  selectedSexOptionText: { 
    color: COLORS.white, 
    fontWeight: 'bold' 
  },
  checkboxContainer: {
    flexDirection: 'row',
    width: '85%',
    marginVertical: 20,
    alignItems: 'flex-start', // Mudado para flex-start para melhor alinhamento
    paddingHorizontal: 5,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2, // Pequeno ajuste para alinhar com o texto
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  loginRedirectContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30, // Padding generoso para evitar sobreposição
    paddingBottom: 50, // Padding extra na parte inferior
    alignItems: 'center',
  },
  loginRedirect: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginRedirectText: { 
    fontSize: 14, 
    color: COLORS.textSecondary 
  },
  loginLinkButton: {
    paddingVertical: 8, // Área de toque maior
    paddingHorizontal: 4,
  },
  loginLink: { 
    fontSize: 14, 
    color: COLORS.primary, 
    fontWeight: 'bold' 
  },
});
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';

import { CustomInput } from '../../src/components/CustomInput';
import { CustomButton } from '../../src/components/CustomButton';
import { COLORS } from '../../src/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  
  // Ordem dos estados correta
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [cep, setCep] = useState('');
  const [sex, setSex] = useState<'Masculino' | 'Feminino' | 'Outros' | null>(null);
  
  // Lógica da data corrigida para começar com placeholder
  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [termsAccepted, setTermsAccepted] = useState(false); 

  const handleRegister = () => { /* ... Sua lógica de cadastro aqui ... */ };

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Mantém o calendário visível no iOS até o usuário fechar
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>
          Insira seus dados pessoais para realizar o cadastro
        </Text>

        {/* Ordem dos inputs correta */}
        <CustomInput placeholder="Nome completo" value={name} onChangeText={setName} />
        <CustomInput placeholder="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <CustomInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        <CustomInput placeholder="Confirme sua senha" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        <CustomInput placeholder="CPF" value={cpf} onChangeText={setCpf} keyboardType="numeric" />
        <CustomInput placeholder="CEP" value={cep} onChangeText={setCep} keyboardType="numeric" />
        
        {/* Seletor de sexo com a opção "Outros" */}
        <View style={styles.sexSelectorContainer}>
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
        </View>

        <TouchableOpacity onPress={toggleDatePicker} style={styles.dateInput}>
          <Text style={[styles.dateInputText, !date && styles.placeholderText]}>
            {date ? date.toLocaleDateString('pt-BR') : 'Data de nascimento'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker 
            mode="date" 
            display="spinner" 
            value={date || new Date()} 
            onChange={onChangeDate} 
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
          title="Cadastrar"
          onPress={handleRegister}
          disabled={!termsAccepted}
          
        />

        <View style={styles.loginRedirect}>
          <Text style={styles.loginRedirectText}>Já tem uma conta? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Entre aqui</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginHorizontal: 30, marginBottom: 40 },
  dateInput: {
    width: '85%', backgroundColor: COLORS.white, paddingHorizontal: 15, paddingVertical: 15, borderRadius: 8,
    marginBottom: 15, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center',
  },
  dateInputText: { fontSize: 16, color: COLORS.text },
  placeholderText: {
    color: COLORS.placeholder,
  },
  sexSelectorContainer: { width: '85%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  sexOption: { flex: 1, padding: 15, alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, marginHorizontal: 4 },
  selectedSexOption: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sexOptionText: { fontSize: 16, color: COLORS.text },
  selectedSexOptionText: { color: COLORS.white, fontWeight: 'bold' },
  checkboxContainer: {
    flexDirection: 'row',
    width: '85%',
    marginVertical: 20,
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginRedirect: { flexDirection: 'row', marginTop: 30 },
  loginRedirectText: { fontSize: 14, color: COLORS.textSecondary },
  loginLink: { fontSize: 14, color: COLORS.primary, fontWeight: 'bold' },
});
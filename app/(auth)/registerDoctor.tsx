import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform, 
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import Toast from 'react-native-toast-message'; 
import { registerDoctor } from '../../src/api/services/user';
import { getAllSpecialities } from '../../src/api/services/speciality';
import { CustomInput } from '../../src/components/CustomInput';
import { CustomButton } from '../../src/components/CustomButton';
import { CustomDropdown, DropdownItem } from '../../src/components/CustomDropdown';
import { ResponsiveContainer } from '../../src/components/ResponsiveContainer';
import { getTheme, SIZES, createResponsiveStyle } from '../../src/constants/theme';
import { SpecialityDto } from '../../src/api/models/speciality';
import { UserDto } from '../../src/api/models/user'; 

export default function RegisterDoctorScreen() {
  const router = useRouter();
  
  // ✅ Estados principais
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

  // ✅ Estados profissionais
  const [rqe, setRqe] = useState('');
  const [crm, setCrm] = useState('');
  const [crmState, setCrmState] = useState<string | null>(null);
  const [selectedSpeciality, setSelectedSpeciality] = useState<string | null>(null);
  const [biography, setBiography] = useState('');
  
  // ✅ Estados para especialidades
  const [specialities, setSpecialities] = useState<SpecialityDto.SpecialityResponse[]>([]);
  const [specialitiesLoading, setSpecialitiesLoading] = useState(false);

  // ✅ Tema do médico
  const COLORS = getTheme('doctor');

  // ✅ Opções de estados para o dropdown (memoized)
  const stateOptions: DropdownItem[] = useMemo(() => [
    { label: 'AC - Acre', value: 'AC' },
    { label: 'AL - Alagoas', value: 'AL' },
    { label: 'AP - Amapá', value: 'AP' },
    { label: 'AM - Amazonas', value: 'AM' },
    { label: 'BA - Bahia', value: 'BA' },
    { label: 'CE - Ceará', value: 'CE' },
    { label: 'DF - Distrito Federal', value: 'DF' },
    { label: 'ES - Espírito Santo', value: 'ES' },
    { label: 'GO - Goiás', value: 'GO' },
    { label: 'MA - Maranhão', value: 'MA' },
    { label: 'MT - Mato Grosso', value: 'MT' },
    { label: 'MS - Mato Grosso do Sul', value: 'MS' },
    { label: 'MG - Minas Gerais', value: 'MG' },
    { label: 'PA - Pará', value: 'PA' },
    { label: 'PB - Paraíba', value: 'PB' },
    { label: 'PR - Paraná', value: 'PR' },
    { label: 'PE - Pernambuco', value: 'PE' },
    { label: 'PI - Piauí', value: 'PI' },
    { label: 'RJ - Rio de Janeiro', value: 'RJ' },
    { label: 'RN - Rio Grande do Norte', value: 'RN' },
    { label: 'RS - Rio Grande do Sul', value: 'RS' },
    { label: 'RO - Rondônia', value: 'RO' },
    { label: 'RR - Roraima', value: 'RR' },
    { label: 'SC - Santa Catarina', value: 'SC' },
    { label: 'SP - São Paulo', value: 'SP' },
    { label: 'SE - Sergipe', value: 'SE' },
    { label: 'TO - Tocantins', value: 'TO' },
  ], []);

  // ✅ Carregar especialidades ao montar o componente
  useEffect(() => {
    loadSpecialities();
  }, []);

  const loadSpecialities = useCallback(async () => {
    try {
      setSpecialitiesLoading(true);
      const data = await getAllSpecialities();
      setSpecialities(data);
      console.log('[RegisterDoctor] ✅ Especialidades carregadas:', data.length);
    } catch (error) {
      console.error('[RegisterDoctor] ❌ Erro ao carregar especialidades:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar especialidades',
        text2: 'Não foi possível carregar a lista de especialidades.'
      });
    } finally {
      setSpecialitiesLoading(false);
    }
  }, []);

  // ✅ Preparar opções de especialidades para o dropdown (memoized)
  const specialityOptions: DropdownItem[] = useMemo(() => 
    specialities.map(speciality => ({
      label: speciality.name,
      value: speciality.id
    })), [specialities]
  );

  // ✅ Função de limpeza de campos numéricos (memoized)
  const cleanNumericField = useCallback((value: string, maxLength: number): string => {
    const cleaned = value.replace(/[^\d]/g, '');
    const limited = cleaned.substring(0, maxLength);
    return limited.trim();
  }, []);

  // ✅ Formatadores com limite rígido (memoized)
  const formatRQE = useCallback((text: string) => {
    const cleaned = cleanNumericField(text, 8);
    setRqe(cleaned);
  }, [cleanNumericField]);

  const formatCRM = useCallback((text: string) => {
    const cleaned = cleanNumericField(text, 8);
    setCrm(cleaned);
  }, [cleanNumericField]);

  // ✅ Formatadores existentes (memoized)
  const formatCPF = useCallback((text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    setCpf(formatted);
  }, []);

  const formatPhone = useCallback((text: string) => {
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
  }, []);

  const toggleDatePicker = useCallback(() => setShowDatePicker(!showDatePicker), [showDatePicker]);

  const onChangeDate = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) {
      setDate(selectedDate);
    }
  }, []);

  // ✅ Função de validação centralizada no componente (memoized)
  const validateForm = useCallback(() => {
    // Validação de campos obrigatórios
    if (!name?.trim() || !email?.trim() || !password || !cpf || !phone || !date || !sex || !rqe || !crm || !crmState || !selectedSpeciality) {
      Toast.show({ 
        type: 'error',
        text1: 'Campos Incompletos',
        text2: 'Por favor, preencha todos os campos obrigatórios.'
      });
      return false;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Toast.show({ 
        type: 'error',
        text1: 'Email Inválido',
        text2: 'Por favor, insira um email válido.'
      });
      return false;
    }

    // Validação de senha
    if (password.length < 6) {
      Toast.show({ 
        type: 'error',
        text1: 'Senha Muito Curta',
        text2: 'A senha deve ter pelo menos 6 caracteres.'
      });
      return false;
    }

    if (password !== confirmPassword) {
      Toast.show({ 
        type: 'error',
        text1: 'Erro de Validação',
        text2: 'As senhas não coincidem!'
      });
      return false;
    }

    // Validação de CPF
    const cpfCleaned = cpf.replace(/\D/g, '');
    if (cpfCleaned.length !== 11) {
      Toast.show({ 
        type: 'error',
        text1: 'CPF Inválido',
        text2: 'O CPF deve ter 11 dígitos.'
      });
      return false;
    }

    // Validação de telefone
    const phoneCleaned = phone.replace(/\D/g, '');
    if (phoneCleaned.length < 10) {
      Toast.show({ 
        type: 'error',
        text1: 'Telefone Inválido',
        text2: 'Por favor, insira um telefone válido.'
      });
      return false;
    }

    // Validação de RQE
    const cleanedRqe = rqe.replace(/[^\d]/g, '').trim();
    if (cleanedRqe.length < 3 || cleanedRqe.length > 8) {
      Toast.show({ 
        type: 'error',
        text1: 'RQE Inválido',
        text2: `O RQE deve ter entre 3 e 8 dígitos. Atual: ${cleanedRqe.length}`
      });
      return false;
    }

    // Validação de CRM
    const cleanedCrm = crm.replace(/[^\d]/g, '').trim();
    if (cleanedCrm.length < 4 || cleanedCrm.length > 8) {
      Toast.show({ 
        type: 'error',
        text1: 'CRM Inválido',
        text2: `O CRM deve ter entre 4 e 8 dígitos. Atual: ${cleanedCrm.length}`
      });
      return false;
    }

    // Validação de estado do CRM
    if (!crmState || crmState.length < 2) {
      Toast.show({ 
        type: 'error',
        text1: 'Estado do CRM obrigatório',
        text2: 'Por favor, selecione o estado do seu CRM.'
      });
      return false;
    }

    // Validação de especialidade
    const selectedSpecialityName = specialities.find(s => s.id === selectedSpeciality)?.name || '';
    if (!selectedSpecialityName) {
      Toast.show({ 
        type: 'error',
        text1: 'Especialidade Inválida',
        text2: 'Por favor, selecione uma especialidade válida.'
      });
      return false;
    }

    // Validação de termos
    if (!termsAccepted) {
      Toast.show({ 
        type: 'error',
        text1: 'Termos não aceitos',
        text2: 'Você deve aceitar os termos para continuar.'
      });
      return false;
    }

    return true;
  }, [name, email, password, confirmPassword, cpf, phone, date, sex, rqe, crm, crmState, selectedSpeciality, termsAccepted, specialities]);

  // ✅ Função de registro usando UserDto.RegisterDoctor (memoized)
  const handleRegister = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Validar formulário
      if (!validateForm()) {
        return;
      }

      // Preparar dados limpos
      const cpfCleaned = cpf.replace(/\D/g, '');
      const phoneCleaned = phone.replace(/\D/g, '');
      const cleanedRqe = rqe.replace(/[^\d]/g, '').trim();
      const cleanedCrm = crm.replace(/[^\d]/g, '').trim();
      const selectedSpecialityName = specialities.find(s => s.id === selectedSpeciality)?.name || '';

      // ✅ Payload usando UserDto.RegisterDoctor
      const payload: UserDto.RegisterDoctor = { 
        // Dados pessoais
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneCleaned,
        password: password,
        cpf: cpfCleaned,
        sex: sex!,
        birthDate: date!.toISOString().slice(0, 10),
        // Dados profissionais
        rqe: cleanedRqe,
        crm: cleanedCrm,
        crmState: crmState!,
        speciality: selectedSpecialityName,
        biography: biography.trim() || `Médico especialista em ${selectedSpecialityName}.`
      };

      console.log('[RegisterDoctor] ✅ Enviando dados:', payload);
      
      // ✅ Usar registerDoctor do service user
      await registerDoctor(payload);
      
      Toast.show({
        type: 'success', 
        text1: 'Cadastro realizado com sucesso!',
        text2: 'Você será redirecionado para o login.',
      });

      setTimeout(() => {
        router.push('/login');
      }, 2500);

    } catch (error: any) {
      console.error('[RegisterDoctor] ❌ Erro no cadastro:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Erro no Cadastro',
        text2: error.message || 'Não foi possível completar o registro.',
      });
    } finally {
      setLoading(false);
    }
  }, [loading, validateForm, cpf, phone, rqe, crm, specialities, selectedSpeciality, name, email, password, sex, date, crmState, biography, router]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Cadastro Médico',
          headerTitleStyle: { color: COLORS.text },
          headerStyle: { backgroundColor: COLORS.white },
        }}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <ResponsiveContainer>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Cadastro Profissional</Text>
              <Text style={styles.subtitle}>
                Registre-se como médico e ofereça seus serviços especializados
              </Text>
            </View>
          </ResponsiveContainer>

          {/* Dados Pessoais */}
          <ResponsiveContainer>
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="person-outline" size={18} color={COLORS.white} />
                </View>
                <Text style={styles.sectionTitle}>Dados Pessoais</Text>
              </View>
            </View>
          </ResponsiveContainer>

          <ResponsiveContainer>
            <CustomInput 
              placeholder="Nome completo" 
              value={name} 
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </ResponsiveContainer>

          <ResponsiveContainer>
            <CustomInput 
              placeholder="E-mail profissional" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none" 
              autoCorrect={false}
            />
          </ResponsiveContainer>

          <ResponsiveContainer>
            <CustomInput 
              placeholder="Telefone profissional" 
              value={phone} 
              onChangeText={formatPhone} 
              keyboardType="phone-pad"
              maxLength={15}
            />
          </ResponsiveContainer>

          <ResponsiveContainer>
            <CustomInput 
              placeholder="CPF" 
              value={cpf} 
              onChangeText={formatCPF} 
              keyboardType="numeric"
              maxLength={14}
            />
          </ResponsiveContainer>

          <ResponsiveContainer>
            <CustomInput 
              placeholder="Senha" 
              value={password} 
              onChangeText={setPassword} 
              secureTextEntry={true}
              showPasswordToggle={true}
              autoCapitalize="none"
            />
          </ResponsiveContainer>

          <ResponsiveContainer>
            <CustomInput 
              placeholder="Confirme sua senha" 
              value={confirmPassword} 
              onChangeText={setConfirmPassword} 
              secureTextEntry={true}
              showPasswordToggle={true}
              autoCapitalize="none"
            />
          </ResponsiveContainer>

          {/* Sexo */}
          <ResponsiveContainer>
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
          </ResponsiveContainer>

          {/* Data de Nascimento */}
          <ResponsiveContainer>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Data de Nascimento</Text>
              <TouchableOpacity style={styles.dateInput} onPress={toggleDatePicker}>
                <Text style={[styles.dateInputText, !date && styles.placeholderText]}>
                  {date ? date.toLocaleDateString('pt-BR') : 'Selecione sua data de nascimento'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker 
                  mode="date" 
                  display="spinner" 
                  value={date || new Date()} 
                  onChange={onChangeDate}
                  maximumDate={new Date()}
                />
              )}
            </View>
          </ResponsiveContainer>

          {/* Dados Profissionais */}
          <ResponsiveContainer>
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="medical-outline" size={18} color={COLORS.white} />
                </View>
                <Text style={styles.sectionTitle}>Dados Profissionais</Text>
              </View>
            </View>
          </ResponsiveContainer>

          <ResponsiveContainer>
            <CustomInput 
              placeholder="RQE (máx. 8 dígitos) - Registro de Qualificação de Especialista" 
              value={rqe} 
              onChangeText={formatRQE} 
              keyboardType="number-pad"
              maxLength={8}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </ResponsiveContainer>

          <ResponsiveContainer>
            <CustomInput 
              placeholder="CRM (máx. 8 dígitos) - Conselho Regional de Medicina" 
              value={crm} 
              onChangeText={formatCRM} 
              keyboardType="number-pad"
              maxLength={8}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </ResponsiveContainer>

          {/* Estado do CRM */}
          <ResponsiveContainer>
            <CustomDropdown
              label="Estado do CRM"
              placeholder="Selecione o estado do seu CRM"
              items={stateOptions}
              value={crmState}
              onSelect={setCrmState}
              required
              userType="doctor"
              searchable
              maxHeight={200}
            />
          </ResponsiveContainer>

          {/* Especialidade */}
          <ResponsiveContainer>
            {specialitiesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Carregando especialidades...</Text>
              </View>
            ) : (
              <CustomDropdown
                label="Especialidade Médica"
                placeholder="Selecione sua especialidade"
                items={specialityOptions}
                value={selectedSpeciality}
                onSelect={setSelectedSpeciality}
                required
                userType="doctor"
                searchable
                maxHeight={250}
              />
            )}
          </ResponsiveContainer>

          {/* Biografia */}
          <ResponsiveContainer>
            <CustomInput 
              placeholder="Biografia profissional (opcional)" 
              value={biography} 
              onChangeText={setBiography} 
              multiline
              numberOfLines={4}
              style={{ textAlignVertical: 'top', height: 100 }}
            />
          </ResponsiveContainer>

          {/* Termos */}
          <ResponsiveContainer>
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
          </ResponsiveContainer>

          {/* Botão Cadastrar */}
          <ResponsiveContainer>
            <CustomButton
              title={loading ? 'Cadastrando...' : 'Cadastrar como Médico'}
              onPress={handleRegister}
              disabled={loading}
              userType="doctor"
            />
          </ResponsiveContainer>

          {/* Link para Login */}
          <ResponsiveContainer>
            <View style={styles.loginRedirectContainer}>
              <View style={styles.loginRedirect}>
                <Text style={styles.loginRedirectText}>Já possui conta? </Text>
                <Link href="/login" asChild>
                  <TouchableOpacity style={styles.loginLinkButton}>
                    <Text style={styles.loginLink}>Entrar</Text>
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
    backgroundColor: '#f8f9fa',
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
    color: '#00A651', 
    marginBottom: SIZES.small,
    textAlign: 'center',
  },
  subtitle: { 
    fontSize: SIZES.medium, 
    color: '#666666', 
    textAlign: 'center', 
    lineHeight: SIZES.large,
  },

  // Seções
  sectionContainer: {
    marginBottom: SIZES.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00A651',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.small,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: '#333333',
  },
  sectionLabel: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: '#333333',
    marginBottom: SIZES.small,
    alignSelf: 'flex-start',
  },

  // Campos de entrada
  inputContainer: {
    marginBottom: SIZES.medium,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: '#333333',
    marginBottom: SIZES.small,
    alignSelf: 'flex-start',
    width: SIZES.inputWidth,
  },
  
  // Sexo
  sexSelectorContainer: {
    width: SIZES.inputWidth,
    marginBottom: SIZES.medium,
    alignSelf: 'center',
  },
  sexOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sexOption: { 
    flex: 1, 
    paddingVertical: SIZES.medium, 
    paddingHorizontal: SIZES.small,
    marginHorizontal: SIZES.tiny,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  selectedSexOption: { 
    backgroundColor: '#00A651', 
    borderColor: '#00A651' 
  },
  sexOptionText: { 
    fontSize: SIZES.font, 
    color: '#666666' 
  },
  selectedSexOptionText: { 
    color: '#ffffff', 
    fontWeight: 'bold' 
  },

  // Data
  dateInput: {
    width: SIZES.inputWidth,
    backgroundColor: '#ffffff',
    paddingHorizontal: SIZES.padding,
    paddingVertical: createResponsiveStyle(14),
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateInputText: {
    fontSize: SIZES.font,
    color: '#333333',
  },
  placeholderText: {
    color: '#999999',
  },

  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.medium,
    backgroundColor: '#ffffff',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: SIZES.inputWidth,
    alignSelf: 'center',
  },
  loadingText: {
    marginLeft: SIZES.small,
    color: '#666666',
    fontSize: SIZES.small,
  },

  // Checkbox
  checkboxContainer: {
    flexDirection: 'row',
    width: SIZES.inputWidth,
    marginVertical: SIZES.large,
    alignItems: 'flex-start',
    alignSelf: 'center',
  },
  checkbox: {
    marginRight: SIZES.small,
    marginTop: SIZES.tiny,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: SIZES.small,
    color: '#666666',
    lineHeight: SIZES.medium,
  },

  // Login redirect
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
    color: '#666666' 
  },
  loginLinkButton: {
    paddingVertical: SIZES.tiny,
    paddingHorizontal: SIZES.tiny,
  },
  loginLink: { 
    fontSize: SIZES.font, 
    color: '#00A651', 
    fontWeight: 'bold' 
  },
});
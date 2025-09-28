import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  Platform, 
  KeyboardAvoidingView,
  ActivityIndicator 
} from 'react-native';
import { Link, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message'; 
import { registerDoctor } from '../../src/api/services/doctor';
import { getAllSpecialities } from '../../src/api/services/speciality';
import { CustomInput } from '../../src/components/CustomInput';
import { CustomButton } from '../../src/components/CustomButton';
import { ResponsiveContainer } from '../../src/components/ResponsiveContainer';
import { getTheme, SIZES, createResponsiveStyle } from '../../src/constants/theme';
import { SpecialityDto } from '../../src/api/models/speciality';

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
  const [crmState, setCrmState] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState('');
  const [biography, setBiography] = useState('');
  
  // ✅ Estados para especialidades
  const [specialities, setSpecialities] = useState<SpecialityDto.SpecialityResponse[]>([]);
  const [specialitiesLoading, setSpecialitiesLoading] = useState(false);

  // ✅ Carregar especialidades ao montar o componente
  useEffect(() => {
    loadSpecialities();
  }, []);

  const loadSpecialities = async () => {
    try {
      setSpecialitiesLoading(true);
      const data = await getAllSpecialities();
      setSpecialities(data);
      console.log('🩺 [RegisterDoctor] ✅ Especialidades carregadas:', data.length);
    } catch (error) {
      console.error('🩺 [RegisterDoctor] ❌ Erro ao carregar especialidades:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar especialidades',
        text2: 'Não foi possível carregar a lista de especialidades.'
      });
    } finally {
      setSpecialitiesLoading(false);
    }
  };

  // ✅ Função de limpeza de campos numéricos
  const cleanNumericField = (value: string, maxLength: number): string => {
    // Remove TODOS os caracteres não numéricos
    const cleaned = value.replace(/[^\d]/g, '');
    // Limita ao tamanho máximo
    const limited = cleaned.substring(0, maxLength);
    // Remove qualquer espaço ou caractere especial residual
    const final = limited.trim();
    
    console.log('🧹 [cleanNumericField] Input:', `"${value}"`, 'Output:', `"${final}"`, 'Length:', final.length, 'MaxLength:', maxLength);
    
    return final;
  };

  // ✅ Formatadores com limite rígido
  const formatRQE = (text: string) => {
    const cleaned = cleanNumericField(text, 8); // ✅ Ajustar para 8 máximo
    console.log('📝 [formatRQE] Resultado:', `"${cleaned}"`, 'Length:', cleaned.length);
    setRqe(cleaned);
  };

  const formatCRM = (text: string) => {
    const cleaned = cleanNumericField(text, 8); // ✅ Ajustar para um limite mais conservador
    console.log('📝 [formatCRM] Resultado:', `"${cleaned}"`, 'Length:', cleaned.length);
    setCrm(cleaned);
  };

  // ✅ Formatadores existentes
  const formatCPF = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    setCpf(formatted);
  };

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

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // ✅ Função principal de registro
  const handleRegister = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // ✅ Validações de campos obrigatórios
      if (!name || !email || !password || !cpf || !phone || !date || !sex || !rqe || !crm || !crmState || !selectedSpeciality) {
        const missingFields = {
          name: !!name,
          email: !!email,
          password: !!password,
          cpf: !!cpf,
          phone: !!phone,
          date: !!date,
          sex: !!sex,
          rqe: !!rqe,
          crm: !!crm,
          crmState: !!crmState,
          selectedSpeciality: !!selectedSpeciality
        };
        
        console.log('🩺 [RegisterDoctor] ❌ Campos obrigatórios faltando:', missingFields);
        
        Toast.show({ 
          type: 'error',
          text1: 'Campos Incompletos',
          text2: 'Por favor, preencha todos os campos obrigatórios.'
        });
        return;
      }

      // ✅ Limpeza e validação final dos campos
      const cleanedRqe = rqe.replace(/[^\d]/g, '').trim().substring(0, 8);
      const cleanedCrm = crm.replace(/[^\d]/g, '').trim().substring(0, 8);

      console.log('🔍 [Final Check] ==========================================');
      console.log('🔍 [Final Check] RQE original:', `"${rqe}"`, 'Length:', rqe.length);
      console.log('🔍 [Final Check] RQE limpo:', `"${cleanedRqe}"`, 'Length:', cleanedRqe.length);
      console.log('🔍 [Final Check] CRM original:', `"${crm}"`, 'Length:', crm.length);
      console.log('🔍 [Final Check] CRM limpo:', `"${cleanedCrm}"`, 'Length:', cleanedCrm.length);

      // ✅ Validações com campos limpos
      if (cleanedRqe.length < 3 || cleanedRqe.length > 8) { // ✅ Máximo 8
        console.log('🩺 [RegisterDoctor] ❌ RQE inválido:', cleanedRqe, 'Length:', cleanedRqe.length);
        Toast.show({ 
          type: 'error',
          text1: 'RQE Inválido',
          text2: `O RQE deve ter entre 3 e 8 dígitos. Atual: ${cleanedRqe.length}`
        });
        return;
      }

      if (cleanedCrm.length < 4 || cleanedCrm.length > 8) { // ✅ Máximo 8 para ser conservador
        console.log('🩺 [RegisterDoctor] ❌ CRM inválido:', cleanedCrm, 'Length:', cleanedCrm.length);
        Toast.show({ 
          type: 'error',
          text1: 'CRM Inválido',
          text2: `O CRM deve ter entre 4 e 8 dígitos. Atual: ${cleanedCrm.length}`
        });
        return;
      }

      // ✅ Outras validações...
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Toast.show({ 
          type: 'error',
          text1: 'Email Inválido',
          text2: 'Por favor, insira um email válido.'
        });
        return;
      }

      if (password.length < 6) {
        Toast.show({ 
          type: 'error',
          text1: 'Senha Muito Curta',
          text2: 'A senha deve ter pelo menos 6 caracteres.'
        });
        return;
      }

      if (password !== confirmPassword) {
        Toast.show({ 
          type: 'error',
          text1: 'Erro de Validação',
          text2: 'As senhas não coincidem!'
        });
        return;
      }

      const cpfCleaned = cpf.replace(/\D/g, '');
      if (cpfCleaned.length !== 11) {
        Toast.show({ 
          type: 'error',
          text1: 'CPF Inválido',
          text2: 'O CPF deve ter 11 dígitos.'
        });
        return;
      }

      const phoneCleaned = phone.replace(/\D/g, '');
      if (phoneCleaned.length < 10) {
        Toast.show({ 
          type: 'error',
          text1: 'Telefone Inválido',
          text2: 'Por favor, insira um telefone válido.'
        });
        return;
      }

      if (!crmState || crmState.length < 2) {
        console.log('🩺 [RegisterDoctor] ❌ Estado do CRM inválido:', crmState);
        Toast.show({ 
          type: 'error',
          text1: 'Estado do CRM obrigatório',
          text2: 'Por favor, selecione o estado do seu CRM.'
        });
        return;
      }

      // ✅ Encontrar nome da especialidade
      const selectedSpecialityName = specialities.find(s => s.id === selectedSpeciality)?.name || '';
      if (!selectedSpecialityName) {
        console.log('🩺 [RegisterDoctor] ❌ Especialidade não encontrada:', selectedSpeciality);
        Toast.show({ 
          type: 'error',
          text1: 'Especialidade Inválida',
          text2: 'Por favor, selecione uma especialidade válida.'
        });
        return;
      }

      if (!termsAccepted) {
        Toast.show({ 
          type: 'error',
          text1: 'Termos não aceitos',
          text2: 'Você deve aceitar os termos para continuar.'
        });
        return;
      }

      // ✅ Payload final com campos limpos
      const payload = { 
        // Dados pessoais
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneCleaned,
        password: password,
        cpf: cpfCleaned,
        sex: sex,
        birthDate: date.toISOString().slice(0, 10),
        // Dados profissionais - GARANTINDO LIMPEZA TOTAL
        rqe: cleanedRqe,
        crm: cleanedCrm,
        crmState: crmState.trim(),
        speciality: selectedSpecialityName,
        biography: biography.trim() || `Médico especialista em ${selectedSpecialityName}.`
      };

      console.log('🔍 [Final Check] Payload final:');
      console.log('🔍 [Final Check] RQE payload:', `"${payload.rqe}"`, 'Length:', payload.rqe.length);
      console.log('🔍 [Final Check] CRM payload:', `"${payload.crm}"`, 'Length:', payload.crm.length);
      console.log('🔍 [Final Check] Payload completo:', JSON.stringify(payload, null, 2));

      console.log('🩺 [RegisterDoctor] ✅ Iniciando registro...');
      
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
      console.error('🩺 [RegisterDoctor] ❌ ERRO CAPTURADO:', error);
      console.error('🩺 [RegisterDoctor] ❌ Error message:', error.message);
      console.error('🩺 [RegisterDoctor] ❌ Final error message:', error.message);
      
      Toast.show({
        type: 'error',
        text1: 'Erro no Cadastro',
        text2: error.message || 'Não foi possível completar o registro.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Tema do médico
  const COLORS = getTheme('doctor');

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
          <ResponsiveContainer>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Cadastro Profissional</Text>
              <Text style={styles.subtitle}>
                Registre-se como médico e ofereça seus serviços especializados
              </Text>
            </View>

            {/* Seção Dados Pessoais */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="person-outline" size={18} color={COLORS.white} />
                </View>
                <Text style={styles.sectionTitle}>Dados Pessoais</Text>
              </View>

              <CustomInput 
                placeholder="Nome completo" 
                value={name} 
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />

              <CustomInput 
                placeholder="E-mail profissional" 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none" 
                autoCorrect={false}
              />

              <CustomInput 
                placeholder="Telefone profissional" 
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
                secureTextEntry={true}
                showPasswordToggle={true}
                autoCapitalize="none"
              />

              <CustomInput 
                placeholder="Confirme sua senha" 
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
                secureTextEntry={true}
                showPasswordToggle={true}
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

              {/* Campo de data */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Data de Nascimento</Text>
                <TouchableOpacity style={styles.dateInput} onPress={toggleDatePicker}>
                  <Text style={[styles.dateInputText, !date && styles.placeholderText]}>
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
            </View>

            {/* Seção Dados Profissionais */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="medical-outline" size={18} color={COLORS.white} />
                </View>
                <Text style={styles.sectionTitle}>Dados Profissionais</Text>
              </View>

              <CustomInput 
                placeholder="RQE (máx. 8 dígitos) - Registro de Qualificação de Especialista" 
                value={rqe} 
                onChangeText={formatRQE} 
                keyboardType="number-pad"
                maxLength={8} // ✅ Atualizado
                autoCorrect={false}
                autoCapitalize="none"
              />

              <CustomInput 
                placeholder="CRM (máx. 8 dígitos) - Conselho Regional de Medicina" 
                value={crm} 
                onChangeText={formatCRM} 
                keyboardType="number-pad"
                maxLength={8} // ✅ Atualizado  
                autoCorrect={false}
                autoCapitalize="none"
              />

              {/* Campo Estado do CRM */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Estado do CRM *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={crmState}
                    onValueChange={(itemValue) => {
                      console.log('🩺 [RegisterDoctor] Estado CRM selecionado:', itemValue);
                      setCrmState(itemValue);
                    }}
                    style={styles.picker}
                  >
                    <Picker.Item 
                      label="Selecione o estado do seu CRM" 
                      value="" 
                      color={COLORS.placeholder}
                    />
                    <Picker.Item label="AC - Acre" value="AC" color={COLORS.text} />
                    <Picker.Item label="AL - Alagoas" value="AL" color={COLORS.text} />
                    <Picker.Item label="AP - Amapá" value="AP" color={COLORS.text} />
                    <Picker.Item label="AM - Amazonas" value="AM" color={COLORS.text} />
                    <Picker.Item label="BA - Bahia" value="BA" color={COLORS.text} />
                    <Picker.Item label="CE - Ceará" value="CE" color={COLORS.text} />
                    <Picker.Item label="DF - Distrito Federal" value="DF" color={COLORS.text} />
                    <Picker.Item label="ES - Espírito Santo" value="ES" color={COLORS.text} />
                    <Picker.Item label="GO - Goiás" value="GO" color={COLORS.text} />
                    <Picker.Item label="MA - Maranhão" value="MA" color={COLORS.text} />
                    <Picker.Item label="MT - Mato Grosso" value="MT" color={COLORS.text} />
                    <Picker.Item label="MS - Mato Grosso do Sul" value="MS" color={COLORS.text} />
                    <Picker.Item label="MG - Minas Gerais" value="MG" color={COLORS.text} />
                    <Picker.Item label="PA - Pará" value="PA" color={COLORS.text} />
                    <Picker.Item label="PB - Paraíba" value="PB" color={COLORS.text} />
                    <Picker.Item label="PR - Paraná" value="PR" color={COLORS.text} />
                    <Picker.Item label="PE - Pernambuco" value="PE" color={COLORS.text} />
                    <Picker.Item label="PI - Piauí" value="PI" color={COLORS.text} />
                    <Picker.Item label="RJ - Rio de Janeiro" value="RJ" color={COLORS.text} />
                    <Picker.Item label="RN - Rio Grande do Norte" value="RN" color={COLORS.text} />
                    <Picker.Item label="RS - Rio Grande do Sul" value="RS" color={COLORS.text} />
                    <Picker.Item label="RO - Rondônia" value="RO" color={COLORS.text} />
                    <Picker.Item label="RR - Roraima" value="RR" color={COLORS.text} />
                    <Picker.Item label="SC - Santa Catarina" value="SC" color={COLORS.text} />
                    <Picker.Item label="SP - São Paulo" value="SP" color={COLORS.text} />
                    <Picker.Item label="SE - Sergipe" value="SE" color={COLORS.text} />
                    <Picker.Item label="TO - Tocantins" value="TO" color={COLORS.text} />
                  </Picker>
                </View>
              </View>

              {/* Campo de Especialidade */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Especialidade Médica *</Text>
                {specialitiesLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Carregando especialidades...</Text>
                  </View>
                ) : (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedSpeciality}
                      onValueChange={(itemValue) => {
                        console.log('🩺 [RegisterDoctor] Especialidade selecionada:', itemValue);
                        setSelectedSpeciality(itemValue);
                      }}
                      style={styles.picker}
                    >
                      <Picker.Item 
                        label="Selecione sua especialidade" 
                        value="" 
                        color={COLORS.placeholder}
                      />
                      {specialities.map((speciality) => (
                        <Picker.Item
                          key={speciality.id}
                          label={speciality.name}
                          value={speciality.id}
                          color={COLORS.text}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              </View>

              <CustomInput 
                placeholder="Biografia profissional (opcional)" 
                value={biography} 
                onChangeText={setBiography} 
                multiline
                numberOfLines={4}
                style={{ textAlignVertical: 'top', height: 100 }}
              />
            </View>

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
              title={loading ? 'Cadastrando...' : 'Cadastrar como Médico'}
              onPress={handleRegister}
              disabled={loading}
              userType="doctor"
            />

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
    marginBottom: SIZES.xLarge,
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

  // Picker
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: SIZES.inputWidth,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333333',
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
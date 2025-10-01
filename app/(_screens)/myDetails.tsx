import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SIZES } from '../../src/constants/theme';
import { HEADER_CONSTANTS } from '../../src/constants/layout';
import { CustomInput } from '../../src/components/CustomInput';
import { CustomButton } from '../../src/components/CustomButton';
import { getClientProfileByUserId } from '../../src/api/services/patient';
import { getDoctorByUserId } from '../../src/api/services/doctor';

// --- INTERFACES ---
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  userId?: string;
  sex?: string;
  specialty?: string;
  rqe?: string;
  crm?: string;
  biography?: string;
}

export default function MyDetailsScreen() {
  const router = useRouter();
  const { session, isAuthenticated } = useAuth();
  
  // Estados principais
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Estados dos campos editáveis
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sex, setSex] = useState<'Male' | 'Female' | ''>('');

  // Carregar dados do usuário
  useEffect(() => {
    if (!isAuthenticated || !session.userId) {
      Alert.alert('Acesso Negado', 'Você precisa estar logado para acessar esta página.');
      router.back();
      return;
    }
    loadUserProfile();
  }, [isAuthenticated, session.userId]);

  const loadUserProfile = async () => {
  try {
    setLoading(true);
    let profileData: UserProfile;
    
    if (!session.userId) {
      throw new Error('ID do usuário não disponível');
    }
    
    if (session.role === 'client' || session.role === 'patient' || session.role === 'admin') {
      console.log(`Carregando perfil de paciente para ID ${session.userId}`);
      const patientData = await getClientProfileByUserId(session.userId);
      
      if (!patientData) {
        throw new Error('Dados do paciente não encontrados');
      }
      
      profileData = {
        id: patientData.id,
        userId: patientData.userId,
        name: patientData.name || '',
        email: patientData.email || '',
        phone: patientData.phone || '',
        cpf: patientData.cpf || '',
        birthDate: patientData.birthDate?.toString() || '',
        sex: patientData.sex || '',
      };
    } else if (session.role === 'doctor') {
      console.log(`Carregando perfil de médico para ID ${session.userId}`);
      const doctorData = await getDoctorByUserId(session.userId);
      console.log(`Carregando depois do get ${doctorData.name}`);
      if (!doctorData) {
        throw new Error('Dados do médico não encontrados');
      }
      
      profileData = {
        id: doctorData.id,
        name: doctorData.name || '',
        email: doctorData.email || '',
        phone: doctorData.phone || '',
        cpf: doctorData.cpf || '',
        birthDate: doctorData.birthDate?.toString() || '',
        specialty: doctorData.specialty || '',
        rqe: doctorData.rqe || '',
        crm: doctorData.crm || '',
        biography: doctorData.biography || '',
      };
    } else {
      throw new Error(`Tipo de usuário desconhecido: ${session.role}`);
    }
    
    setUserProfile(profileData);
    
    // Inicializar campos editáveis
    setName(profileData.name);
    setEmail(profileData.email);
    setPhone(profileData.phone);
    setSex((profileData.sex as 'Male' | 'Female' | '') || '');
    
    if (profileData.birthDate) {
      try {
        setBirthDate(new Date(profileData.birthDate));
      } catch (dateError) {
        console.error('Erro ao processar data:', dateError);
        setBirthDate(null);
      }
    }
    
  } catch (error: any) {
    console.error('Erro ao carregar perfil:', error);
    Alert.alert('Erro', `Não foi possível carregar seus dados: ${error.message || 'Erro desconhecido'}`);
  } finally {
    setLoading(false);
  }
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

  // Alternar modo de edição
  const handleToggleEdit = () => {
    if (isEditing) {
      // Cancelar edição - restaurar valores originais
      if (userProfile) {
        setName(userProfile.name);
        setEmail(userProfile.email);
        setPhone(userProfile.phone);
        setSex((userProfile.sex as 'Male' | 'Female' | '') || '');
        setBirthDate(userProfile.birthDate ? new Date(userProfile.birthDate) : null);
      }
    }
    setIsEditing(!isEditing);
  };

  // Salvar alterações
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Validações básicas
      if (!name.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Campo obrigatório',
          text2: 'O nome não pode estar vazio.'
        });
        return;
      }

      if (!email.trim() || !email.includes('@')) {
        Toast.show({
          type: 'error',
          text1: 'Email inválido',
          text2: 'Por favor, insira um email válido.'
        });
        return;
      }

      // Aqui você implementaria a chamada à API para salvar os dados
      // Por enquanto, vamos simular o sucesso
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar dados locais
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone,
          sex,
          birthDate: birthDate?.toISOString() || userProfile.birthDate,
        };
        setUserProfile(updatedProfile);
      }

      setIsEditing(false);
      
      Toast.show({
        type: 'success',
        text1: 'Dados atualizados!',
        text2: 'Suas informações foram salvas com sucesso.'
      });

    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar',
        text2: 'Não foi possível salvar suas alterações.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Manipular seleção de data
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  // Renderizar campo de informação
  const renderInfoField = (
    label: string, 
    value: string, 
    icon: string, 
    editable: boolean = false,
    onPress?: () => void
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.fieldValue, editable && styles.editableField]}>
        <Ionicons 
          name={icon as any} 
          size={20} 
          color={COLORS.primary} 
          style={styles.fieldIcon} 
        />
        {editable && onPress ? (
          <TouchableOpacity onPress={onPress} style={styles.fieldTouchable}>
            <Text style={[styles.fieldText, !value && styles.placeholderText]}>
              {value || 'Selecionar...'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.fieldText, !value && styles.emptyText]}>
            {value || 'Não informado'}
          </Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: 'Meus Dados',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando seus dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerTitle: 'Meus Dados',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
            ),
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Erro ao carregar dados</Text>
          <Text style={styles.errorText}>
            Não foi possível carregar suas informações.
          </Text>
          <CustomButton
            title="Tentar Novamente"
            onPress={loadUserProfile}
            style={styles.retryButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false, // ✅ Vamos usar header customizado
        }}
      />

      {/* ✅ Header customizado padronizado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Dados</Text>
        <TouchableOpacity onPress={handleToggleEdit} style={styles.editButton}>
          <Ionicons 
            name={isEditing ? "close" : "create-outline"} 
            size={24} 
            color={COLORS.primary} 
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Seção de Informações Pessoais */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            </View>

            {isEditing ? (
              <>
                <CustomInput
                  label="Nome Completo"
                  placeholder="Digite seu nome completo"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />

                <CustomInput
                  label="Email"
                  placeholder="Digite seu email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <CustomInput
                  label="Telefone"
                  placeholder="Digite seu telefone"
                  value={phone}
                  onChangeText={formatPhone}
                  keyboardType="phone-pad"
                  maxLength={15}
                />

                {/* Seleção de Sexo */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Sexo</Text>
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

                {/* Seleção de Data */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Data de Nascimento</Text>
                  <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)} 
                    style={styles.dateInput}
                  >
                    <Text style={[styles.dateInputText, !birthDate && styles.placeholderText]}>
                      {birthDate ? birthDate.toLocaleDateString('pt-BR') : 'Selecione sua data de nascimento'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                {showDatePicker && (
                  <DateTimePicker 
                    mode="date" 
                    display="spinner" 
                    value={birthDate || new Date()} 
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </>
            ) : (
              <>
                {renderInfoField('Nome Completo', userProfile.name, 'person')}
                {renderInfoField('Email', userProfile.email, 'mail')}
                {renderInfoField('Telefone', userProfile.phone, 'call')}
                {renderInfoField('CPF', userProfile.cpf, 'card')}
                {renderInfoField(
                  'Data de Nascimento', 
                  userProfile.birthDate ? new Date(userProfile.birthDate).toLocaleDateString('pt-BR') : '',
                  'calendar'
                )}
                {renderInfoField(
                  'Sexo', 
                  userProfile.sex === 'Male' ? 'Masculino' : userProfile.sex === 'Female' ? 'Feminino' : '',
                  'person'
                )}
              </>
            )}
          </View>

          {/* Seção Específica para Médicos */}
          {session.role === 'doctor' && userProfile.specialty && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="medical-outline" size={24} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Informações Profissionais</Text>
              </View>

              {renderInfoField('Especialidade', userProfile.specialty, 'medical')}
              {renderInfoField('RQE', userProfile.rqe || '', 'document-text')}
              {renderInfoField('CRM', userProfile.crm || '', 'card')}
              
              {userProfile.biography && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>Biografia</Text>
                  <View style={styles.biographyContainer}>
                    <Text style={styles.biographyText}>{userProfile.biography}</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Informações do Sistema */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Informações da Conta</Text>
            </View>

            {renderInfoField('ID do Usuário', userProfile.id, 'key')}
            {renderInfoField('Tipo de Conta', 
              session.role === 'client' ? 'Paciente' : 
              session.role === 'doctor' ? 'Médico' : 
              session.role || '', 
              'shield'
            )}
          </View>
        </ScrollView>

        {/* Botões de Ação */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <CustomButton
              title="Cancelar"
              variant="outline"
              onPress={handleToggleEdit}
              style={styles.cancelButton}
            />
            <CustomButton
              title={saving ? 'Salvando...' : 'Salvar Alterações'}
              onPress={handleSaveChanges}
              disabled={saving}
              style={styles.saveButton}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // ✅ Header padronizado
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    minHeight: 60,
  },
  backButton: {
    padding: SIZES.tiny,
  },
  headerTitle: {
    flex: 1,
    fontSize: HEADER_CONSTANTS.titleFontSize,
    fontWeight: HEADER_CONSTANTS.titleFontWeight,
    color: COLORS.text,
    textAlign: 'center',
    marginHorizontal: SIZES.medium,
  },
  editButton: {
    padding: SIZES.small,
  },
  
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.containerPadding,
  },
  loadingText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginTop: SIZES.medium,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.containerPadding,
  },
  errorTitle: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.error,
    marginTop: SIZES.medium,
    marginBottom: SIZES.small,
    textAlign: 'center',
  },
  errorText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.large,
  },
  retryButton: {
    marginTop: SIZES.medium,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: SIZES.containerPadding,
  },

  // Sections
  section: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.large,
    marginVertical: SIZES.small,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SIZES.small,
  },

  // Info Fields (Read Mode)
  fieldContainer: {
    marginBottom: SIZES.medium,
  },
  fieldLabel: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.tiny,
  },
  fieldValue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editableField: {
    borderColor: COLORS.primary + '30',
  },
  fieldIcon: {
    marginRight: SIZES.small,
  },
  fieldTouchable: {
    flex: 1,
  },
  fieldText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    flex: 1,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  placeholderText: {
    color: COLORS.placeholder,
  },

  // Biography
  biographyContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  biographyText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: SIZES.large,
  },

  // Input Fields (Edit Mode)
  inputContainer: {
    marginBottom: SIZES.medium,
  },
  inputLabel: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.tiny,
  },

  // Sex Selection
  sexOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.small,
  },
  sexOption: {
    flex: 1,
    paddingVertical: SIZES.medium,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
  },
  selectedSexOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sexOptionText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedSexOptionText: {
    color: COLORS.white,
    fontWeight: '600',
  },

  // Date Input
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: SIZES.medium,
  },
  dateInputText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    flex: 1,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.containerPadding,
    paddingVertical: SIZES.medium,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SIZES.small,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
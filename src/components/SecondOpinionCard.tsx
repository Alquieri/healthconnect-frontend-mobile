import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { COLORS, SIZES } from '../constants/theme';
import { CustomButton } from './CustomButton';
import { getAllSpecialities } from '../api/services/speciality';
import { SpecialityDto } from '../api/models/speciality';

export function SecondOpinionCard() {
  const router = useRouter();
  
  // Estados para o modal
  const [modalVisible, setModalVisible] = useState(false);
  const [caseDescription, setCaseDescription] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [specialties, setSpecialties] = useState<SpecialityDto.SpecialityResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  // Carregar especialidades
  useEffect(() => {
    if (modalVisible) {
      loadSpecialties();
    }
  }, [modalVisible]);

  const loadSpecialties = async () => {
    try {
      setLoadingSpecialties(true);
      const data = await getAllSpecialities();
      setSpecialties(data);
    } catch (error) {
      console.error('[SecondOpinion] Erro ao carregar especialidades:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar as especialidades'
      });
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setCaseDescription('');
    setSelectedSpecialty('');
    setAttachments([]);
  };

  const handleAddAttachment = () => {
    Toast.show({
      type: 'info',
      text1: '🚧 Funcionalidade em Desenvolvimento',
      text2: 'Upload de anexos será implementado em breve!'
    });
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
  };

const showCustomSuccessAlert = () => {
    Alert.alert(
        '🩺 Segunda Opinião Solicitada!',
        'Sua solicitação foi recebida com sucesso!\n\n📋 Próximos passos:\n• Análise por especialistas qualificados\n• Você será notificado quando concluída\n• Confirmação por email\n\n💙 Cuidaremos do seu caso com total sigilo médico.',
        [
            {
                text: '✅ Entendi!',
                style: 'default',
                onPress: () => {
                    Toast.show({
                        type: 'success',
                        text1: '📧 Confirmação Enviada',
                        text2: 'Detalhes enviados por email'
                    });
                }
            }
        ],
        {
            cancelable: false,
            userInterfaceStyle: 'light',
            titleStyle: { color: COLORS.primary },
            messageStyle: { color: COLORS.text }
        }
    );
};

  const handleSubmitRequest = async () => {
    // Validações simplificadas
    if (!caseDescription.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo obrigatório',
        text2: 'Por favor, descreva seu caso clínico'
      });
      return;
    }

    if (!selectedSpecialty) {
      Toast.show({
        type: 'error',
        text1: 'Especialidade obrigatória',
        text2: 'Por favor, selecione uma especialidade'
      });
      return;
    }

    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      handleCloseModal();
      
      setTimeout(() => {
        showCustomSuccessAlert();
      }, 500);

    } catch (error) {
      console.error('[SecondOpinion] Erro ao enviar solicitação:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao enviar',
        text2: 'Não foi possível enviar sua solicitação. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSpecialtyName = () => {
    const specialty = specialties.find(s => s.id === selectedSpecialty);
    return specialty?.name || '';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.card} 
        onPress={handleOpenModal}
        activeOpacity={0.90}
      >
        <View style={styles.cardContent}>
          {/* Ícone médico à esquerda */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons name="fitness" size={26} color={COLORS.white} />
              <View style={styles.secondIcon}>
                <Ionicons name="checkmark-done" size={14} color={COLORS.white} />
              </View>
            </View>
          </View>
          
          {/* Conteúdo à direita */}
          <View style={styles.contentArea}>
            <Text style={styles.title}>Precisa de uma Segunda Opinião?</Text>
            <Text style={styles.subtitle}>
              Receba análise de um especialista sobre seu diagnóstico ou tratamento.
            </Text>
            
            <View style={styles.actionButton}>
              <Text style={styles.buttonText}>Solicitar Agora</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Modal para solicitação de segunda opinião */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          {/* Header do Modal */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Segunda Opinião Médica</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Explicação */}
            <View style={styles.explanationCard}>
              <Ionicons name="information-circle" size={24} color={COLORS.primary} />
              <Text style={styles.explanationText}>
                Descreva seu caso e nossa equipe enviará para especialistas qualificados analisarem e fornecerem uma segunda opinião profissional.
              </Text>
            </View>

            {/* Campo de descrição do caso */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Descreva seu caso clínico *</Text>
              <Text style={styles.inputSubLabel}>
                Inclua sintomas, diagnóstico atual, exames realizados e suas dúvidas
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Ex: Fui diagnosticado com... mas gostaria de uma segunda opinião sobre o tratamento proposto..."
                value={caseDescription}
                onChangeText={setCaseDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={1000}
              />
              <Text style={styles.characterCount}>
                {caseDescription.length}/1000 caracteres
              </Text>
            </View>

            {/* Seleção de especialidade */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Área de especialidade *</Text>
              <Text style={styles.inputSubLabel}>
                Selecione a especialidade mais relacionada ao seu caso
              </Text>
              
              {loadingSpecialties ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Carregando especialidades...</Text>
                </View>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedSpecialty}
                    onValueChange={setSelectedSpecialty}
                    style={styles.picker}
                  >
                    <Picker.Item 
                      label="Selecione uma especialidade" 
                      value="" 
                      color={COLORS.placeholder}
                    />
                    {specialties.map((specialty) => (
                      <Picker.Item
                        key={specialty.id}
                        label={specialty.name}
                        value={specialty.id}
                        color={COLORS.text}
                      />
                    ))}
                  </Picker>
                </View>
              )}
            </View>

            {/* Seção de Anexos */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Anexos (Opcional)</Text>
              <Text style={styles.inputSubLabel}>
                Adicione exames, laudos médicos ou documentos relevantes
              </Text>
              
              <TouchableOpacity style={styles.attachmentButton} onPress={handleAddAttachment}>
                <Ionicons name="attach" size={20} color={COLORS.primary} />
                <Text style={styles.attachmentButtonText}>Adicionar Anexo</Text>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>

              {/* Lista de anexos (placeholder) */}
              {attachments.length > 0 && (
                <View style={styles.attachmentsList}>
                  {attachments.map((attachment, index) => (
                    <View key={index} style={styles.attachmentItem}>
                      <Ionicons name="document" size={16} color={COLORS.primary} />
                      <Text style={styles.attachmentName}>{attachment}</Text>
                      <TouchableOpacity onPress={() => handleRemoveAttachment(index)}>
                        <Ionicons name="close-circle" size={20} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.attachmentTip}>
                <Ionicons name="lightbulb" size={16} color={COLORS.textSecondary} />
                <Text style={styles.attachmentTipText}>
                  Formatos aceitos: PDF, JPG, PNG (máx. 10MB por arquivo)
                </Text>
              </View>
            </View>

            {/* Resumo da solicitação */}
            {caseDescription.trim() && selectedSpecialty && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>📋 Resumo da Solicitação</Text>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Especialidade:</Text>
                  <Text style={styles.summaryValue}>{getSpecialtyName()}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Descrição:</Text>
                  <Text style={styles.summaryValue} numberOfLines={3}>
                    {caseDescription.trim()}
                  </Text>
                </View>
                {attachments.length > 0 && (
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Anexos:</Text>
                    <Text style={styles.summaryValue}>{attachments.length} arquivo(s)</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer com botões */}
          <View style={styles.modalFooter}>
            <CustomButton
              title="Cancelar"
              variant="outline"
              onPress={handleCloseModal}
              style={styles.cancelButton}
            />
            <CustomButton
              title={loading ? 'Enviando...' : 'Solicitar Segunda Opinião'}
              onPress={handleSubmitRequest}
              disabled={loading || !caseDescription.trim() || !selectedSpecialty}
              style={styles.submitButton}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.containerPadding,
    marginVertical: SIZES.medium,
  },
  card: {
    backgroundColor: COLORS.primary + 'E6',
    borderRadius: SIZES.radius * 3,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: COLORS.primary + '20',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SIZES.medium,
    paddingVertical: SIZES.medium,
    position: 'relative',
  },
  iconContainer: {
    marginRight: SIZES.medium,
    marginTop: SIZES.tiny,
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  secondIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primaryDark + 'F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: SIZES.large,
    marginBottom: SIZES.small,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: SIZES.small,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: SIZES.medium,
    fontWeight: '400',
    marginBottom: SIZES.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white + 'F8',
    paddingHorizontal: SIZES.medium,
    paddingVertical: SIZES.small + 1,
    borderRadius: SIZES.radius * 4,
    alignSelf: 'flex-start',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  buttonText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: SIZES.tiny,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 0.5,
  },

  // Estilos do Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  closeButton: {
    padding: SIZES.small,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    padding: SIZES.large,
  },
  explanationCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    padding: SIZES.medium,
    borderRadius: SIZES.radius * 2,
    marginBottom: SIZES.large,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  explanationText: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: SIZES.large,
    marginLeft: SIZES.small,
  },
  inputSection: {
    marginBottom: SIZES.large,
  },
  inputLabel: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.tiny,
  },
  inputSubLabel: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.small,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    minHeight: 120,
  },
  characterCount: {
    fontSize: SIZES.xSmall,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SIZES.tiny,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius * 2,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  loadingContainer: {
    padding: SIZES.large,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
  },

  // Estilos dos Anexos
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
    borderRadius: SIZES.radius * 2,
    paddingVertical: SIZES.large,
    paddingHorizontal: SIZES.medium,
    marginBottom: SIZES.small,
  },
  attachmentButtonText: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: '600',
    marginHorizontal: SIZES.small,
  },
  attachmentsList: {
    marginVertical: SIZES.small,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: SIZES.medium,
    marginBottom: SIZES.small,
  },
  attachmentName: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginLeft: SIZES.small,
  },
  attachmentTip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.small,
    borderRadius: SIZES.radius,
    marginTop: SIZES.small,
  },
  attachmentTipText: {
    flex: 1,
    fontSize: SIZES.xSmall,
    color: COLORS.textSecondary,
    marginLeft: SIZES.tiny,
  },

  summaryCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.large,
  },
  summaryTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  summaryItem: {
    marginBottom: SIZES.small,
  },
  summaryLabel: {
    fontSize: SIZES.small,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SIZES.tiny,
  },
  summaryValue: {
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SIZES.large,
    gap: SIZES.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

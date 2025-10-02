import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { CustomButton } from '../../src/components/CustomButton';
import { useAuth } from '../../src/context/AuthContext';
import { createAvailabilityList, getAllAvailabilityByDoctorId } from '../../src/api/services/availability';
import { getTheme, SIZES } from '../../src/constants/theme';
import { AvailabilityDto } from '../../src/api/models/availability';

export default function CreateAvailabilityScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const COLORS = getTheme('doctor');

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingConflicts, setLoadingConflicts] = useState(false);
  const [consultationDuration, setConsultationDuration] = useState(30);
  const [existingAvailabilities, setExistingAvailabilities] = useState<AvailabilityDto.AvailabilitySummary[]>([]);
  const [conflictingSlots, setConflictingSlots] = useState<Set<string>>(new Set());

  // Opções de duração disponíveis
  const durationOptions = [10, 15, 20, 30, 45, 60];

  // ✅ Carregar disponibilidades existentes do médico
  const loadExistingAvailabilities = async () => {
    if (!session.profileId) {
      console.log('[CreateAvailability] ❌ Nenhum profileId encontrado');
      return;
    }

    try {
      setLoadingConflicts(true);
      console.log('[CreateAvailability] 📅 Carregando disponibilidades existentes para médico:', session.profileId);
      
      const availabilities = await getAllAvailabilityByDoctorId(session.profileId);
      console.log('[CreateAvailability] 📊 Dados brutos recebidos:', JSON.stringify(availabilities, null, 2));
      
      setExistingAvailabilities(availabilities || []);
      
      console.log('[CreateAvailability] ✅ Disponibilidades carregadas:', availabilities?.length || 0);
      
      // ✅ Processar conflitos para a data atual imediatamente
      if (availabilities && availabilities.length > 0) {
        processConflicts(selectedDate, consultationDuration, availabilities);
      } else {
        console.log('[CreateAvailability] ℹ️ Nenhuma disponibilidade existente - limpando conflitos');
        setConflictingSlots(new Set());
      }
      
    } catch (error: any) {
      console.error('[CreateAvailability] ❌ Erro ao carregar disponibilidades:', error);
      
      // ✅ Se for 404, significa que não há disponibilidades (OK)
      if (error.response?.status === 404) {
        console.log('[CreateAvailability] ℹ️ Médico ainda não possui disponibilidades cadastradas (404)');
        setExistingAvailabilities([]);
        setConflictingSlots(new Set());
      } else {
        // ✅ Outros erros devem ser mostrados
        Toast.show({
          type: 'error',
          text1: 'Erro ao verificar horários',
          text2: 'Não foi possível verificar os horários existentes'
        });
        setExistingAvailabilities([]);
        setConflictingSlots(new Set());
      }
    } finally {
      setLoadingConflicts(false);
    }
  };

  // ✅ Processar conflitos de horários - VERSÃO CORRIGIDA
  const processConflicts = (date: Date, duration: number, availabilities: AvailabilityDto.AvailabilitySummary[]) => {
    console.log('[CreateAvailability] 🔍 === INICIANDO PROCESSAMENTO DE CONFLITOS ===');
    
    // ✅ Usar data local sem timezone
    const selectedDateString = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().split('T')[0];
    const conflicts = new Set<string>();

    console.log('[CreateAvailability] 📅 Data selecionada (normalizada):', selectedDateString);
    console.log('[CreateAvailability] 📊 Total de availabilities para verificar:', availabilities.length);
    console.log('[CreateAvailability] ⏱️ Duração da consulta:', duration, 'minutos');

    // ✅ Filtrar disponibilidades para a data selecionada
    const dayAvailabilities = availabilities.filter(avail => {
      const availDate = new Date(avail.slotDateTime);
      const availDateString = new Date(availDate.getFullYear(), availDate.getMonth(), availDate.getDate()).toISOString().split('T')[0];
      
      const matches = availDateString === selectedDateString;
      
      if (matches) {
        console.log('[CreateAvailability] 📋 Disponibilidade encontrada para a data:', {
          slotDateTime: avail.slotDateTime,
          availDateString,
          selectedDateString,
          duration: avail.durationMinutes
        });
      }
      
      return matches;
    });

    console.log('[CreateAvailability] 📋 Disponibilidades do dia selecionado:', dayAvailabilities.length);

    if (dayAvailabilities.length === 0) {
      console.log('[CreateAvailability] ✅ Nenhuma disponibilidade existente para esta data - nenhum conflito');
      setConflictingSlots(new Set());
      return;
    }

    // ✅ Gerar todos os slots possíveis para a duração selecionada
    const allPossibleSlots = generateAllPossibleHours(duration);
    console.log('[CreateAvailability] 🕐 Slots possíveis gerados:', allPossibleSlots.length, allPossibleSlots);

    // ✅ Para cada disponibilidade existente, marcar slots conflitantes
    dayAvailabilities.forEach((availability, index) => {
      console.log(`[CreateAvailability] 🔍 Verificando disponibilidade ${index + 1}/${dayAvailabilities.length}:`);
      
      const existingSlotDate = new Date(availability.slotDateTime);
      const existingStartTime = existingSlotDate.getHours() * 60 + existingSlotDate.getMinutes();
      const existingEndTime = existingStartTime + availability.durationMinutes;
      
      console.log(`[CreateAvailability] ⏰ Horário existente: ${existingSlotDate.toLocaleTimeString('pt-BR')} (${availability.durationMinutes}min)`);
      console.log(`[CreateAvailability] 📐 Tempo existente: ${existingStartTime}-${existingEndTime} minutos`);

      // ✅ Verificar conflito com cada slot possível
      allPossibleSlots.forEach(timeSlot => {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        const slotStartTime = hours * 60 + minutes;
        const slotEndTime = slotStartTime + duration;

        // ✅ Verificar se há sobreposição
        const hasOverlap = (
          (slotStartTime >= existingStartTime && slotStartTime < existingEndTime) || // Novo slot inicia durante existente
          (slotEndTime > existingStartTime && slotEndTime <= existingEndTime) ||     // Novo slot termina durante existente
          (slotStartTime <= existingStartTime && slotEndTime >= existingEndTime) ||  // Novo slot engloba o existente
          (existingStartTime >= slotStartTime && existingStartTime < slotEndTime)    // Existente inicia durante novo slot
        );

        if (hasOverlap) {
          conflicts.add(timeSlot);
          console.log(`[CreateAvailability] ⚠️ CONFLITO DETECTADO: ${timeSlot} (${slotStartTime}-${slotEndTime}) conflita com existente (${existingStartTime}-${existingEndTime})`);
        }
      });
    });

    console.log('[CreateAvailability] 🚫 Total de slots conflitantes:', conflicts.size);
    console.log('[CreateAvailability] 🚫 Slots conflitantes:', Array.from(conflicts));
    console.log('[CreateAvailability] === FIM DO PROCESSAMENTO DE CONFLITOS ===');
    
    setConflictingSlots(conflicts);
  };

  // ✅ Gerar todos os horários possíveis (para verificação de conflitos)
  const generateAllPossibleHours = (duration: number) => {
    const slots: string[] = [];
    
    // Período da manhã: 08:00 às 12:00
    const morningStart = 8 * 60; // 8:00 em minutos
    const morningEnd = 12 * 60;  // 12:00 em minutos
    
    // Período da tarde: 14:00 às 18:00
    const afternoonStart = 14 * 60; // 14:00 em minutos
    const afternoonEnd = 18 * 60;   // 18:00 em minutos
    
    // Gerar slots da manhã
    for (let minutes = morningStart; minutes < morningEnd; minutes += duration) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    }
    
    // Gerar slots da tarde
    for (let minutes = afternoonStart; minutes < afternoonEnd; minutes += duration) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    }
    
    console.log('[CreateAvailability] 🕐 Slots gerados para duração', duration + 'min:', slots);
    return slots;
  };

  // Função para gerar horários baseados na duração selecionada
  const generateAvailableHours = () => {
    return generateAllPossibleHours(consultationDuration);
  };

  const availableHours = generateAvailableHours();

  // ✅ Verificar se um slot está em conflito
  const isSlotConflicting = (timeSlot: string) => {
    const isConflicting = conflictingSlots.has(timeSlot);
    if (isConflicting) {
      console.log(`[CreateAvailability] 🚫 Slot ${timeSlot} está em conflito`);
    }
    return isConflicting;
  };

  // ✅ Verificar se um slot está disponível para seleção
  const isSlotAvailable = (timeSlot: string) => {
    return !isSlotConflicting(timeSlot);
  };

  const toggleTimeSlot = (time: string) => {
    console.log(`[CreateAvailability] 🖱️ Clique no slot: ${time}`);
    
    // Não permitir seleção de slots conflitantes
    if (isSlotConflicting(time)) {
      console.log(`[CreateAvailability] ❌ Tentativa de selecionar slot conflitante: ${time}`);
      Toast.show({
        type: 'info',
        text1: 'Horário não disponível',
        text2: 'Este horário já possui uma consulta agendada ou conflita com um horário existente.'
      });
      return;
    }

    setTimeSlots(prev => {
      const newSlots = prev.includes(time) 
        ? prev.filter(t => t !== time)
        : [...prev, time];
      
      console.log(`[CreateAvailability] ✅ Slots selecionados atualizados:`, newSlots);
      return newSlots;
    });
  };

  // Função para limpar seleções quando a duração muda
  const handleDurationChange = (duration: number) => {
    console.log(`[CreateAvailability] 📏 Mudança de duração: ${consultationDuration}min -> ${duration}min`);
    setConsultationDuration(duration);
    setTimeSlots([]); // Limpa as seleções de horário
    
    // ✅ Reprocessar conflitos com nova duração
    if (existingAvailabilities.length > 0) {
      processConflicts(selectedDate, duration, existingAvailabilities);
    }
  };

  // ✅ Função para lidar com mudança de data
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      console.log(`[CreateAvailability] 📅 Mudança de data: ${selectedDate.toLocaleDateString('pt-BR')} -> ${date.toLocaleDateString('pt-BR')}`);
      setSelectedDate(date);
      setTimeSlots([]); // Limpar seleções ao mudar data
      
      // ✅ Reprocessar conflitos para nova data
      if (existingAvailabilities.length > 0) {
        processConflicts(date, consultationDuration, existingAvailabilities);
      }
    }
  };

  // Função para selecionar/desselecionar todos os horários disponíveis
  const handleSelectAll = () => {
    const availableSlots = availableHours.filter(slot => !isSlotConflicting(slot));
    
    console.log(`[CreateAvailability] 📋 Seleção em massa - disponíveis: ${availableSlots.length}, conflitantes: ${conflictingSlots.size}`);
    
    if (timeSlots.length === availableSlots.length) {
      // Se todos disponíveis estão selecionados, desmarcar todos
      console.log('[CreateAvailability] ❌ Desmarcando todos os slots');
      setTimeSlots([]);
    } else {
      // Selecionar todos os disponíveis
      console.log('[CreateAvailability] ✅ Selecionando todos os slots disponíveis:', availableSlots);
      setTimeSlots([...availableSlots]);
    }
  };

  // Verificar se todos os horários disponíveis estão selecionados
  const availableSlots = availableHours.filter(slot => !isSlotConflicting(slot));
  const areAllAvailableSelected = timeSlots.length === availableSlots.length && availableSlots.length > 0;

  // ✅ Carregar disponibilidades na inicialização
  useEffect(() => {
    console.log('[CreateAvailability] 🔄 useEffect inicial - carregando disponibilidades');
    loadExistingAvailabilities();
  }, [session.profileId]);

  // ✅ Reprocessar conflitos quando data ou duração mudam
  useEffect(() => {
    console.log('[CreateAvailability] 🔄 useEffect conflitos - reprocessando');
    console.log('[CreateAvailability] 📊 Existem', existingAvailabilities.length, 'disponibilidades para reprocessar');
    
    if (existingAvailabilities.length > 0) {
      processConflicts(selectedDate, consultationDuration, existingAvailabilities);
    } else {
      // Limpar conflitos se não há disponibilidades
      setConflictingSlots(new Set());
    }
    
    // Sempre limpar seleções quando data/duração mudam
    setTimeSlots([]);
  }, [selectedDate, consultationDuration, existingAvailabilities]);

  const handleSaveAvailability = async () => {
    if (timeSlots.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Nenhum horário selecionado',
        text2: 'Selecione pelo menos um horário disponível.'
      });
      return;
    }

    // ✅ Verificação final antes de salvar
    const conflictingSelectedSlots = timeSlots.filter(slot => isSlotConflicting(slot));
    if (conflictingSelectedSlots.length > 0) {
      console.log('[CreateAvailability] ❌ Tentativa de salvar slots conflitantes:', conflictingSelectedSlots);
      Toast.show({
        type: 'error',
        text1: 'Horários conflitantes selecionados',
        text2: 'Remova os horários que já possuem consultas agendadas.'
      });
      return;
    }

    try {
      setLoading(true);

      const availabilityList: AvailabilityDto.AvailabilityRegistration[] = timeSlots.map(timeSlot => {
        const [hours, minutes] = timeSlot.split(':').map(Number);
        const slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(hours, minutes, 0, 0);

        return {
          doctorId: session.profileId!,
          slotDateTime: slotDateTime.toISOString(),
          durationMinutes: consultationDuration,
        };
      });

      console.log('[CreateAvailability] 📤 Enviando lista de disponibilidades:', availabilityList);

      await createAvailabilityList(availabilityList);

      Toast.show({
        type: 'success',
        text1: 'Disponibilidades cadastradas!',
        text2: `${timeSlots.length} horários de ${consultationDuration}min adicionados para ${selectedDate.toLocaleDateString('pt-BR')}`
      });

      setTimeSlots([]);
      
      // ✅ Recarregar disponibilidades após salvar para atualizar conflitos
      console.log('[CreateAvailability] 🔄 Recarregando disponibilidades após salvamento');
      await loadExistingAvailabilities();

    } catch (error: any) {
      console.error('[CreateAvailability] ❌ Erro ao cadastrar disponibilidades:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao cadastrar',
        text2: error.message || 'Não foi possível cadastrar as disponibilidades.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cadastrar Disponibilidade</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Selecionar Data</Text>
          
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {selectedDate.toLocaleDateString('pt-BR')}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Seção para duração das consultas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ Duração das Consultas</Text>
          <Text style={styles.sectionSubtitle}>
            Selecione quantos minutos durará cada consulta
          </Text>

          <View style={styles.durationGrid}>
            {durationOptions.map((duration) => (
              <TouchableOpacity
                key={duration}
                style={[
                  styles.durationOption,
                  consultationDuration === duration && styles.durationOptionSelected
                ]}
                onPress={() => handleDurationChange(duration)}
                disabled={loadingConflicts}
              >
                <Text style={[
                  styles.durationOptionText,
                  consultationDuration === duration && styles.durationOptionTextSelected
                ]}>
                  {duration} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🕐 Selecionar Horários</Text>
            {availableSlots.length > 0 && (
              <TouchableOpacity 
                style={styles.selectAllButton}
                onPress={handleSelectAll}
                disabled={loadingConflicts}
              >
                <Ionicons 
                  name={areAllAvailableSelected ? "checkbox" : "checkbox-outline"} 
                  size={20} 
                  color={COLORS.primary} 
                />
                <Text style={styles.selectAllText}>
                  {areAllAvailableSelected ? 'Desmarcar Todos' : 'Selecionar Disponíveis'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.sectionSubtitle}>
            Toque nos horários que você estará disponível (intervalos de {consultationDuration} minutos)
          </Text>

         

          {/* ✅ Indicador de carregamento de conflitos */}
          {loadingConflicts && (
            <View style={styles.loadingConflicts}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingConflictsText}>Verificando horários existentes...</Text>
            </View>
          )}

          {/* ✅ Legenda de cores */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.legendAvailable]} />
              <Text style={styles.legendText}>Disponível</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.legendSelected]} />
              <Text style={styles.legendText}>Selecionado</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, styles.legendConflict]} />
              <Text style={styles.legendText}>Já agendado</Text>
            </View>
          </View>

          <View style={styles.timeGrid}>
            {availableHours.map((time) => {
              const isConflicting = isSlotConflicting(time);
              const isSelected = timeSlots.includes(time);
              
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    isSelected && styles.timeSlotSelected,
                    isConflicting && styles.timeSlotConflicting
                  ]}
                  onPress={() => toggleTimeSlot(time)}
                  disabled={loadingConflicts}
                  activeOpacity={isConflicting ? 0.3 : 0.7}
                >
                  <Text style={[
                    styles.timeSlotText,
                    isSelected && styles.timeSlotTextSelected,
                    isConflicting && styles.timeSlotTextConflicting
                  ]}>
                    {time}
                  </Text>
                  {isConflicting && (
                    <Ionicons name="lock-closed" size={12} color="#999" style={styles.conflictIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ✅ Estatísticas */}
          <View style={styles.statistics}>
            <Text style={styles.statisticsText}>
              📊 {availableSlots.length} horários disponíveis • {conflictingSlots.size} já agendados • {timeSlots.length} selecionados
            </Text>
          </View>
        </View>

        {timeSlots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Resumo</Text>
            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Data: </Text>
                {selectedDate.toLocaleDateString('pt-BR')}
              </Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Duração: </Text>
                {consultationDuration} minutos por consulta
              </Text>
              <Text style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Horários: </Text>
                {timeSlots.length} selecionados
              </Text>
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>Horários que serão criados:</Text>
                {timeSlots.slice(0, 3).map((time, index) => (
                  <Text key={index} style={styles.previewTime}>
                    • {selectedDate.toLocaleDateString('pt-BR')} às {time} ({consultationDuration}min)
                  </Text>
                ))}
                {timeSlots.length > 3 && (
                  <Text style={styles.previewMore}>
                    ... e mais {timeSlots.length - 3} horários
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        <CustomButton
          title={loading ? 'Salvando...' : 'Cadastrar Disponibilidades'}
          onPress={handleSaveAvailability}
          disabled={loading || timeSlots.length === 0 || loadingConflicts}
          userType="doctor"
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerRight: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 6,
  },
  selectAllText: {
    fontSize: 14,
    color: '#00A651',
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationOption: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 80,
    alignItems: 'center',
  },
  durationOptionSelected: {
    backgroundColor: '#00A651',
    borderColor: '#00A651',
  },
  durationOptionText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  durationOptionTextSelected: {
    color: '#ffffff',
  },

  
  // ✅ Estilos para verificação de conflitos
  loadingConflicts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 15,
  },
  loadingConflictsText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666666',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendAvailable: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  legendSelected: {
    backgroundColor: '#00A651',
  },
  legendConflict: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  legendText: {
    fontSize: 12,
    color: '#666666',
  },
  statistics: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  statisticsText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 80,
    alignItems: 'center',
    position: 'relative',
  },
  timeSlotSelected: {
    backgroundColor: '#00A651',
    borderColor: '#00A651',
  },
  timeSlotConflicting: {
    backgroundColor: '#f5f5f5',
    borderColor: '#cccccc',
    opacity: 0.6,
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#ffffff',
  },
  timeSlotTextConflicting: {
    color: '#999999',
  },
  conflictIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  
  summary: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  summaryText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 5,
  },
  summaryLabel: {
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 5,
  },
  previewTime: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 2,
  },
  previewMore: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  saveButton: {
    marginTop: 20,
    marginBottom: 30,
  },
});
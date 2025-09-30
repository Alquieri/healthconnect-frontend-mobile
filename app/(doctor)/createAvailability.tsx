import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';
import { CustomButton } from '../../src/components/CustomButton';
import { useAuth } from '../../src/context/AuthContext';
import { createAvailability } from '../../src/api/services/availability';
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
  const [consultationDuration, setConsultationDuration] = useState(30); // Novo estado para duração

  // Opções de duração disponíveis
  const durationOptions = [10, 15, 20, 30, 45, 60];

  // Função para gerar horários baseados na duração selecionada
  const generateAvailableHours = () => {
    const slots: string[] = [];
    
    // Período da manhã: 08:00 às 12:00
    const morningStart = 8 * 60; // 8:00 em minutos
    const morningEnd = 12 * 60;  // 12:00 em minutos
    
    // Período da tarde: 14:00 às 18:00
    const afternoonStart = 14 * 60; // 14:00 em minutos
    const afternoonEnd = 18 * 60;   // 18:00 em minutos
    
    // Gerar slots da manhã
    for (let minutes = morningStart; minutes < morningEnd; minutes += consultationDuration) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    }
    
    // Gerar slots da tarde
    for (let minutes = afternoonStart; minutes < afternoonEnd; minutes += consultationDuration) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    }
    
    return slots;
  };

  const availableHours = generateAvailableHours();

  const toggleTimeSlot = (time: string) => {
    setTimeSlots(prev => 
      prev.includes(time) 
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  // Função para limpar seleções quando a duração muda
  const handleDurationChange = (duration: number) => {
    setConsultationDuration(duration);
    setTimeSlots([]); // Limpa as seleções de horário
  };

  const handleSaveAvailability = async () => {
    if (timeSlots.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Nenhum horário selecionado',
        text2: 'Selecione pelo menos um horário.'
      });
      return;
    }

    try {
      setLoading(true);

      const availabilityData: AvailabilityDto.AvailabilityRegistration = {
        doctorId: session.userId!,
        date: selectedDate,
        timeSlots: timeSlots,
        durationMinutes: consultationDuration, // Adiciona a duração
      };

      await createAvailability(availabilityData);

      Toast.show({
        type: 'success',
        text1: 'Disponibilidade cadastrada!',
        text2: `${timeSlots.length} horários de ${consultationDuration}min adicionados para ${selectedDate.toLocaleDateString('pt-BR')}`
      });

      setTimeSlots([]);
      setSelectedDate(new Date());

    } catch (error: any) {
      console.error('Erro ao cadastrar disponibilidade:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao cadastrar',
        text2: error.message || 'Não foi possível cadastrar a disponibilidade.'
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
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Nova seção para duração das consultas */}
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
          <Text style={styles.sectionTitle}>🕐 Selecionar Horários</Text>
          <Text style={styles.sectionSubtitle}>
            Toque nos horários que você estará disponível (intervalos de {consultationDuration} minutos)
          </Text>

          <View style={styles.timeGrid}>
            {availableHours.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  timeSlots.includes(time) && styles.timeSlotSelected
                ]}
                onPress={() => toggleTimeSlot(time)}
              >
                <Text style={[
                  styles.timeSlotText,
                  timeSlots.includes(time) && styles.timeSlotTextSelected
                ]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
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
            </View>
          </View>
        )}

        <CustomButton
          title={loading ? 'Salvando...' : 'Cadastrar Disponibilidade'}
          onPress={handleSaveAvailability}
          disabled={loading || timeSlots.length === 0}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
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
  // Estilos para a seleção de duração
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
  },
  timeSlotSelected: {
    backgroundColor: '#00A651',
    borderColor: '#00A651',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#ffffff',
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
  saveButton: {
    marginTop: 20,
    marginBottom: 30,
  },
});
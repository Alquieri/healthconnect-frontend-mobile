import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import CustomButton from '../../src/components/CustomButton';
import { COLORS, SIZES } from '../../src/constants/theme';
import { HEADER_CONSTANTS } from '../../src/constants/layout';
import { getAllAvailabilityByDoctorId } from '../../src/api/services/availability';
import { createAppointment } from '../../src/api/services/appointment';
import { AvailabilityDto } from '../../src/api/models/availability';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rqe: string;
  image?: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  availabilityId: string;
  durationMinutes: number;
}

interface DaySchedule {
  date: string;
  displayDate: string;
  dayName: string;
  dayNumber: number;
  month: string;
  isToday: boolean;
  available: boolean;
  afternoonSlots: TimeSlot[];
  eveningSlots: TimeSlot[];
}

export default function AppointmentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [bookingAppointment, setBookingAppointment] = useState(false);

  const processAvailabilityData = (availabilities: AvailabilityDto.AvailabilitySummary[]): DaySchedule[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const groupedByDate = availabilities.reduce((acc, availability) => {
      const date = new Date(availability.slotDateTime);
      const dateKey = date.toISOString().split('T')[0];
      
      if (date >= today) {
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(availability);
      }
      
      return acc;
    }, {} as Record<string, AvailabilityDto.AvailabilitySummary[]>);

    const schedules: DaySchedule[] = [];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    Object.entries(groupedByDate).forEach(([dateKey, dayAvailabilities]) => {
      const date = new Date(dateKey);
      const isToday = date.getTime() === today.getTime();
      
      const afternoonSlots: TimeSlot[] = [];
      const eveningSlots: TimeSlot[] = [];
      
      dayAvailabilities.forEach(availability => {
        const slotDate = new Date(availability.slotDateTime);
        const hour = slotDate.getHours();
        
        const timeSlot: TimeSlot = {
          id: availability.id,
          time: slotDate.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          available: true,
          availabilityId: availability.id,
          durationMinutes: availability.durationMinutes
        };
        
        if (hour < 17) {
          afternoonSlots.push(timeSlot);
        } else {
          eveningSlots.push(timeSlot);
        }
      });
      
      const sortSlots = (slots: TimeSlot[]) => 
        slots.sort((a, b) => a.time.localeCompare(b.time));
      
      schedules.push({
        date: dateKey,
        displayDate: date.toLocaleDateString('pt-BR'),
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        month: monthNames[date.getMonth()],
        isToday,
        available: afternoonSlots.length > 0 || eveningSlots.length > 0,
        afternoonSlots: sortSlots(afternoonSlots),
        eveningSlots: sortSlots(eveningSlots)
      });
    });

    return schedules.sort((a, b) => a.date.localeCompare(b.date));
  };

  useEffect(() => {
    loadDoctorAndSchedule();
  }, []);

  const loadDoctorAndSchedule = async () => {
    try {
      setLoading(true);
      
      const doctorId = params.doctorId as string;
      if (!doctorId) {
        Toast.show({
          type: 'error',
          text1: 'Acesso negado',
          text2: 'Você deve selecionar um médico primeiro'
        });
        router.replace('/(public)/searchDoctor'); // ✅ Rota específica
        return;
      }

      console.log('[Appointments] Carregando horários para o médico:', doctorId);

      const availabilities = await getAllAvailabilityByDoctorId(doctorId); 
      console.log("RESPOSTA BRUTA DA API:", JSON.stringify(availabilities, null, 2));

      if (availabilities.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'Sem horários disponíveis',
          text2: 'Este médico não possui horários disponíveis no momento'
        });
        setSchedule([]);
        return;
      }

      const firstAvailability = availabilities[0];
      const doctorInfo: Doctor = {
        id: firstAvailability.doctorId,
        name: firstAvailability.name,
        specialty: firstAvailability.specialty,
        rqe: firstAvailability.rqe,
        image: 'https://via.placeholder.com/80x80'
      };

      setDoctor(doctorInfo);
      
      const processedSchedule = processAvailabilityData(availabilities);
      setSchedule(processedSchedule);
      
      const firstAvailableDay = processedSchedule.find(day => day.available);
      if (firstAvailableDay && !selectedDate) {
        setSelectedDate(firstAvailableDay.date);
      }
      
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.message || 'Não foi possível carregar os horários disponíveis'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentMonthYear = () => {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    if (schedule.length === 0) return '';
    
    const firstDate = new Date(schedule[0].date);
    return `${monthNames[firstDate.getMonth()]} ${firstDate.getFullYear()}`;
  };

  const handleBookAppointment = async () => {
    if (!selectedTimeSlot) {
      Toast.show({
        type: 'error',
        text1: 'Seleção incompleta',
        text2: 'Por favor, selecione um horário'
      });
      return;
    }

    try {
      setBookingAppointment(true);
      
      const appointmentData = {
        availabilityId: selectedTimeSlot.availabilityId,
        notes: ''
      };

      console.log('[Appointments] Criando agendamento:', appointmentData);

      const createdAppointment = await createAppointment(appointmentData);

      console.log('[Appointments] Agendamento criado:', createdAppointment);

      Toast.show({
        type: 'success',
        text1: 'Agendamento confirmado!',
        text2: `Consulta marcada para ${getCurrentDaySchedule()?.displayDate} às ${selectedTimeSlot.time}`
      });

      setTimeout(() => {
        router.replace('/(public)/searchDoctor');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro no agendamento',
        text2: error.message || 'Não foi possível agendar a consulta'
      });
    } finally {
      setBookingAppointment(false);
    }
  };

  const getCurrentDaySchedule = () => {
    return schedule.find(day => day.date === selectedDate);
  };

  const renderTimeSlot = (slot: TimeSlot) => (
    <TouchableOpacity
      key={slot.id}
      style={[
        styles.timeSlot,
        !slot.available && styles.timeSlotDisabled,
        selectedTimeSlot?.id === slot.id && styles.timeSlotSelected
      ]}
      onPress={() => slot.available && setSelectedTimeSlot(slot)}
      disabled={!slot.available}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.timeSlotText,
        !slot.available && styles.timeSlotTextDisabled,
        selectedTimeSlot?.id === slot.id && styles.timeSlotTextSelected
      ]}>
        {slot.time}
      </Text>
      <Text style={[
        styles.timeSlotDuration,
        !slot.available && styles.timeSlotTextDisabled,
        selectedTimeSlot?.id === slot.id && styles.timeSlotTextSelected
      ]}>
        {slot.durationMinutes}min
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando horários disponíveis...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentSchedule = getCurrentDaySchedule();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agendar Consulta</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informações do Médico */}
        {doctor && (
          <View style={styles.doctorCard}>
            <View style={styles.doctorInfo}>
              <Image
                source={{ uri: doctor.image }}
                style={styles.doctorImage}
                defaultSource={require('../../assets/icon.png')}
              />
              <View style={styles.doctorDetails}>
                <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                <Text style={styles.doctorRqe}>RQE: {doctor.rqe}</Text>
                <View style={styles.doctorRating}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>4.8 (120+ avaliações)</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Seleção de Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Selecione a Data</Text>
          
          {schedule.length > 0 && (
            <View style={styles.monthDisplay}>
              <Text style={styles.monthYearText}>{getCurrentMonthYear()}</Text>
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelector}>
            {schedule.map((day) => (
              <TouchableOpacity
                key={day.date}
                style={[
                  styles.modernDateOption,
                  !day.available && styles.modernDateOptionDisabled,
                  selectedDate === day.date && styles.modernDateOptionSelected
                ]}
                onPress={() => day.available && setSelectedDate(day.date)}
                disabled={!day.available}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.dayNameText,
                  !day.available && styles.dateOptionTextDisabled,
                  selectedDate === day.date && styles.dateOptionTextSelected
                ]}>
                  {day.dayName}
                </Text>
                
                <View style={[
                  styles.dayNumberContainer,
                  day.isToday && styles.todayContainer,
                  selectedDate === day.date && styles.selectedDayContainer
                ]}>
                  <Text style={[
                    styles.dayNumberText,
                    day.isToday && styles.todayText,
                    !day.available && styles.dateOptionTextDisabled,
                    selectedDate === day.date && styles.selectedDayText
                  ]}>
                    {day.dayNumber}
                  </Text>
                </View>

                <Text style={[
                  styles.monthText,
                  !day.available && styles.dateOptionTextDisabled,
                  selectedDate === day.date && styles.dateOptionTextSelected
                ]}>
                  {day.month}
                </Text>

                <View style={[
                  styles.availableDot,
                  !day.available && styles.availableDotDisabled
                ]} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Data Selecionada */}
        {currentSchedule && (
          <View style={styles.selectedDateContainer}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.selectedDateText}>
              {currentSchedule.isToday ? 'Hoje' : currentSchedule.displayDate}
            </Text>
          </View>
        )}

        {/* Horários Disponíveis */}
        {currentSchedule && currentSchedule.available && (
          <>
            {currentSchedule.afternoonSlots.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="sunny-outline" size={16} color={COLORS.primary} /> 
                  {' '}Tarde • {currentSchedule.afternoonSlots.length} horários
                </Text>
                <View style={styles.timeSlotsGrid}>
                  {currentSchedule.afternoonSlots.map(renderTimeSlot)}
                </View>
              </View>
            )}

            {currentSchedule.eveningSlots.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="moon-outline" size={16} color={COLORS.primary} />
                  {' '}Noite • {currentSchedule.eveningSlots.length} horários
                </Text>
                <View style={styles.timeSlotsGrid}>
                  {currentSchedule.eveningSlots.map(renderTimeSlot)}
                </View>
              </View>
            )}
          </>
        )}

        {/* Estado Vazio */}
        {schedule.length === 0 && (
          <View style={styles.noSlotsContainer}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.placeholder} />
            <Text style={styles.noSlotsTitle}>Nenhum horário disponível</Text>
            <Text style={styles.noSlotsText}>
              Este médico não possui horários disponíveis no momento.
              Tente novamente mais tarde ou escolha outro profissional.
            </Text>
            <TouchableOpacity 
              style={styles.backToSearchButton}
              onPress={() => router.replace('/(public)/searchDoctor')}
            >
              <Text style={styles.backToSearchText}>Voltar à Busca</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Informações do Agendamento Selecionado */}
        {selectedTimeSlot && currentSchedule && (
          <View style={styles.appointmentSummary}>
            <Text style={styles.summaryTitle}>📋 Resumo do Agendamento</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Médico:</Text>
              <Text style={styles.summaryValue}>Dr. {doctor?.name}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Data:</Text>
              <Text style={styles.summaryValue}>{currentSchedule.displayDate}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Horário:</Text>
              <Text style={styles.summaryValue}>{selectedTimeSlot.time}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Duração:</Text>
              <Text style={styles.summaryValue}>{selectedTimeSlot.durationMinutes} minutos</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer com Botão de Confirmação */}
      {currentSchedule?.available && (
        <View style={styles.footer}>
          <CustomButton
            label={bookingAppointment ? 'Confirmando Agendamento...' : 'Confirmar Agendamento'}
            onPress={handleBookAppointment}
            disabled={!selectedTimeSlot || bookingAppointment}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  
  // ✅ Header padronizado
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEADER_CONSTANTS.paddingHorizontal,
    paddingTop: HEADER_CONSTANTS.paddingTop,
    paddingBottom: HEADER_CONSTANTS.paddingBottom,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    minHeight: HEADER_CONSTANTS.minHeight,
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
  headerRight: {
    width: 32,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  doctorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  doctorRqe: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  doctorRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthDisplay: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  dateSelector: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  modernDateOption: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginRight: 12,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modernDateOptionDisabled: {
    backgroundColor: '#F8F8F8',
    borderColor: '#E8E8E8',
    elevation: 0,
  },
  modernDateOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 4,
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  dayNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  todayContainer: {
    backgroundColor: COLORS.primary,
  },
  selectedDayContainer: {
    backgroundColor: COLORS.white,
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  todayText: {
    color: COLORS.white,
  },
  selectedDayText: {
    color: COLORS.primary,
  },
  monthText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateOptionTextDisabled: {
    color: COLORS.placeholder,
  },
  dateOptionTextSelected: {
    color: COLORS.white,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  availableDotDisabled: {
    backgroundColor: COLORS.placeholder,
  },
  selectedDateContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 8,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  timeSlot: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    margin: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    minWidth: 90,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  timeSlotDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    elevation: 0,
  },
  timeSlotSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    elevation: 3,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeSlotDuration: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  timeSlotTextDisabled: {
    color: COLORS.placeholder,
  },
  timeSlotTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  appointmentSummary: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  noSlotsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noSlotsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noSlotsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  backToSearchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backToSearchText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
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
import { CustomButton } from '../../src/components/CustomButton';
import { COLORS, SIZES } from '../../src/constants/theme';
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

export default function SelectTimeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [bookingAppointment, setBookingAppointment] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day;
    return new Date(today.setDate(diff));
  });

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
      const doctorId = "33194ad4-f83e-4e87-9a7c-5adeeab758e1"
      // const doctorId = params.doctorId as string;
      if (!doctorId) {
        throw new Error('ID do médico não fornecido');
      }

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
        image: 'https://via.placeholder.com/80x80' // future
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

      const createdAppointment = await createAppointment(appointmentData);

      Toast.show({
        type: 'success',
        text1: 'Agendamento confirmado!',
        text2: `Consulta marcada para ${selectedDate} às ${selectedTimeSlot.time}`
      });

      setTimeout(() => {
        router.back();
      }, 1500);

    } catch (error: any) {
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
          <Text style={styles.loadingText}>Carregando horários...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentSchedule = getCurrentDaySchedule();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Selecionar Horário</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {doctor && (
          <View style={styles.doctorCard}>
            <View style={styles.doctorInfo}>
              <Image
                source={{ uri: doctor.image }}
                style={styles.doctorImage}
                defaultSource={require('../../assets/icon.png')}
              />
              <View style={styles.doctorDetails}>
                <Text style={styles.doctorName}>{doctor.name}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                <Text style={styles.doctorRqe}>RQE: {doctor.rqe}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecione a Data</Text>
          
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

                <View style={styles.availableDot} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {currentSchedule && (
          <View style={styles.selectedDateContainer}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.selectedDateText}>
              {currentSchedule.isToday ? 'Hoje' : currentSchedule.displayDate}
            </Text>
          </View>
        )}

        {currentSchedule && currentSchedule.available && (
          <>
            {currentSchedule.afternoonSlots.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="sunny-outline" size={16} color={COLORS.primary} /> Tarde • {currentSchedule.afternoonSlots.length} horários
                </Text>
                <View style={styles.timeSlotsGrid}>
                  {currentSchedule.afternoonSlots.map(renderTimeSlot)}
                </View>
              </View>
            )}

            {currentSchedule.eveningSlots.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="moon-outline" size={16} color={COLORS.primary} /> Noite • {currentSchedule.eveningSlots.length} horários
                </Text>
                <View style={styles.timeSlotsGrid}>
                  {currentSchedule.eveningSlots.map(renderTimeSlot)}
                </View>
              </View>
            )}
          </>
        )}

        {schedule.length === 0 && (
          <View style={styles.noSlotsContainer}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.placeholder} />
            <Text style={styles.noSlotsTitle}>Nenhum horário disponível</Text>
            <Text style={styles.noSlotsText}>
              Este médico não possui horários disponíveis no momento.
              Tente novamente mais tarde.
            </Text>
          </View>
        )}
      </ScrollView>

      {currentSchedule?.available && (
        <View style={styles.footer}>
          <CustomButton
            title={bookingAppointment ? 'Agendando...' : 'Confirmar Agendamento'}
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginHorizontal: 16,
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
    padding: 16,
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  doctorRqe: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  monthDisplay: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
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
  },
  modernDateOptionDisabled: {
    backgroundColor: '#F8F8F8',
    borderColor: '#E8E8E8',
  },
  modernDateOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
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
  selectedDateContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 10,
    margin: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  timeSlotSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
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
  noSlotsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noSlotsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  noSlotsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
});
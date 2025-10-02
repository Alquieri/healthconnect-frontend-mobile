import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import CustomButton from '../../src/components/CustomButton';
import { COLORS, SIZES } from '../../src/constants/theme';
import { HEADER_CONSTANTS } from '../../src/constants/layout';
import { getAllAvailabilityByDoctorId } from '../../src/api/services/availability';
import { createAppointment, getAllAppointmentsByDoctorIdSummary } from '../../src/api/services/appointment';
import { AvailabilityDto } from '../../src/api/models/availability';
import { AppointmentDto } from '../../src/api/models/appointment';
import { useAuth } from '../../src/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context'

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
  isBooked?: boolean;
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

interface MonthSchedule {
  monthKey: string;
  monthName: string;
  year: number;
  days: DaySchedule[];
}

export default function AppointmentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { session, isAuthenticated, status } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [monthsSchedule, setMonthsSchedule] = useState<MonthSchedule[]>([]);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [bookingAppointment, setBookingAppointment] = useState(false);
  const [bookedAppointments, setBookedAppointments] = useState<AppointmentDto.AppointmentSummary[]>([]);

  // ✅ Verificação de autenticação no início
  useEffect(() => {
    console.log('[Appointments] 🔐 Status de autenticação:', { status, isAuthenticated, hasSession: !!session.userId });
    
    if (status === 'pending') {
      console.log('[Appointments] ⏳ Aguardando verificação de autenticação...');
      return;
    }

    if (status === 'unauthenticated' || !isAuthenticated) {
      console.log('[Appointments] ❌ Usuário não autenticado - redirecionando para login');
      Alert.alert(
        'Acesso Restrito',
        'Você precisa estar logado para agendar consultas.',
        [
          {
            text: 'Fazer Login',
            onPress: () => router.replace('/(auth)/login')
          },
          {
            text: 'Voltar',
            style: 'cancel',
            onPress: () => router.replace('/(app)/searchDoctor')
          }
        ]
      );
      return;
    }

    // ✅ Se autenticado, carregar dados
    loadDoctorAndSchedule();
  }, [status, isAuthenticated, session.userId]);

  // ✅ Função CORRIGIDA para verificar se um horário específico está agendado
  const isTimeSlotBooked = useCallback((availabilityId: string, appointments: AppointmentDto.AppointmentSummary[]): boolean => {
    console.log('[Appointments] 🔍 Verificando se availability está agendada:', availabilityId);
    console.log('[Appointments] 📋 Total de appointments para verificar:', appointments.length);
    
    const isBooked = appointments.some(appointment => {
      const matches = appointment.availabilityId === availabilityId;
      const isActive = appointment.status.toLowerCase() !== 'cancelled' && 
                      appointment.status.toLowerCase() !== 'cancelado';
      
      console.log('[Appointments] 🔍 Verificando appointment:', {
        appointmentId: appointment.id,
        availabilityId: appointment.availabilityId,
        status: appointment.status,
        matches,
        isActive,
        result: matches && isActive
      });
      
      return matches && isActive;
    });

    console.log('[Appointments] 🔍 Resultado final - isBooked:', isBooked);
    return isBooked;
  }, []);

  const processAvailabilityData = useCallback((
    availabilities: AvailabilityDto.AvailabilitySummary[], 
    appointments: AppointmentDto.AppointmentSummary[]
  ): MonthSchedule[] => {
    console.log('[Appointments] 🔄 === INICIANDO PROCESSAMENTO DE DADOS ===');
    
    // ✅ Usar data local para comparação
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    console.log('[Appointments] 📅 Data de hoje para filtro:', today.toISOString());
    console.log('[Appointments] 📊 Total de availabilities recebidas:', availabilities.length);
    console.log('[Appointments] 📋 Total de appointments recebidos:', appointments.length);
    
    // ✅ Log detalhado dos appointments
    console.log('[Appointments] 📋 APPOINTMENTS DETALHADOS:');
    appointments.forEach((appointment, index) => {
      console.log(`[Appointments] 📋 Appointment ${index + 1}:`, {
        id: appointment.id,
        availabilityId: appointment.availabilityId,
        status: appointment.status,
        date: appointment.appointmentDate,
        doctorName: appointment.doctorName
      });
    });
    
    const groupedByDate = availabilities.reduce((acc, availability) => {
      const slotDate = new Date(availability.slotDateTime);
      const slotDateOnly = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
      const dateKey = slotDateOnly.toISOString().split('T')[0];
      
      console.log('[Appointments] 🔍 Processando availability:', {
        availabilityId: availability.id,
        original: availability.slotDateTime,
        slotDate: slotDate.toISOString(),
        slotDateOnly: slotDateOnly.toISOString(),
        dateKey,
        month: slotDate.getMonth() + 1,
        isValid: slotDateOnly >= today
      });
      
      // ✅ Incluir datas de hoje em diante
      if (slotDateOnly >= today) {
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(availability);
      }
      
      return acc;
    }, {} as Record<string, AvailabilityDto.AvailabilitySummary[]>);

    console.log('[Appointments] 📋 Datas agrupadas:', Object.keys(groupedByDate));

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const fullMonthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    // ✅ Primeiro, criar os dias
    const allDays: DaySchedule[] = [];
    
    Object.entries(groupedByDate).forEach(([dateKey, dayAvailabilities]) => {
      const date = new Date(dateKey + 'T00:00:00');
      const isToday = date.getTime() === today.getTime();
      
      console.log('[Appointments] 📅 Processando dia:', dateKey, 'Total availabilities:', dayAvailabilities.length);
      
      const afternoonSlots: TimeSlot[] = [];
      const eveningSlots: TimeSlot[] = [];
      
      dayAvailabilities.forEach((availability, index) => {
        const slotDate = new Date(availability.slotDateTime);
        const hour = slotDate.getHours();
        
        // ✅ Verificar se este horário já foi agendado passando os appointments como parâmetro
        const isBooked = isTimeSlotBooked(availability.id, appointments);
        
        const timeSlot: TimeSlot = {
          id: availability.id,
          time: slotDate.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          available: !isBooked, // ✅ Não disponível se já foi agendado
          availabilityId: availability.id,
          durationMinutes: availability.durationMinutes,
          isBooked: isBooked // ✅ Marcar se está agendado
        };
        
        console.log(`[Appointments] 🔍 TimeSlot ${index + 1} criado:`, {
          availabilityId: availability.id,
          time: timeSlot.time,
          isBooked,
          available: timeSlot.available,
          hour
        });
        
        // ✅ Classificação manhã/tarde/noite
        if (hour >= 6 && hour < 12) {
          afternoonSlots.push(timeSlot); // Manhã
        } else if (hour >= 12 && hour < 18) {
          afternoonSlots.push(timeSlot); // Tarde
        } else {
          eveningSlots.push(timeSlot); // Noite
        }
      });
      
      const sortSlots = (slots: TimeSlot[]) => 
        slots.sort((a, b) => a.time.localeCompare(b.time));
      
      // ✅ Considerar dia disponível se houver pelo menos um slot disponível
      const hasAvailableSlots = [...afternoonSlots, ...eveningSlots].some(slot => slot.available);
      
      console.log('[Appointments] 📊 Resumo do dia:', {
        date: dateKey,
        totalSlots: afternoonSlots.length + eveningSlots.length,
        availableSlots: [...afternoonSlots, ...eveningSlots].filter(slot => slot.available).length,
        bookedSlots: [...afternoonSlots, ...eveningSlots].filter(slot => slot.isBooked).length,
        hasAvailableSlots
      });
      
      const daySchedule: DaySchedule = {
        date: dateKey,
        displayDate: date.toLocaleDateString('pt-BR'),
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        month: monthNames[date.getMonth()],
        isToday,
        available: hasAvailableSlots, // ✅ Só disponível se tiver slots livres
        afternoonSlots: sortSlots(afternoonSlots),
        eveningSlots: sortSlots(eveningSlots)
      };
      
      allDays.push(daySchedule);
    });

    // ✅ Ordenar dias por data
    const sortedDays = allDays.sort((a, b) => a.date.localeCompare(b.date));
    
    // ✅ Agrupar por mês
    const monthsMap = new Map<string, DaySchedule[]>();
    
    sortedDays.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, []);
      }
      monthsMap.get(monthKey)!.push(day);
    });

    // ✅ Converter para array de MonthSchedule
    const monthsSchedule: MonthSchedule[] = Array.from(monthsMap.entries()).map(([monthKey, days]) => {
      const firstDay = days[0];
      const date = new Date(firstDay.date);
      
      return {
        monthKey,
        monthName: fullMonthNames[date.getMonth()],
        year: date.getFullYear(),
        days
      };
    });

    console.log('[Appointments] 📅 Meses processados:', monthsSchedule.map(m => ({
      monthKey: m.monthKey,
      monthName: m.monthName,
      year: m.year,
      daysCount: m.days.length
    })));
    
    console.log('[Appointments] 🔄 === FIM DO PROCESSAMENTO DE DADOS ===');
    
    return monthsSchedule;
  }, [isTimeSlotBooked]);

  const loadDoctorAndSchedule = useCallback(async () => {
    try {
      setLoading(true);
      
      // ✅ Verificação de autenticação
      if (!isAuthenticated || !session.userId || !session.profileId) {
        console.log('[Appointments] ❌ Usuário não autenticado adequadamente');
        Alert.alert(
          'Sessão Expirada',
          'Sua sessão expirou. Por favor, faça login novamente.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
        return;
      }
      
      // ✅ Verificar se o doctorId foi passado
      const doctorId = params.doctorId as string;
      if (!doctorId) {
        Toast.show({
          type: 'error',
          text1: 'Médico não selecionado',
          text2: 'Você deve selecionar um médico primeiro para agendar'
        });
        router.replace('/(app)/searchDoctor');
        return;
      }

      console.log('[Appointments] 🩺 Carregando horários para o médico ID:', doctorId);
      console.log('[Appointments] 👤 Usuário logado:', session.userId);

      // ✅ Buscar disponibilidades e agendamentos em paralelo
      const [availabilities, appointments] = await Promise.all([
        getAllAvailabilityByDoctorId(doctorId),
        getAllAppointmentsByDoctorIdSummary(doctorId)
      ]);

      console.log('[Appointments] 📊 RESPOSTA BRUTA DA API - Availabilities:', JSON.stringify(availabilities, null, 2));
      console.log('[Appointments] 📋 RESPOSTA BRUTA DA API - Appointments:', JSON.stringify(appointments, null, 2));

      // ✅ Verificar se há horários disponíveis
      if (!availabilities || availabilities.length === 0) {
        console.log('[Appointments] ⚠️ Nenhum horário disponível encontrado');
        Toast.show({
          type: 'info',
          text1: 'Sem horários disponíveis',
          text2: 'Este médico não possui horários disponíveis no momento'
        });
        setMonthsSchedule([]);
        setDoctor(null);
        setBookedAppointments([]);
        return;
      }

      // ✅ Extrair informações do médico da primeira disponibilidade
      const firstAvailability = availabilities[0];
      const doctorInfo: Doctor = {
        id: firstAvailability.doctorId,
        name: firstAvailability.name,
        specialty: firstAvailability.specialty,
        rqe: firstAvailability.rqe,
        image: 'https://via.placeholder.com/80x80'
      };

      console.log('[Appointments] 👨‍⚕️ Informações do médico extraídas:', doctorInfo);
      setDoctor(doctorInfo);
      
      // ✅ IMPORTANTE: Armazenar agendamentos no estado
      setBookedAppointments(appointments || []);
      
      // ✅ Processar disponibilidades com informações de agendamento USANDO OS DADOS DIRETOS
      const processedMonthsSchedule = processAvailabilityData(availabilities, appointments || []);
      setMonthsSchedule(processedMonthsSchedule);
      
      // ✅ Selecionar primeiro mês e primeiro dia disponível
      if (processedMonthsSchedule.length > 0) {
        setCurrentMonthIndex(0);
        const firstMonth = processedMonthsSchedule[0];
        const firstAvailableDay = firstMonth.days.find(day => day.available);
        if (firstAvailableDay && !selectedDate) {
          setSelectedDate(firstAvailableDay.date);
          console.log('[Appointments] 📅 Primeiro dia disponível selecionado:', firstAvailableDay.date);
        }
      }
      
    } catch (error: any) {
      console.error('[Appointments] ❌ Erro ao carregar dados:', error);
      
      // ✅ Tratar erro de autenticação especificamente
      if (error.response?.status === 401) {
        console.log('[Appointments] 🔐 Erro de autenticação - redirecionando para login');
        Alert.alert(
          'Sessão Expirada',
          'Sua sessão expirou. Por favor, faça login novamente para agendar consultas.',
          [{ text: 'Fazer Login', onPress: () => router.replace('/(auth)/login') }]
        );
        return;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar horários',
        text2: error.message || 'Não foi possível carregar os horários disponíveis'
      });
      
      setTimeout(() => {
        router.replace('/(app)/searchDoctor');
      }, 2000);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, session.userId, session.profileId, params.doctorId, processAvailabilityData, selectedDate]);

  const handleBookAppointment = async () => {
    if (!selectedTimeSlot) {
      Toast.show({
        type: 'error',
        text1: 'Horário não selecionado',
        text2: 'Por favor, selecione um horário para agendar'
      });
      return;
    }

    // ✅ Verificar se o horário ainda está disponível usando os dados atuais
    const currentIsBooked = isTimeSlotBooked(selectedTimeSlot.availabilityId, bookedAppointments);
    if (!selectedTimeSlot.available || selectedTimeSlot.isBooked || currentIsBooked) {
      Toast.show({
        type: 'error',
        text1: 'Horário não disponível',
        text2: 'Este horário já foi agendado por outro paciente'
      });
      setSelectedTimeSlot(null); // Limpar seleção
      return;
    }

    // ✅ Verificação de autenticação antes de agendar
    if (!isAuthenticated || !session.profileId) {
      Alert.alert(
        'Sessão Expirada',
        'Sua sessão expirou. Por favor, faça login novamente.',
        [{ text: 'Fazer Login', onPress: () => router.replace('/(auth)/login') }]
      );
      return;
    }

    try {
      setBookingAppointment(true);
      
      const appointmentData = {
        availabilityId: selectedTimeSlot.availabilityId,
        notes: ''
      };

      console.log('[Appointments] 📝 Criando agendamento:', appointmentData);
      console.log('[Appointments] 👤 Patient ID:', session.profileId);

      const createdAppointment = await createAppointment(appointmentData, session.profileId);
      console.log('[Appointments] ✅ Agendamento criado com sucesso:', createdAppointment);

      Toast.show({
        type: 'success',
        text1: 'Agendamento confirmado! 🎉',
        text2: `Consulta marcada para ${getCurrentDaySchedule()?.displayDate} às ${selectedTimeSlot.time}`
      });

      setSelectedTimeSlot(null);
      setSelectedDate('');
      
      // ✅ Recarregar dados para atualizar disponibilidade
      await loadDoctorAndSchedule();
      
      setTimeout(() => {
        router.replace('/(app)/searchDoctor');
      }, 3000);

    } catch (error: any) {
      console.error('[Appointments] ❌ Erro ao criar agendamento:', error);
      
      // ✅ Tratar erro de autenticação no agendamento
      if (error.response?.status === 401) {
        Alert.alert(
          'Sessão Expirada',
          'Sua sessão expirou durante o agendamento. Faça login novamente.',
          [{ text: 'Fazer Login', onPress: () => router.replace('/(auth)/login') }]
        );
        return;
      }
      
      // ✅ Se for erro de horário já agendado, recarregar dados
      if (error.response?.status === 400 || error.message?.includes('já foi agendado')) {
        Toast.show({
          type: 'error',
          text1: 'Horário já foi agendado',
          text2: 'Este horário foi agendado por outro paciente enquanto você estava selecionando.'
        });
        // Recarregar dados para atualizar interface
        await loadDoctorAndSchedule();
        return;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Erro no agendamento',
        text2: error.message || 'Não foi possível agendar a consulta. Tente novamente.'
      });
    } finally {
      setBookingAppointment(false);
    }
  };

  const getCurrentDaySchedule = () => {
    if (monthsSchedule.length === 0) return null;
    const currentMonth = monthsSchedule[currentMonthIndex];
    return currentMonth?.days.find(day => day.date === selectedDate);
  };

  const getCurrentMonth = () => {
    if (monthsSchedule.length === 0) return null;
    return monthsSchedule[currentMonthIndex];
  };

  const handlePreviousMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1);
      setSelectedDate(''); // Limpar seleção de data
      setSelectedTimeSlot(null); // Limpar seleção de horário
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < monthsSchedule.length - 1) {
      setCurrentMonthIndex(currentMonthIndex + 1);
      setSelectedDate(''); // Limpar seleção de data
      setSelectedTimeSlot(null); // Limpar seleção de horário
    }
  };

  const renderTimeSlot = (slot: TimeSlot) => (
    <TouchableOpacity
      key={slot.id}
      style={[
        styles.timeSlot,
        !slot.available && styles.timeSlotDisabled,
        slot.isBooked && styles.timeSlotBooked, // ✅ Novo estilo para agendados
        selectedTimeSlot?.id === slot.id && styles.timeSlotSelected
      ]}
      onPress={() => {
        if (slot.available && !slot.isBooked) {
          setSelectedTimeSlot(slot);
        } else {
          // ✅ Mostrar feedback quando tentar selecionar horário ocupado
          Toast.show({
            type: 'info',
            text1: 'Horário não disponível',
            text2: slot.isBooked ? 'Este horário já foi agendado' : 'Horário não disponível'
          });
        }
      }}
      disabled={!slot.available || slot.isBooked}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.timeSlotText,
        !slot.available && styles.timeSlotTextDisabled,
        slot.isBooked && styles.timeSlotTextBooked, // ✅ Novo estilo para texto
        selectedTimeSlot?.id === slot.id && styles.timeSlotTextSelected
      ]}>
        {slot.time}
      </Text>
      <Text style={[
        styles.timeSlotDuration,
        !slot.available && styles.timeSlotTextDisabled,
        slot.isBooked && styles.timeSlotTextBooked, // ✅ Novo estilo para duração
        selectedTimeSlot?.id === slot.id && styles.timeSlotTextSelected
      ]}>
        {slot.durationMinutes}min
      </Text>
      
      {/* ✅ Ícone para horários agendados */}
      {slot.isBooked && (
        <View style={styles.bookedIndicator}>
          <Ionicons name="person" size={12} color="#666" />
        </View>
      )}
    </TouchableOpacity>
  );

  // ✅ Estado de carregamento de autenticação
  if (status === 'pending') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Verificando autenticação...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Estado de loading de dados
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

  const currentMonth = getCurrentMonth();
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
        {/* ✅ Informações do Médico */}
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

        {/* ✅ Seleção de Mês e Data */}
        {currentMonth && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Selecione a Data</Text>
            
            {/* ✅ Navegação entre meses */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity 
                style={[styles.monthNavButton, currentMonthIndex === 0 && styles.monthNavButtonDisabled]}
                onPress={handlePreviousMonth}
                disabled={currentMonthIndex === 0}
              >
                <Ionicons 
                  name="chevron-back" 
                  size={20} 
                  color={currentMonthIndex === 0 ? COLORS.placeholder : COLORS.primary} 
                />
              </TouchableOpacity>
              
              <View style={styles.monthDisplay}>
                <Text style={styles.monthYearText}>
                  {currentMonth.monthName} {currentMonth.year}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.monthNavButton, currentMonthIndex === monthsSchedule.length - 1 && styles.monthNavButtonDisabled]}
                onPress={handleNextMonth}
                disabled={currentMonthIndex === monthsSchedule.length - 1}
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={currentMonthIndex === monthsSchedule.length - 1 ? COLORS.placeholder : COLORS.primary} 
                />
              </TouchableOpacity>
            </View>

            {/* ✅ Seletor de dias do mês atual */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelector}>
              {currentMonth.days.map((day) => (
                <TouchableOpacity
                  key={day.date}
                  style={[
                    styles.modernDateOption,
                    !day.available && styles.modernDateOptionDisabled,
                    selectedDate === day.date && styles.modernDateOptionSelected
                  ]}
                  onPress={() => {
                    if (day.available) {
                      setSelectedDate(day.date);
                      setSelectedTimeSlot(null); // Limpar horário quando mudar data
                    }
                  }}
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
        )}

        {/* ✅ Data Selecionada */}
        {currentSchedule && (
          <View style={styles.selectedDateContainer}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.selectedDateText}>
              {currentSchedule.isToday ? 'Hoje' : currentSchedule.displayDate}
            </Text>
          </View>
        )}

        {/* ✅ Legenda de Status */}
        {currentSchedule && currentSchedule.available && (
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.white, borderColor: COLORS.border, borderWidth: 2 }]} />
              <Text style={styles.legendText}>Disponível</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E0E0E0' }]} />
              <Text style={styles.legendText}>Agendado</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Selecionado</Text>
            </View>
          </View>
        )}

        {/* ✅ Horários Disponíveis */}
        {currentSchedule && currentSchedule.available && (
          <>
            {currentSchedule.afternoonSlots.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="sunny-outline" size={16} color={COLORS.primary} /> 
                  {' '}Manhã/Tarde • {currentSchedule.afternoonSlots.filter(slot => slot.available).length}/{currentSchedule.afternoonSlots.length} disponíveis
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
                  {' '}Noite • {currentSchedule.eveningSlots.filter(slot => slot.available).length}/{currentSchedule.eveningSlots.length} disponíveis
                </Text>
                <View style={styles.timeSlotsGrid}>
                  {currentSchedule.eveningSlots.map(renderTimeSlot)}
                </View>
              </View>
            )}
          </>
        )}

        {/* ✅ Estado Vazio */}
        {monthsSchedule.length === 0 && !loading && (
          <View style={styles.noSlotsContainer}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.placeholder} />
            <Text style={styles.noSlotsTitle}>Nenhum horário disponível</Text>
            <Text style={styles.noSlotsText}>
              Este médico não possui horários disponíveis no momento.
              Tente novamente mais tarde ou escolha outro profissional.
            </Text>
            <TouchableOpacity 
              style={styles.backToSearchButton}
              onPress={() => router.replace('/(app)/searchDoctor')}
            >
              <Text style={styles.backToSearchText}>Voltar à Busca</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ✅ Resumo do Agendamento */}
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

      {/* ✅ Footer com Botão de Confirmação */}
      {currentSchedule?.available && (
        <View style={styles.footer}>
          <CustomButton
            title={bookingAppointment ? 'Confirmando Agendamento...' : 'Confirmar Agendamento'}
            onPress={handleBookAppointment}
            disabled={!selectedTimeSlot || bookingAppointment || selectedTimeSlot?.isBooked}
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
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  monthNavButtonDisabled: {
    backgroundColor: '#F8F8F8',
    borderColor: '#E8E8E8',
  },
  monthDisplay: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    flex: 1,
    marginHorizontal: 16,
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
  // ✅ Nova seção de legenda
  legendContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
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
    position: 'relative', // ✅ Para posicionar o ícone
  },
  timeSlotDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    elevation: 0,
  },
  // ✅ Novo estilo para horários agendados
  timeSlotBooked: {
    backgroundColor: '#E0E0E0',
    borderColor: '#BDBDBD',
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
  // ✅ Novo estilo para texto de horários agendados
  timeSlotTextBooked: {
    color: '#666666',
  },
  timeSlotTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  // ✅ Indicador para horários agendados
  bookedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    padding: 2,
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
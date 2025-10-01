import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { AppointmentCard } from "../../src/components/AppointmentCard";
import { HeaderDoctor } from "../../src/components/HeaderDoctor";
import { DOCTOR_THEME } from "../../src/constants/theme";
import { useAuth } from "../../src/context/AuthContext";
import { getDoctorByIdDetail } from "../../src/api/services/doctor";
import { getAppointmentsByDoctorId } from "../../src/api/services/appointment";
import { AppointmentDto } from "../../src/api/models/appointment";
import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';

// ✅ Interface para os agendamentos formatados
interface FormattedAppointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: string;
  duration: number;
  notes: string;
  clientId: string;
  availabilityId: string;
}

export default function HomeDoctor() {
  const { session, isAuthenticated } = useAuth();
  const [userName, setUserName] = useState("Doutor");
  const [appointments, setAppointments] = useState<FormattedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Função para formatar data/hora
  const formatAppointmentDateTime = (appointmentDate: string) => {
    const date = new Date(appointmentDate);
    const dateStr = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return { date: dateStr, time: timeStr };
  };

  // ✅ Função para traduzir status
  const translateStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'scheduled': 'agendado',
      'confirmed': 'confirmado',
      'completed': 'concluído',
      'cancelled': 'cancelado',
      'rescheduled': 'reagendado',
      'no_show': 'não compareceu'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  // ✅ Carregar dados do médico
  const loadDoctorData = async () => {
    if (!isAuthenticated || session.role !== "doctor" || !session.profileId) {
      setUserName("Doutor");
      return;
    }

    try {
      const doctorData = await getDoctorByIdDetail(session.profileId);
      setUserName(doctorData.name.split(" ")[0]);
      console.log('[DoctorHome] ✅ Dados do médico carregados:', doctorData.name);
    } catch (error) {
      console.error("[DoctorHome] ❌ Erro ao carregar dados do médico:", error);
      setUserName("Doutor");
    }
  };

  // ✅ Carregar agendamentos do médico
  const loadAppointments = async () => {
    if (!isAuthenticated || session.role !== "doctor" || !session.profileId) {
      console.log('[DoctorHome] ⚠️ Usuário não autenticado ou não é médico');
      setAppointments([]);
      return;
    }

    try {
      console.log('[DoctorHome] 📅 Buscando agendamentos do médico:', session.profileId);
      
      const appointmentsData = await getAppointmentsByDoctorId(session.profileId);
      console.log('[DoctorHome] ✅ Agendamentos recebidos:', appointmentsData.length);

      if (!appointmentsData || appointmentsData.length === 0) {
        console.log('[DoctorHome] ℹ️ Nenhum agendamento encontrado');
        setAppointments([]);
        return;
      }

      // ✅ Formatar dados para exibição
      const formattedAppointments: FormattedAppointment[] = appointmentsData.map((appointment: AppointmentDto.AppointmentDetails) => {
        const { date, time } = formatAppointmentDateTime(appointment.appointmentDate);
        
        return {
          id: appointment.id,
          patientName: appointment.clientName,
          date: date,
          time: time,
          status: translateStatus(appointment.status),
          duration: appointment.duration,
          notes: appointment.notes || '',
          clientId: appointment.clientId,
          availabilityId: appointment.availabilityId
        };
      });

      // ✅ Ordenar por data (mais próximos primeiro)
      const sortedAppointments = formattedAppointments.sort((a, b) => {
        const dateA = new Date(`${a.date.split('/').reverse().join('-')} ${a.time}`);
        const dateB = new Date(`${b.date.split('/').reverse().join('-')} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });

      setAppointments(sortedAppointments);
      console.log('[DoctorHome] ✅ Agendamentos formatados e ordenados:', sortedAppointments.length);

    } catch (error: any) {
      console.error("[DoctorHome] ❌ Erro ao carregar agendamentos:", error);
      
      let errorMessage = 'Não foi possível carregar os agendamentos';
      
      if (error.response?.status === 404) {
        errorMessage = 'Nenhum agendamento encontrado';
        setAppointments([]);
      } else if (error.response?.status === 403) {
        errorMessage = 'Você não tem permissão para ver estes agendamentos';
      }
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar agendamentos',
        text2: errorMessage
      });
    }
  };

  // ✅ Função para refresh manual
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDoctorData(),
      loadAppointments()
    ]);
    setRefreshing(false);
  };

  // ✅ Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        loadDoctorData(),
        loadAppointments()
      ]);
      setLoading(false);
    };

    loadInitialData();
  }, [isAuthenticated, session.profileId, session.role]);

  // ✅ Renderizar item de agendamento
  const renderAppointmentItem = ({ item }: { item: FormattedAppointment }) => (
    <AppointmentCard appointment={item} />
  );

  // ✅ Renderizar estado vazio
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Nenhum agendamento</Text>
      <Text style={styles.emptyText}>
        Você não possui consultas agendadas no momento.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <HeaderDoctor
          userName={userName}
          onNotificationsPress={() => {}}
          hasUnreadNotifications={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DOCTOR_THEME.primary} />
          <Text style={styles.loadingText}>Carregando agendamentos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} /> 
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <HeaderDoctor
          userName={userName}
          onNotificationsPress={() => {}}
          hasUnreadNotifications={false}
        />

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Consultas Agendadas</Text>
            <Text style={styles.subtitle}>
              {appointments.length} {appointments.length === 1 ? 'consulta' : 'consultas'}
            </Text>
          </View>

          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={renderAppointmentItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={appointments.length === 0 ? styles.emptyContentContainer : undefined}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[DOCTOR_THEME.primary]}
                tintColor={DOCTOR_THEME.primary}
              />
            }
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DOCTOR_THEME.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: DOCTOR_THEME.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: DOCTOR_THEME.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: DOCTOR_THEME.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DOCTOR_THEME.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: DOCTOR_THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

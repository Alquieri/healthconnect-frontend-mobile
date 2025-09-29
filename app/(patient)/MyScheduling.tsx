import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SIZES } from '../../src/constants/theme';
import { HEADER_CONSTANTS } from '../../src/constants/layout';
import { getAppointmentsByPatientId, updateAppointment } from '../../src/api/services/appointment';
import { AppointmentDto } from '../../src/api/models/appointment';

// --- INTERFACES ---
interface AppointmentDisplay extends AppointmentDto.AppointmentDetails {
  displayDate: string;
  displayTime: string;
  statusColor: string;
  statusText: string;
  canCancel: boolean;
  canReschedule: boolean;
}

// --- COMPONENTES ---
// ✅ Corrigir tipo do StatusBadge
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch(status.toLowerCase()) {
      case 'scheduled':
      case 'agendado':
        return { text: 'Agendado', color: COLORS.primary, bgColor: COLORS.primary + '20' };
      case 'confirmed':
        return { text: 'Confirmado', color: '#2196F3', bgColor: '#2196F320' };
      case 'completed':
        return { text: 'Concluído', color: '#4CAF50', bgColor: '#4CAF5020' };
      case 'cancelled':
        return { text: 'Cancelado', color: COLORS.error, bgColor: COLORS.error + '20' };
      default:
        return { text: 'Agendado', color: COLORS.primary, bgColor: COLORS.primary + '20' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
      <Text style={[styles.statusText, { color: config.color }]}>
        {config.text}
      </Text>
    </View>
  );
};

const FilterButton: React.FC<{
  title: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.filterButton, isActive && styles.activeFilterButton]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.filterButtonText, isActive && styles.activeFilterButtonText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

// --- COMPONENTE PRINCIPAL ---
export default function MySchedulingScreen() {
  const router = useRouter();
  const { session, isAuthenticated } = useAuth();
  
  const [appointments, setAppointments] = useState<AppointmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  // ✅ Função para determinar status e cor baseado na resposta da API
  const processAppointmentStatus = (appointment: AppointmentDto.AppointmentDetails, appointmentDate: Date, now: Date) => {
    const status = appointment.status?.toLowerCase() || '';
    let statusColor = COLORS.textSecondary;
    let statusText = 'Desconhecido';
    let canCancel = false;
    let canReschedule = false;

    // Verificar se a consulta já passou
    const isPast = appointmentDate < now;

    switch (status) {
      case 'scheduled':
      case 'agendado':
      case 'confirmed':
        if (isPast) {
          statusColor = COLORS.textSecondary;
          statusText = 'Expirado';
          canCancel = false;
          canReschedule = false;
        } else {
          statusColor = COLORS.primary;
          statusText = 'Agendado';
          canCancel = true;
          canReschedule = true;
        }
        break;
        
      case 'completed':
      case 'concluído':
      case 'finalizado':
      case 'finished':
        statusColor = COLORS.success || '#4CAF50';
        statusText = 'Concluído';
        canCancel = false;
        canReschedule = false;
        break;
        
      case 'cancelled':
      case 'cancelado':
      case 'canceled':
        statusColor = COLORS.error;
        statusText = 'Cancelado';
        canCancel = false;
        canReschedule = false;
        break;
        
      case 'no-show':
      case 'falta':
      case 'missed':
        statusColor = COLORS.warning || '#FF9800';
        statusText = 'Paciente Faltou';
        canCancel = false;
        canReschedule = false;
        break;
        
      case 'rescheduled':
      case 'reagendado':
        statusColor = COLORS.info || '#2196F3';
        statusText = 'Reagendado';
        canCancel = false;
        canReschedule = false;
        break;
        
      default:
        statusColor = COLORS.textSecondary;
        statusText = status || 'Status Desconhecido';
        canCancel = !isPast;
        canReschedule = !isPast;
    }

    return { statusColor, statusText, canCancel, canReschedule };
  };

  // ✅ Carregar agendamentos da API
  const loadAppointments = useCallback(async (showRefreshIndicator = false) => {
    if (!session.userId) {
      Alert.alert('Erro', 'Usuário não identificado');
      return;
    }

    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('[MyScheduling] 📅 Buscando agendamentos do usuário:', session.userId);
      
      // ✅ Usar getAppointmentsByPatientId com session.userId
      const appointmentsData = await getAppointmentsByPatientId(session.userId);
      
      console.log('[MyScheduling] ✅ Agendamentos recebidos:', appointmentsData.length);
      
      if (!appointmentsData || appointmentsData.length === 0) {
        console.log('[MyScheduling] ℹ️ Nenhum agendamento encontrado');
        setAppointments([]);
        return;
      }

      const now = new Date();
      
      // ✅ Processar dados para exibição
      const processedAppointments: AppointmentDisplay[] = appointmentsData.map((appointment) => {
        const appointmentDate = new Date(appointment.appointmentDate);
        
        // Processar status
        const { statusColor, statusText, canCancel, canReschedule } = processAppointmentStatus(
          appointment, 
          appointmentDate, 
          now
        );

        return {
          ...appointment,
          displayDate: appointmentDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }),
          displayTime: appointmentDate.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          statusColor,
          statusText,
          canCancel,
          canReschedule
        };
      });

      // Ordenar por data (mais recentes primeiro)
      const sortedAppointments = processedAppointments.sort((a, b) => {
        const dateA = new Date(a.appointmentDate);
        const dateB = new Date(b.appointmentDate);
        return dateB.getTime() - dateA.getTime();
      });

      setAppointments(sortedAppointments);
      
    } catch (error: any) {
      console.error('[MyScheduling] ❌ Erro ao carregar agendamentos:', error);
      
      let errorMessage = 'Não foi possível carregar seus agendamentos';
      
      if (error.response?.status === 404) {
        errorMessage = 'Nenhum agendamento encontrado';
        setAppointments([]);
      } else if (error.response?.status === 403) {
        errorMessage = 'Você não tem permissão para ver estes agendamentos';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar agendamentos',
        text2: errorMessage
      });
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session.userId]);

  // Filtrar agendamentos
  const filteredAppointments = React.useMemo(() => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= now && ['scheduled', 'agendado', 'confirmed'].includes(apt.status.toLowerCase());
        });
      case 'past':
        return appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate < now || !['scheduled', 'agendado', 'confirmed'].includes(apt.status.toLowerCase());
        });
      default:
        return appointments;
    }
  }, [appointments, filter]);

  // Carregar na inicialização
  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert('Acesso Negado', 'Você precisa estar logado para ver seus agendamentos.');
      router.back();
      return;
    }
    loadAppointments();
  }, [isAuthenticated, loadAppointments]);

  // ✅ Cancelar agendamento usando updateAppointment
  const handleCancelAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Cancelar Agendamento',
      'Tem certeza de que deseja cancelar este agendamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[MyScheduling] 🗑️ Cancelando agendamento:', appointmentId);
              
              // ✅ Usar updateAppointment para alterar status
              await updateAppointment(appointmentId, { 
                // Mantém os dados originais, só altera status
                notes: 'Agendamento cancelado pelo paciente'
              });
              
              Toast.show({
                type: 'success',
                text1: 'Agendamento cancelado',
                text2: 'Seu agendamento foi cancelado com sucesso'
              });
              
              // Recarregar lista
              loadAppointments();
              
            } catch (error: any) {
              console.error('[MyScheduling] ❌ Erro ao cancelar:', error);
              Toast.show({
                type: 'error',
                text1: 'Erro ao cancelar',
                text2: error.message || 'Não foi possível cancelar o agendamento'
              });
            }
          }
        }
      ]
    );
  };

  // Reagendar (navegar para appointments)
  const handleRescheduleAppointment = (appointment: AppointmentDisplay) => {
    router.push({
      pathname: '/(public)/appointments',
      params: { 
        doctorId: appointment.doctorId,
        reschedule: 'true',
        originalAppointmentId: appointment.id
      }
    });
  };

  // Renderizar item de agendamento
  const renderAppointmentItem = ({ item }: { item: AppointmentDisplay }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>Dr. {item.doctorName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: item.statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: item.statusColor }]}>
              {item.statusText}
            </Text>
          </View>
        </View>
        
        {item.canCancel && (
          <TouchableOpacity
            onPress={() => handleCancelAppointment(item.id)}
            style={styles.cancelButton}
          >
            <Ionicons name="close-circle" size={24} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.displayDate}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.displayTime}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="hourglass" size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.duration} minutos</Text>
        </View>
      </View>

      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Observações:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}

      {/* Botões de ação */}
      <View style={styles.actionButtons}>
        {item.statusText === 'Concluído' && (
          <TouchableOpacity style={styles.reviewButton}>
            <Ionicons name="star-outline" size={16} color={COLORS.primary} />
            <Text style={styles.reviewButtonText}>Avaliar</Text>
          </TouchableOpacity>
        )}
        
        {item.canReschedule && (
          <TouchableOpacity 
            style={styles.rescheduleButton}
            onPress={() => handleRescheduleAppointment(item)}
          >
            <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
            <Text style={styles.rescheduleButtonText}>Reagendar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Renderizar filtros
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {['upcoming', 'past', 'all'].map((filterType) => (
        <TouchableOpacity
          key={filterType}
          style={[
            styles.filterButton,
            filter === filterType && styles.activeFilterButton
          ]}
          onPress={() => setFilter(filterType as any)}
        >
          <Text style={[
            styles.filterButtonText,
            filter === filterType && styles.activeFilterButtonText
          ]}>
            {filterType === 'upcoming' ? 'Próximos' : 
             filterType === 'past' ? 'Histórico' : 'Todos'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Estado de loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        
        {/* ✅ Header customizado padronizado */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meus Agendamentos</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando seus agendamentos...</Text>
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
        <Text style={styles.headerTitle}>Meus Agendamentos</Text>
        <View style={styles.headerRight} />
      </View>

      {renderFilters()}

      <FlatList
        data={filteredAppointments}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAppointments(true)}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.placeholder} />
            <Text style={styles.emptyTitle}>
              {filter === 'upcoming' ? 'Nenhum agendamento próximo' :
               filter === 'past' ? 'Nenhum histórico encontrado' :
               'Nenhum agendamento encontrado'}
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'upcoming' ? 
               'Você não possui consultas agendadas no momento.' :
               filter === 'past' ?
               'Você ainda não teve consultas anteriores.' :
               'Você ainda não possui agendamentos.'}
            </Text>
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={() => router.push('/(public)/searchDoctor')}
            >
              <Text style={styles.scheduleButtonText}>Agendar Consulta</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  
  // Loading
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

  // Filters
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.containerPadding,
    paddingVertical: SIZES.medium,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    marginHorizontal: SIZES.tiny,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },

  // List
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: SIZES.containerPadding,
    paddingVertical: SIZES.medium,
  },

  // Appointment Card
  appointmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    padding: SIZES.large,
    marginBottom: SIZES.medium,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.medium,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.tiny,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.tiny,
    borderRadius: SIZES.radius,
  },
  statusText: {
    fontSize: SIZES.xSmall,
    fontWeight: '600',
  },
  cancelButton: {
    padding: SIZES.tiny,
  },

  // Details
  appointmentDetails: {
    marginBottom: SIZES.medium,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  detailText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    marginLeft: SIZES.small,
  },

  // Notes
  notesContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.medium,
    marginBottom: SIZES.medium,
  },
  notesLabel: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.tiny,
  },
  notesText: {
    fontSize: SIZES.font,
    color: COLORS.text,
    lineHeight: SIZES.large,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SIZES.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
  },
  reviewButtonText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SIZES.tiny,
  },
  rescheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.radius,
  },
  rescheduleButtonText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SIZES.tiny,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.width * 0.2,
  },
  emptyTitle: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SIZES.large,
    marginBottom: SIZES.small,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: SIZES.large,
    marginBottom: SIZES.large,
  },
  scheduleButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.radius,
  },
  scheduleButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
});

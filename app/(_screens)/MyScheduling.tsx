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
  isPast: boolean;
  isToday: boolean;
  timeUntil?: string;
}

type FilterType = 'all' | 'upcoming' | 'today' | 'past' | 'cancelled';

// --- COMPONENTES ---
const StatusBadge: React.FC<{ 
  status: string; 
  color: string; 
  backgroundColor: string;
  isToday?: boolean;
}> = ({ status, color, backgroundColor, isToday }) => (
  <View style={[
    styles.statusBadge, 
    { backgroundColor },
    isToday && styles.todayBadge
  ]}>
    {isToday && <Ionicons name="time" size={12} color={color} style={{ marginRight: 4 }} />}
    <Text style={[styles.statusText, { color }]}>
      {status}
    </Text>
  </View>
);

const FilterButton: React.FC<{
  title: string;
  isActive: boolean;
  onPress: () => void;
  count?: number;
}> = ({ title, isActive, onPress, count }) => (
  <TouchableOpacity
    style={[styles.filterButton, isActive && styles.activeFilterButton]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={[styles.filterButtonText, isActive && styles.activeFilterButtonText]}>
      {title}
    </Text>
    {count !== undefined && count > 0 && (
      <View style={[styles.countBadge, isActive && styles.activeCountBadge]}>
        <Text style={[styles.countText, isActive && styles.activeCountText]}>
          {count}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

const AppointmentCard: React.FC<{
  item: AppointmentDisplay;
  onCancel: (id: string) => void;
  onReschedule: (appointment: AppointmentDisplay) => void;
  onViewDetails: (appointment: AppointmentDisplay) => void;
}> = ({ item, onCancel, onReschedule, onViewDetails }) => (
  <TouchableOpacity 
    style={[
      styles.appointmentCard,
      item.isToday && styles.todayCard,
      item.status.toLowerCase() === 'cancelled' && styles.cancelledCard
    ]}
    onPress={() => onViewDetails(item)}
    activeOpacity={0.7}
  >
    {/* Header do Card */}
    <View style={styles.cardHeader}>
      <View style={styles.doctorSection}>
        <View style={styles.doctorAvatar}>
          <Ionicons name="person" size={20} color={COLORS.white} />
        </View>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName} numberOfLines={1}>
            Dr. {item.doctorName}
          </Text>
          <Text style={styles.doctorSpecialty} numberOfLines={1}>
            {item.specialty || 'Especialidade'}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardActions}>
        <StatusBadge
          status={item.statusText}
          color={item.statusColor}
          backgroundColor={item.statusColor + '20'}
          isToday={item.isToday}
        />
        {item.canCancel && (
          <TouchableOpacity
            onPress={() => onCancel(item.id)}
            style={styles.quickCancelButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>

    {/* Informações principais */}
    <View style={styles.appointmentInfo}>
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>{item.displayDate}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>{item.displayTime}</Text>
        </View>
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="hourglass" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>{item.duration || 30} min</Text>
        </View>
        {item.timeUntil && (
          <View style={styles.infoItem}>
            <Ionicons name="alarm" size={16} color={COLORS.warning} />
            <Text style={[styles.infoText, { color: COLORS.warning }]}>
              {item.timeUntil}
            </Text>
          </View>
        )}
      </View>
    </View>

    {/* Notas (se houver) */}
    {item.notes && (
      <View style={styles.notesPreview}>
        <Ionicons name="document-text" size={14} color={COLORS.textSecondary} />
        <Text style={styles.notesText} numberOfLines={2}>
          {item.notes}
        </Text>
      </View>
    )}

    {/* Botões de ação */}
    {(item.canReschedule || item.statusText === 'Concluído') && (
      <View style={styles.cardFooter}>
        {item.statusText === 'Concluído' && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="star-outline" size={16} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Avaliar</Text>
          </TouchableOpacity>
        )}
        
        {item.canReschedule && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={() => onReschedule(item)}
          >
            <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
            <Text style={[styles.actionButtonText, styles.primaryActionText]}>
              Reagendar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    )}
  </TouchableOpacity>
);

export default function MySchedulingScreen() {
  const router = useRouter();
  const { session, isAuthenticated } = useAuth();
  
  const [appointments, setAppointments] = useState<AppointmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('upcoming');

  // Função para calcular tempo até o agendamento
  const calculateTimeUntil = (appointmentDate: Date): string => {
    const now = new Date();
    const diff = appointmentDate.getTime() - now.getTime();
    
    if (diff <= 0) return '';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `em ${days}d`;
    if (hours > 0) return `em ${hours}h`;
    return `em ${minutes}min`;
  };

  const processAppointmentStatus = (appointment: AppointmentDto.AppointmentDetails, appointmentDate: Date, now: Date) => {
    const status = appointment.status?.toLowerCase() || '';
    let statusColor = COLORS.textSecondary;
    let statusText = 'Desconhecido';
    let canCancel = false;
    let canReschedule = false;

    const isPast = appointmentDate < now;
    const isToday = appointmentDate.toDateString() === now.toDateString();
    const timeUntil = !isPast ? calculateTimeUntil(appointmentDate) : '';

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
          statusText = isToday ? 'Hoje' : 'Agendado';
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
        statusText = 'Faltou';
        canCancel = false;
        canReschedule = true;
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

    return { statusColor, statusText, canCancel, canReschedule, isPast, isToday, timeUntil };
  };

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

      console.log('[MyScheduling] 📅 Buscando agendamentos do usuário:', session.profileId);
      
      const appointmentsData = await getAppointmentsByPatientId(session.profileId);
      
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
        const { statusColor, statusText, canCancel, canReschedule, isPast, isToday, timeUntil } = processAppointmentStatus(
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
          canReschedule,
          isPast,
          isToday,
          timeUntil
        };
      });

      // Ordenar por data (próximos primeiro, depois passados)
      const sortedAppointments = processedAppointments.sort((a, b) => {
        const dateA = new Date(a.appointmentDate);
        const dateB = new Date(b.appointmentDate);
        
        // Agendamentos futuros primeiro (mais próximos primeiro)
        if (!a.isPast && !b.isPast) {
          return dateA.getTime() - dateB.getTime();
        }
        
        // Agendamentos passados por último (mais recentes primeiro)
        if (a.isPast && b.isPast) {
          return dateB.getTime() - dateA.getTime();
        }
        
        // Futuros sempre antes dos passados
        return a.isPast ? 1 : -1;
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

  // Filtrar agendamentos e contar
  const { filteredAppointments, filterCounts } = React.useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    
    const counts = {
      all: appointments.length,
      upcoming: 0,
      today: 0,
      past: 0,
      cancelled: 0
    };

    const filtered = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      const isUpcoming = aptDate >= now && ['scheduled', 'agendado', 'confirmed'].includes(apt.status.toLowerCase());
      const isToday = aptDate.toDateString() === today && ['scheduled', 'agendado', 'confirmed'].includes(apt.status.toLowerCase());
      const isPast = aptDate < now || ['completed', 'concluído', 'finished', 'no-show', 'falta', 'missed'].includes(apt.status.toLowerCase());
      const isCancelled = ['cancelled', 'cancelado', 'canceled'].includes(apt.status.toLowerCase());

      if (isUpcoming) counts.upcoming++;
      if (isToday) counts.today++;
      if (isPast) counts.past++;
      if (isCancelled) counts.cancelled++;

      switch (filter) {
        case 'upcoming':
          return isUpcoming && !isToday;
        case 'today':
          return isToday;
        case 'past':
          return isPast;
        case 'cancelled':
          return isCancelled;
        default:
          return true;
      }
    });

    return { filteredAppointments: filtered, filterCounts: counts };
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

  // ✅ Cancelar agendamento
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
              
              await updateAppointment(appointmentId, { 
                notes: 'Agendamento cancelado pelo paciente'
              });
              
              Toast.show({
                type: 'success',
                text1: 'Agendamento cancelado',
                text2: 'Seu agendamento foi cancelado com sucesso'
              });
              
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

  // Reagendar
  const handleRescheduleAppointment = (appointment: AppointmentDisplay) => {
    router.push({
      pathname: '/appointments',
      params: { 
        doctorId: appointment.doctorId,
        reschedule: 'true',
        originalAppointmentId: appointment.id
      }
    });
  };

  // Ver detalhes do agendamento
  const handleViewDetails = (appointment: AppointmentDisplay) => {
    // Aqui você pode navegar para uma tela de detalhes
    console.log('Ver detalhes do agendamento:', appointment.id);
  };

  // Renderizar filtros
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filtersRow}>
        <FilterButton
          title="Próximos"
          isActive={filter === 'upcoming'}
          onPress={() => setFilter('upcoming')}
          count={filterCounts.upcoming}
        />
        <FilterButton
          title="Hoje"
          isActive={filter === 'today'}
          onPress={() => setFilter('today')}
          count={filterCounts.today}
        />
        <FilterButton
          title="Histórico"
          isActive={filter === 'past'}
          onPress={() => setFilter('past')}
          count={filterCounts.past}
        />
        <FilterButton
          title="Cancelados"
          isActive={filter === 'cancelled'}
          onPress={() => setFilter('cancelled')}
          count={filterCounts.cancelled}
        />
      </View>
    </View>
  );

  // Estado de loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        
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
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Agendamentos</Text>
        <TouchableOpacity onPress={() => loadAppointments(true)} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      {renderFilters()}

      {/* Lista de agendamentos */}
      <FlatList
        data={filteredAppointments}
        renderItem={({ item }) => (
          <AppointmentCard
            item={item}
            onCancel={handleCancelAppointment}
            onReschedule={handleRescheduleAppointment}
            onViewDetails={handleViewDetails}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAppointments(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons 
                name={
                  filter === 'today' ? 'calendar-clear' :
                  filter === 'cancelled' ? 'close-circle' :
                  filter === 'past' ? 'time' :
                  'calendar-outline'
                } 
                size={64} 
                color={COLORS.placeholder} 
              />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'upcoming' ? 'Nenhum agendamento próximo' :
               filter === 'today' ? 'Nenhum agendamento hoje' :
               filter === 'past' ? 'Nenhum histórico encontrado' :
               filter === 'cancelled' ? 'Nenhum agendamento cancelado' :
               'Nenhum agendamento encontrado'}
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'upcoming' ? 
               'Você não possui consultas agendadas no momento.' :
               filter === 'today' ?
               'Você não tem consultas marcadas para hoje.' :
               filter === 'past' ?
               'Você ainda não teve consultas anteriores.' :
               filter === 'cancelled' ?
               'Você não tem agendamentos cancelados.' :
               'Você ainda não possui agendamentos.'}
            </Text>
            
            {(filter === 'upcoming' || filter === 'today' || filter === 'all') && (
              <TouchableOpacity
                style={styles.scheduleButton}
                onPress={() => router.push('/searchDoctor')}
              >
                <Ionicons name="add" size={20} color={COLORS.white} />
                <Text style={styles.scheduleButtonText}>Agendar Consulta</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// --- ESTILOS REFORMADOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header
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
  refreshButton: {
    padding: SIZES.tiny,
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SIZES.containerPadding,
    paddingVertical: SIZES.medium,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.tiny,
    marginHorizontal: 2,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.background,
    minHeight: 36,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: SIZES.xSmall,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeFilterButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  countBadge: {
    marginLeft: 4,
    backgroundColor: COLORS.textSecondary + '30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  activeCountBadge: {
    backgroundColor: COLORS.white + '30',
  },
  countText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeCountText: {
    color: COLORS.white,
  },

  // List
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: SIZES.containerPadding,
    paddingVertical: SIZES.medium,
  },

  // Cards reformados
  appointmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    marginBottom: SIZES.medium,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  todayCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  cancelledCard: {
    opacity: 0.7,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.large,
    paddingBottom: SIZES.medium,
  },
  doctorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.medium,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: SIZES.font,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.small,
  },

  // Status Badge reformado
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.small,
    paddingVertical: 4,
    borderRadius: SIZES.radius,
  },
  todayBadge: {
    paddingHorizontal: SIZES.small - 2,
  },
  statusText: {
    fontSize: SIZES.xSmall,
    fontWeight: '600',
  },
  quickCancelButton: {
    padding: 2,
  },

  // Appointment Info
  appointmentInfo: {
    paddingHorizontal: SIZES.large,
    paddingBottom: SIZES.medium,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.small,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: SIZES.small,
    color: COLORS.text,
    marginLeft: SIZES.tiny,
    fontWeight: '500',
  },

  // Notes Preview
  notesPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    margin: SIZES.large,
    marginTop: 0,
    padding: SIZES.medium,
    borderRadius: SIZES.radius,
  },
  notesText: {
    fontSize: SIZES.small,
    color: COLORS.text,
    marginLeft: SIZES.small,
    flex: 1,
    lineHeight: 18,
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SIZES.large,
    paddingBottom: SIZES.large,
    gap: SIZES.small,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  primaryActionButton: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary + '30',
  },
  actionButtonText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginLeft: SIZES.tiny,
  },
  primaryActionText: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Empty State reformado
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.width * 0.15,
    paddingHorizontal: SIZES.large,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.large,
  },
  emptyTitle: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.small,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.large,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.medium,
    borderRadius: SIZES.radius,
    gap: SIZES.small,
  },
  scheduleButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
});

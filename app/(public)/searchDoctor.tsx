import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllDoctors, getAllDoctorsBySpeciality } from '../../src/api/services/doctor';
import { getAllSpecialities } from '../../src/api/services/speciality';
import { COLORS, SIZES, createResponsiveStyle } from '../../src/constants/theme';
import { HEADER_CONSTANTS } from '../../src/constants/layout';
import { useAuth } from '../../src/context/AuthContext';

// --- INTERFACES E TIPOS ---
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rqe: string;
  yearsExperience?: number;
  rating?: number;
  patientStories?: number;
  location?: string;
  image?: string;
  isOnline?: boolean;
}

interface Specialty {
  id: string;
  name: string;
}

// --- COMPONENTE PRINCIPAL ---
export default function SearchDoctorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { refreshAuth, forceLogout } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);
  const [specialtiesLoading, setSpecialtiesLoading] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Memoizar os médicos filtrados
  const filteredDoctors = useMemo(() => {
    if (!searchQuery.trim()) return doctors;
    
    const query = searchQuery.toLowerCase().trim();
    
    return doctors.filter(doctor => {
      const nameMatch = doctor.name.toLowerCase().includes(query);
      const specialtyMatch = doctor.specialty.toLowerCase().includes(query);
      const rqeMatch = doctor.rqe.toLowerCase().includes(query);
      const cleanName = doctor.name.toLowerCase().replace(/^dr\.?\s*/i, '');
      const cleanNameMatch = cleanName.includes(query);
      
      return nameMatch || specialtyMatch || rqeMatch || cleanNameMatch;
    });
  }, [doctors, searchQuery]);

  // Função para extrair dados do médico da API
  const extractDoctorData = useCallback((doctor: any, fallbackSpecialty?: string) => {
    let specialty = 'Especialidade não informada';
    let rqe = 'RQE não informado';
    
    if (doctor.specialities && Array.isArray(doctor.specialities) && doctor.specialities.length > 0) {
      specialty = doctor.specialities[0].specialityName || specialty;
      rqe = doctor.specialities[0].rqeNumber || rqe;
    } else if (doctor.specialty?.name) {
      specialty = doctor.specialty.name;
    } else if (doctor.specialty && typeof doctor.specialty === 'string') {
      specialty = doctor.specialty;
    } else if (fallbackSpecialty) {
      specialty = fallbackSpecialty;
    }

    const formattedDoctor = {
      id: doctor.id,
      name: doctor.name,
      specialty: specialty,
      rqe: rqe,
      yearsExperience: doctor.yearsExperience || 5,
      rating: doctor.rating || 4.5,
      patientStories: doctor.patientStories || 50,
      location: doctor.location || 'Curitiba, PR',
      image: doctor.profileImage || `https://i.pravatar.cc/200?u=${doctor.id}`,
      isOnline: doctor.isOnline || Math.random() > 0.5,
    };
    
    return formattedDoctor;
  }, []);

  // Carregar especialidades apenas uma vez
  const loadSpecialties = useCallback(async () => {
    if (specialties.length > 0) return;
    
    try {
      setSpecialtiesLoading(true);
      const specialtiesData = await getAllSpecialities();
      setSpecialties(specialtiesData);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as especialidades');
    } finally {
      setSpecialtiesLoading(false);
    }
  }, [specialties.length]);

  // Carregar todos os médicos
  const loadAllDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const doctorsData = await getAllDoctors();
      
      const formattedDoctors = doctorsData.map((doctor: any) => {
        return extractDoctorData(doctor);
      });
      
      setDoctors(formattedDoctors);
    } catch (error: any) {
      Alert.alert('Erro', 'Não foi possível carregar os médicos');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [extractDoctorData]);

  // Carregar médicos por especialidade
  const loadDoctorsBySpecialty = useCallback(async (specialtyName: string, specialtyId: string) => {
    try {
      setLoading(true);
      const doctorsData = await getAllDoctorsBySpeciality(specialtyId);
      
      if (!doctorsData || doctorsData.length === 0) {
        setDoctors([]);
        Alert.alert(
          'Sem médicos disponíveis', 
          `Não encontramos médicos para a especialidade "${specialtyName}" no momento.`
        );
        return;
      }

      // Filtrar médicos pela especialidade real
      const filteredBySpecialty = doctorsData.filter((doctor: any) => {
        if (doctor.specialities && Array.isArray(doctor.specialities) && doctor.specialities.length > 0) {
          const doctorSpecialty = doctor.specialities[0].specialityName;
          return doctorSpecialty === specialtyName;
        }
        return false;
      });

      if (filteredBySpecialty.length === 0) {
        setDoctors([]);
        Alert.alert(
          'Especialidade sem médicos', 
          `A API não retornou médicos específicos para "${specialtyName}".`
        );
        return;
      }

      const formattedDoctors = filteredBySpecialty.map((doctor: any) => {
        return extractDoctorData(doctor, specialtyName);
      });
      
      setDoctors(formattedDoctors);
      
    } catch (error: any) {
      if (error.response?.status === 404) {
        setDoctors([]);
        Alert.alert(
          'Especialidade sem médicos', 
          `A especialidade "${specialtyName}" não possui médicos cadastrados.`
        );
      } else {
        Alert.alert('Erro', `Erro ao carregar médicos da especialidade ${specialtyName}: ${error.message}`);
        setDoctors([]);
      }
    } finally {
      setLoading(false);
    }
  }, [extractDoctorData]);

  // Inicialização com useEffect
  useEffect(() => {
    const initializeScreen = async () => {
      loadSpecialties();

      const queryParam = params.query as string;
      const specialtyParam = params.specialty as string;
      const specialtyIdParam = params.specialtyId as string;
      
      if (queryParam && queryParam.trim()) {
        setSearchQuery(queryParam.trim());
        setSelectedSpecialty('');
        setSelectedSpecialtyId('');
        await loadAllDoctors();
      } else if (specialtyParam && specialtyIdParam) {
        setSelectedSpecialty(specialtyParam);
        setSelectedSpecialtyId(specialtyIdParam);
        setSearchQuery('');
        await loadDoctorsBySpecialty(specialtyParam, specialtyIdParam);
      } else {
        setSearchQuery('');
        setSelectedSpecialty('');
        setSelectedSpecialtyId('');
        await loadAllDoctors();
      }
    };

    initializeScreen();
  }, [params.query, params.specialty, params.specialtyId]);

  const handleSpecialtyPress = useCallback((specialty: Specialty) => {
    if (loading) return;
    
    if (selectedSpecialty === specialty.name) {
      setSelectedSpecialty('');
      setSelectedSpecialtyId('');
      setSearchQuery('');
      loadAllDoctors();
    } else {
      setSelectedSpecialty(specialty.name);
      setSelectedSpecialtyId(specialty.id);
      setSearchQuery('');
      loadDoctorsBySpecialty(specialty.name, specialty.id);
    }
  }, [loading, selectedSpecialty, loadAllDoctors, loadDoctorsBySpecialty]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedSpecialty('');
    setSelectedSpecialtyId('');
    loadAllDoctors();
  }, [loadAllDoctors]);

  const toggleFavorite = useCallback((doctorId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(doctorId)) {
        newFavorites.delete(doctorId);
      } else {
        newFavorites.add(doctorId);
      }
      return newFavorites;
    });
  }, []);

  const navigateToAppointment = useCallback((doctor: Doctor) => {
    router.push({
      pathname: '/(public)/appointments',
      params: { doctorId: doctor.id }
    });
  }, [router]);

  // Renderização de especialidades
  const renderSpecialtyItem = useCallback(({ item }: { item: Specialty }) => (
    <TouchableOpacity
      style={[
        styles.specialtyChip,
        selectedSpecialty === item.name && styles.selectedSpecialtyChip
      ]}
      onPress={() => handleSpecialtyPress(item)}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.specialtyText, 
        selectedSpecialty === item.name && styles.selectedSpecialtyText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [selectedSpecialty, handleSpecialtyPress]);

  // Renderização de médicos
  const renderDoctorItem = useCallback(({ item }: { item: Doctor }) => (
    <TouchableOpacity 
      style={styles.doctorCard}
      onPress={() => navigateToAppointment(item)}
      activeOpacity={0.95}
    >
      <View style={styles.doctorHeader}>
        <View style={styles.doctorImageContainer}>
          <Image
            source={{ uri: item.image }}
            style={styles.doctorImage}
            defaultSource={require('../../assets/icon.png')}
          />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.doctorSpecialty} numberOfLines={1}>
            {item.specialty}
          </Text>
          <Text style={styles.doctorRqe} numberOfLines={1}>
            {item.rqe}
          </Text>
          <Text style={styles.doctorExperience}>
            {item.yearsExperience || 5}+ anos de experiência
          </Text>
          
          <View style={styles.doctorStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.statText}>
                {item.rating?.toFixed(1) || '4.5'} ({item.patientStories || 50}+ pacientes)
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.statText} numberOfLines={1}>
                {item.location || 'Curitiba, PR'}
              </Text>
            </View>
          </View>
        </View>
      
        <TouchableOpacity 
          onPress={() => toggleFavorite(item.id)}
          style={styles.favoriteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons 
            name={favorites.has(item.id) ? "heart" : "heart-outline"} 
            size={22} 
            color={favorites.has(item.id) ? COLORS.error : COLORS.textSecondary} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.consultButtonContainer}>
        <Text style={styles.consultButtonText}>Agendar Consulta</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  ), [navigateToAppointment, toggleFavorite, favorites]);

  // Header da lista
  const ListHeaderComponent = useMemo(() => (
    <>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Busque por nome ou especialidade..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.placeholder}
          />
          {(searchQuery || selectedSpecialty) && (
            <TouchableOpacity 
              onPress={clearSearch} 
              style={styles.clearButton}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Specialties Section */}
      <View style={styles.specialtiesSection}>
        <Text style={styles.sectionTitle}>Especialidades</Text>
        {specialtiesLoading ? (
          <View style={styles.specialtiesLoadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={specialties}
            renderItem={renderSpecialtyItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specialtiesList}
            initialNumToRender={5}
            maxToRenderPerBatch={5}
            windowSize={10}
          />
        )}
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {loading ? 'Carregando...' : 
           searchQuery ? 
           `${filteredDoctors.length} resultados para "${searchQuery}"` :
           selectedSpecialty ? 
           `${filteredDoctors.length} médicos em ${selectedSpecialty}` : 
           `${filteredDoctors.length} médicos disponíveis`}
        </Text>
        
        {/* Indicador de filtro ativo */}
        {(searchQuery || selectedSpecialty) && (
          <View style={styles.activeFilterContainer}>
            <Ionicons 
              name={searchQuery ? "search" : "medical"} 
              size={14} 
              color={COLORS.primary} 
            />
            <Text style={styles.activeFilterText}>
              {searchQuery ? `Busca: "${searchQuery}"` : `Filtro: ${selectedSpecialty}`}
            </Text>
          </View>
        )}
      </View>
    </>
  ), [searchQuery, selectedSpecialty, clearSearch, specialtiesLoading, specialties, renderSpecialtyItem, loading, filteredDoctors.length]);

  const ListEmptyComponent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {searchQuery ? `Buscando por "${searchQuery}"...` :
             selectedSpecialty ? `Carregando médicos de ${selectedSpecialty}...` : 
             'Carregando médicos...'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons 
          name={searchQuery ? "search-outline" : "medical-outline"} 
          size={64} 
          color={COLORS.placeholder} 
        />
        <Text style={styles.emptyTitle}>
          {searchQuery ? 
           `Nenhum resultado para "${searchQuery}"` :
           selectedSpecialty ? 
           `Nenhum médico encontrado em ${selectedSpecialty}` : 
           'Nenhum médico encontrado'}
        </Text>
        <Text style={styles.emptyText}>
          {searchQuery ? 
           'Tente usar termos diferentes ou procure por especialidade.' :
           selectedSpecialty ? 
           'Esta especialidade não possui médicos cadastrados no momento.' :
           'Tente ajustar sua busca ou selecionar uma especialidade diferente.'}
        </Text>
        
        {(searchQuery || selectedSpecialty) && (
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={clearSearch}
          >
            <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [loading, searchQuery, selectedSpecialty, clearSearch]);

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Header com padding ajustado para evitar conflito com câmera */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Encontre seu Médico</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctorItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}

// ✅ Estilos atualizados com posicionamento igual ao HomeHeader
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // ✅ Header padronizado usando as constantes
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
    width: createResponsiveStyle(32),
  },

  // List Container
  listContainer: {
    flexGrow: 1,
    paddingBottom: SIZES.large,
  },

  // Search Section
  searchSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.containerPadding,
    paddingVertical: SIZES.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius * 2,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.small,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginLeft: SIZES.small,
    paddingVertical: SIZES.tiny,
  },
  clearButton: {
    padding: SIZES.tiny,
  },

  // Specialties Section
  specialtiesSection: {
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.large,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SIZES.containerPadding,
    marginBottom: SIZES.medium,
  },
  specialtiesLoadingContainer: {
    paddingVertical: SIZES.large,
    alignItems: 'center',
  },
  specialtiesList: {
    paddingHorizontal: SIZES.containerPadding,
    gap: SIZES.small,
  },
  specialtyChip: {
    backgroundColor: 'transparent',
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    marginHorizontal: SIZES.tiny,
    borderRadius: SIZES.radius * 3,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginRight: SIZES.small,
  },
  selectedSpecialtyChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  specialtyText: {
    color: COLORS.text,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  selectedSpecialtyText: {
    color: COLORS.white,
  },

  // Results Header
  resultsHeader: {
    paddingHorizontal: SIZES.containerPadding,
    paddingVertical: SIZES.medium,
    backgroundColor: COLORS.background,
  },
  resultsCount: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.tiny,
    paddingHorizontal: SIZES.small,
    paddingVertical: SIZES.tiny,
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.radius,
    alignSelf: 'flex-start',
  },
  activeFilterText: {
    fontSize: SIZES.xSmall,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: SIZES.tiny,
  },

  // Doctor Card
  doctorCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    marginHorizontal: SIZES.containerPadding,
    marginBottom: SIZES.medium,
    padding: SIZES.large,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.medium,
  },
  doctorImageContainer: {
    position: 'relative',
    marginRight: SIZES.medium,
  },
  doctorImage: {
    width: createResponsiveStyle(80),
    height: createResponsiveStyle(80),
    borderRadius: createResponsiveStyle(40),
    backgroundColor: COLORS.border,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: createResponsiveStyle(4),
    right: createResponsiveStyle(4),
    width: createResponsiveStyle(16),
    height: createResponsiveStyle(16),
    borderRadius: createResponsiveStyle(8),
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  doctorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.tiny,
  },
  doctorSpecialty: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SIZES.tiny,
  },
  doctorRqe: {
    fontSize: SIZES.xSmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.tiny,
  },
  doctorExperience: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    marginBottom: SIZES.small,
  },
  doctorStats: {
    gap: SIZES.tiny,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.tiny,
  },
  statText: {
    fontSize: SIZES.xSmall,
    color: COLORS.textSecondary,
    marginLeft: SIZES.tiny,
    flex: 1,
  },
  favoriteButton: {
    padding: SIZES.small,
    alignSelf: 'flex-start',
  },

  // Consult Button
  consultButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    paddingVertical: SIZES.small,
    paddingHorizontal: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  consultButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.font,
    fontWeight: '600',
    marginRight: SIZES.tiny,
  },

  // Loading & Empty States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.width * 0.2,
  },
  loadingText: {
    fontSize: SIZES.font,
    color: COLORS.textSecondary,
    marginTop: SIZES.medium,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.width * 0.15,
    paddingHorizontal: SIZES.containerPadding,
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
    maxWidth: SIZES.width * 0.8,
  },
  clearFiltersButton: {
    marginTop: SIZES.medium,
    paddingHorizontal: SIZES.large,
    paddingVertical: SIZES.small,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
  },
  clearFiltersText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: '600',
    textAlign: 'center',
  },
});

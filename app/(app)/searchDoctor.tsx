import React, { useState, useEffect } from 'react';
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
import { COLORS } from '../../src/constants/theme';
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
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(false);
  const [specialtiesLoading, setSpecialtiesLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSpecialties();
    
    const specialtyFromParams = params.specialty as string;
    const specialtyIdFromParams = params.specialtyId as string;
    
    if (specialtyFromParams && specialtyIdFromParams) {
      setSelectedSpecialty(specialtyFromParams);
      loadDoctorsBySpecialty(specialtyFromParams, specialtyIdFromParams);
    } else {
      loadAllDoctors();
    }
  }, [params.specialty, params.specialtyId]); 

  useEffect(() => {
    const queryFromParams = params.query as string;
    if (queryFromParams) {
      setSearchQuery(queryFromParams);
    }
  }, [params.query]);

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, doctors]);

  const loadSpecialties = async () => {
    try {
      setSpecialtiesLoading(true);
      const apiSpecialties = await getAllSpecialities();
      const mappedSpecialties: Specialty[] = apiSpecialties.map((specialty: any) => ({
        id: specialty.id,
        name: specialty.name,
      }));
      setSpecialties(mappedSpecialties);
    } catch (error) {
      console.error('Erro ao carregar especialidades:', error);
      setSpecialties([{ id: '1', name: 'Cardiologia' }, { id: '2', name: 'Dermatologia' }]);
    } finally {
      setSpecialtiesLoading(false);
    }
  };

  const loadAllDoctors = async () => {
    try {
        setLoading(true);
        const response = await getAllDoctors();
        const mappedDoctors: Doctor[] = response.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.name || 'Nome não informado',
          specialty: doctor.speciality || 'Especialidade não informada',
          rqe: doctor.rqe || 'RQE não informado',
          yearsExperience: Math.floor(Math.random() * 15) + 5,
          rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
          patientStories: Math.floor(Math.random() * 100) + 20, 
          location: 'Água Verde, Curitiba, Brazil',
          image: 'https://via.placeholder.com/80x80', 
          isOnline: Math.random() > 0.5, 
        }));
        setDoctors(mappedDoctors);
    } catch (error) {
        console.error('Erro ao carregar médicos:', error);
        Alert.alert('Erro', 'Não foi possível carregar a lista de médicos');
    } finally {
        setLoading(false);
    }
  };

  const loadDoctorsBySpecialty = async (specialtyName: string, specialtyId: string) => {
    try {
      setLoading(true);
      const response = await getAllDoctorsBySpeciality(specialtyId);
      const mappedDoctors: Doctor[] = response.map((doctor: any) => ({
        id: doctor.id, name: doctor.name || 'Nome não informado',
        specialty: doctor.specialty || specialtyName, rqe: doctor.rqe || 'RQE não informado',
        yearsExperience: Math.floor(Math.random() * 15) + 5, rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        patientStories: Math.floor(Math.random() * 100) + 20, location: 'Água Verde, Curitiba, Brazil',
        image: 'https://via.placeholder.com/80x80', isOnline: Math.random() > 0.5,
      }));
      setDoctors(mappedDoctors);
    } catch (error: any) {
      if (error.response?.status === 401) {
        try {
          await refreshAuth();
          await loadDoctorsBySpecialty(specialtyName, specialtyId);
        } catch (retryError) {
          await forceLogout();
          Alert.alert('Sessão Expirada', 'A sua sessão expirou.');
        }
      } else {
        Alert.alert('Erro', 'Não foi possível carregar médicos desta especialidade.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;
    if (searchQuery.trim()) {
        filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    setFilteredDoctors(filtered);
  };

  const handleSpecialtyPress = (specialty: Specialty) => {
    if (loading) return;
    
    if (selectedSpecialty === specialty.name) {
      setSelectedSpecialty('');
      loadAllDoctors();
    } else {
      setSelectedSpecialty(specialty.name);
      loadDoctorsBySpecialty(specialty.name, specialty.id);
    }
    setSearchQuery(''); 
  };

  const toggleFavorite = (doctorId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(doctorId)) {
      newFavorites.delete(doctorId);
    } else {
      newFavorites.add(doctorId);
    }
    setFavorites(newFavorites);
  };

  const navigateToAppointment = (doctor: Doctor) => {
    router.push({
      pathname: '/appointments',
      params: { doctorId: doctor.id }
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedSpecialty('');
    loadAllDoctors();
  };

  const renderSpecialtyItem = ({ item }: { item: Specialty }) => (
    <TouchableOpacity
      style={[
        styles.specialtyCard,
        selectedSpecialty === item.name && styles.selectedSpecialtyCard
      ]}
      onPress={() => handleSpecialtyPress(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.specialtyText, selectedSpecialty === item.name && styles.selectedSpecialtyText]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderDoctorItem = ({ item }: { item: Doctor }) => (
    <View style={styles.doctorCard}>
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
          <Text style={styles.doctorName}>Dr. {item.name}</Text>
          <Text style={styles.doctorSpecialty}>Specialist {item.specialty}</Text>
          <Text style={styles.doctorExperience}>
            {item.yearsExperience} Years experience
          </Text>
          <View style={styles.doctorStats}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.statText}>{item.rating}★</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: '#2196F3' }]} />
              <Text style={styles.statText}>{item.patientStories} Histórico de pacientes</Text>
            </View>
          </View>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => toggleFavorite(item.id)}
          style={styles.favoriteButton}
        >
          <Ionicons 
            name={favorites.has(item.id) ? "heart" : "heart-outline"} 
            size={24} 
            color={favorites.has(item.id) ? COLORS.error : COLORS.textSecondary} 
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.consultButton}
        onPress={() => navigateToAppointment(item)}
        activeOpacity={0.8}
      >
        <Text style={styles.consultButtonText}>Consulta</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Encontre o Doutor</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctorItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.doctorsList}
        ListHeaderComponent={
          <>
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Busque"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={COLORS.placeholder}
                />
                {(searchQuery || selectedSpecialty) && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <Ionicons name="close" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.specialtiesSection}>
              <Text style={styles.sectionTitle}>Especialidades</Text>
              {specialtiesLoading ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 20 }}/>
              ) : (
                <FlatList
                  data={specialties}
                  renderItem={renderSpecialtyItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.specialtiesList}
                />
              )}
            </View>

            <View style={styles.resultHeader}>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="medical-outline" size={48} color={COLORS.placeholder} />
              <Text style={styles.emptyTitle}>Nenhum médico encontrado</Text>
              <Text style={styles.emptyText}>
                Tente ajustar a sua busca.
              </Text>
            </View>
          )
        }
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: 48,
  },
  clearButton: {
    padding: 4,
  },
  specialtiesSection: {
    paddingVertical: 24, // Aumentado para mais respiro
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold', // Aumentado o peso da fonte
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 16, // Aumentado para mais respiro
  },
  specialtiesList: {
    paddingHorizontal: 20,
  },
  specialtyCard: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5, // Borda um pouco mais grossa
    borderColor: COLORS.primary,
    marginRight: 12,
  },
  selectedSpecialtyCard: {
    backgroundColor: COLORS.primary,
  },
  specialtyText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedSpecialtyText: {
    color: COLORS.white,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30, // Aumentado para o título descer
    paddingBottom: 12,
  },
  resultCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 80, // Aumentado o espaçamento
  },
  doctorsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  doctorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  doctorInfo: {
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
    marginBottom: 4,
  },
  doctorExperience: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  doctorStats: {
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  favoriteButton: {
    padding: 8,
  },
  consultButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  consultButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80, // Aumentado o espaçamento
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});


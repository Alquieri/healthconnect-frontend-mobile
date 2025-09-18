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
import { DoctorDto } from '../../src/api/models/doctor';
import { SpecialityDto } from '../../src/api/models/speciality';
import { COLORS } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

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
  isFavorite?: boolean;
}

interface Specialty {
  id: string;
  name: string;
  color: string;
  icon: string;
}

const defaultSpecialtyStyles: Record<string, { color: string; icon: string }> = {
  'Cardiologia': { color: '#FF6B6B', icon: 'heart' },
  'Dermatologia': { color: '#4ECDC4', icon: 'medical' },
  'Neurologia': { color: '#45B7D1', icon: 'brain' },
  'Pediatria': { color: '#96CEB4', icon: 'happy' },
  'Ortopedia': { color: '#FFEAA7', icon: 'body' },
  'Ginecologia': { color: '#DDA0DD', icon: 'woman' },
  'Psiquiatria': { color: '#74B9FF', icon: 'brain' },
  'Oftalmologia': { color: '#FD79A8', icon: 'eye' },
  'Default': { color: '#A0A0A0', icon: 'medical' },
};

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
  
  if (specialtyFromParams) {
    setSelectedSpecialty(specialtyFromParams);
    loadDoctorsBySpecialty(specialtyFromParams, specialtyIdFromParams);
  } else {
    loadAllDoctors();
  }
}, [params.specialty, params.specialtyId]); 

  useEffect(() => {
    filterDoctors();
  }, [searchQuery, doctors]);

  
  const loadSpecialties = async () => {
    try {
      setSpecialtiesLoading(true);
      
      const apiSpecialties = await getAllSpecialities();
      console.log("especialidades", apiSpecialties);
      const mappedSpecialties: Specialty[] = apiSpecialties.map((specialty) => {
        const defaultStyle = defaultSpecialtyStyles[specialty.name] || defaultSpecialtyStyles['Default'];
        
        return {
          id: specialty.id,
          name: specialty.name,
          color: specialty.colorHex || defaultStyle.color,
          icon: specialty.iconName || defaultStyle.icon,
        };
      });
      console.log("mappedSpecialties", mappedSpecialties);
      setSpecialties(mappedSpecialties);
    } catch (error) {
      console.error('Erro ao carregar especialidades:', error);
      const fallbackSpecialties: Specialty[] = Object.entries(defaultSpecialtyStyles)
        .filter(([name]) => name !== 'Default')
        .map(([name, style], index) => ({
          id: `fallback-${index}`,
          name,
          color: style.color,
          icon: style.icon,
        }));
      
      setSpecialties(fallbackSpecialties);
    } finally {
      setSpecialtiesLoading(false);
    }
  };

  const loadAllDoctors = async () => {
    try {
      setLoading(true);
      const response = await getAllDoctors();
      console.log("doctors ver se estao vindo de la", response);
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
        isFavorite: false,
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
    console.log('[SearchDoctor] 🔍 Carregando médicos para:', specialtyName, 'ID:', specialtyId);
    
    try {
      setLoading(true);
      
      const response = await getAllDoctorsBySpeciality(specialtyId);
      
      const mappedDoctors: Doctor[] = response.map((doctor: any) => ({
        id: doctor.id,
        name: doctor.name || 'Nome não informado',
        specialty: doctor.specialty || specialtyName,
        rqe: doctor.rqe || 'RQE não informado',
        yearsExperience: Math.floor(Math.random() * 15) + 5,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        patientStories: Math.floor(Math.random() * 100) + 20,
        location: 'Água Verde, Curitiba, Brazil',
        image: 'https://via.placeholder.com/80x80',
        isOnline: Math.random() > 0.5,
        isFavorite: false,
      }));

      setDoctors(mappedDoctors);
      console.log('[SearchDoctor] ✅ Médicos carregados:', mappedDoctors.length);
      
    } catch (error: any) {
      console.error('[SearchDoctor] ❌ Erro inicial:', error.response?.status);
      
      if (error.response?.status === 401) {
        try {
          console.log('[SearchDoctor] 🔄 Tentando refresh do token...');
          await refreshAuth();
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const response = await getAllDoctorsBySpeciality(specialtyId);
          
          const mappedDoctors: Doctor[] = response.map((doctor: any) => ({
            id: doctor.id,
            name: doctor.name || 'Nome não informado',
            specialty: doctor.specialty || specialtyName,
            rqe: doctor.rqe || 'RQE não informado',
            yearsExperience: Math.floor(Math.random() * 15) + 5,
            rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
            patientStories: Math.floor(Math.random() * 100) + 20,
            location: 'Água Verde, Curitiba, Brazil',
            image: 'https://via.placeholder.com/80x80',
            isOnline: Math.random() > 0.5,
            isFavorite: false,
          }));

          setDoctors(mappedDoctors);
          console.log('[SearchDoctor] ✅ Médicos carregados após retry:', mappedDoctors.length);
          
        } catch (retryError) {
          console.error('[SearchDoctor] ❌ Erro após retry, forçando logout...');
          await forceLogout();
          Alert.alert(
            'Sessão Expirada', 
            'Sua sessão expirou. Você será redirecionado para o login.',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.error('[SearchDoctor] ❌ Erro não relacionado à auth:', error);
        Alert.alert('Erro', 'Não foi possível carregar médicos desta especialidade');
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
    if (loading) {
      console.log('[SearchDoctor] ⏳ Ainda carregando, ignorando clique...');
      return;
    }
    
    console.log('[SearchDoctor] 👆 Especialidade selecionada:', specialty.name);
    
    if (selectedSpecialty === specialty.name) {
      console.log('[SearchDoctor] 🔄 Desmarcando especialidade');
      setSelectedSpecialty('');
      loadAllDoctors();
    } else {
      console.log('[SearchDoctor] ✅ Selecionando nova especialidade');
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

  const renderSpecialtyItem = ({ item }: { item: Specialty }) => (
    <TouchableOpacity
      style={[
        styles.specialtyCard,
        { backgroundColor: item.color },
        selectedSpecialty === item.name && styles.selectedSpecialtyCard
      ]}
      onPress={() => handleSpecialtyPress(item)}
      activeOpacity={0.8}
    >
      <Ionicons name={item.icon as any} size={24} color="white" />
      <Text style={styles.specialtyText}>{item.name}</Text>
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

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedSpecialty('');
    loadAllDoctors();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Encontre o Doutor</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Busque por médico ou especialidade"
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
          <View style={styles.specialtiesLoadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Carregando especialidades...</Text>
          </View>
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

      <View style={styles.resultsSection}>
        <View style={styles.resultHeader}>
          <Text style={styles.sectionTitle}>
            {selectedSpecialty ? `${selectedSpecialty}` : 'Todos os Médicos'}
          </Text>
          <Text style={styles.resultCount}>
            {filteredDoctors.length} encontrados
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Carregando médicos...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredDoctors}
            renderItem={renderDoctorItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.doctorsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="medical-outline" size={48} color={COLORS.placeholder} />
                <Text style={styles.emptyTitle}>Nenhum médico encontrado</Text>
                <Text style={styles.emptyText}>
                  Tente ajustar sua busca ou selecionar uma especialidade diferente
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

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
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  clearButton: {
    padding: 4,
  },
  specialtiesSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  specialtiesLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  specialtiesList: {
    paddingHorizontal: 20,
  },
  specialtyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  selectedSpecialtyCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  specialtyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  resultsSection: {
    flex: 1,
    paddingTop: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
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
    shadowOpacity: 0.1,
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
    paddingVertical: 60,
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
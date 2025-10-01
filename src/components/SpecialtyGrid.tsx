import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator } from 'react-native';
import { SpecialtyCard } from './SpecialtyCard';
import { COLORS } from '../constants/theme';
import { getAllSpecialities } from '../api/services/speciality';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const PAGE_WIDTH = width;

const iconMapping: Record<string, keyof typeof MaterialCommunityIcons.glyphMap | 'custom'> = {
  'Cardiologista': 'heart-outline',
  'Psicólogo': 'head-outline',
  'Psiquiatra': 'head-question-outline',
  'Dermatologista': 'content-cut',
  'Neurologista': 'head-cog-outline',
  'Clínico Geral': 'doctor',
  'Clínica Geral': 'doctor',
  'Pediatra': 'custom', // ✅ Marca como customizado
  'Oftalmologista': 'eye-outline',
  'Ginecologista': 'gender-female',
  'Ortopedista': 'bone',
  'Urologista': 'human-male-female',
  'Endocrinologia': 'diabetes',
  'Default': 'medical-bag'
};

// ✅ Adicionar mapeamento de imagens personalizadas
const customImageMapping: Record<string, any> = {
  'Pediatra': require('../../assets/icons-home/IconPediatra.png'),
};

export type SpecialtyItem = {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap | 'custom';
  customImage?: any; // ✅ Adicionar propriedade opcional para imagem personalizada
};

const createPages = (data: SpecialtyItem[], itemsPerPage: number) => {
  const pages = [];
  for (let i = 0; i < data.length; i += itemsPerPage) {
    pages.push(data.slice(i, i + itemsPerPage));
  }
  return pages;
};

const formatSpecialtyData = (specialty: any) => ({
  id: specialty.id,
  name: specialty.name,
  icon: iconMapping[specialty.name] || iconMapping['Default'],
  customImage: iconMapping[specialty.name] === 'custom' ? customImageMapping[specialty.name] : null,
});

export function SpecialtyGrid() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiSpecialties = await getAllSpecialities();
        
        const mappedSpecialties: SpecialtyItem[] = apiSpecialties.map(formatSpecialtyData);
        
        setSpecialties(mappedSpecialties);
      } catch (err) {
        console.error('Erro ao carregar especialidades:', err);
        setError('Não foi possível carregar as especialidades');
        
        // ✅ Fallback com imagem personalizada
        const fallbackSpecialties: SpecialtyItem[] = [
          { id: '1', name: 'Cardiologista', icon: 'heart-outline', customImage: null },
          { id: '2', name: 'Psicólogo', icon: 'head-outline', customImage: null }, 
          { id: '3', name: 'Dermatologista', icon: 'content-cut', customImage: null },
          { id: '4', name: 'Neurologista', icon: 'head-cog-outline', customImage: null },
          { id: '5', name: 'Clínico Geral', icon: 'doctor', customImage: null },
          { id: '6', name: 'Pediatra', icon: 'custom', customImage: require('../../assets/icons-home/IconPediatra.png') },
        ];
        setSpecialties(fallbackSpecialties);
      } finally {
        setLoading(false);
      }
    };

    loadSpecialties();
  }, []);

  const pages = createPages(specialties, 6);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollPosition / PAGE_WIDTH);
    setActiveIndex(newIndex);
  };

  const renderPage = ({ item }: { item: SpecialtyItem[] }) => (
    <View style={styles.page}>
      {item.map((specialty) => (
        <SpecialtyCard key={specialty.id} item={specialty} />
      ))}
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando especialidades...</Text>
        </View>
      );
    }

    if (error && specialties.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (pages.length > 0) {
      return (
        <>
          <FlatList
            data={pages}
            renderItem={renderPage}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `page-${index}`}
            onScroll={onScroll}
            scrollEventThrottle={16}
          />
          {pages.length > 1 && (
            <View style={styles.pagination}>
              {pages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeIndex === index ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}
        </>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agende sua consulta</Text>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    minHeight: 250,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 20,
    marginBottom: 16,
  },
  page: {
    width: PAGE_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
  },
  inactiveDot: {
    backgroundColor: COLORS.border,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },
});


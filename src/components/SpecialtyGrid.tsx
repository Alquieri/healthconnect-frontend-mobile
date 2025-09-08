import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { specialties } from '../data/mocks';
import { SpecialtyCard } from './SpecialtyCard';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');
const PAGE_WIDTH = width;

const createPages = (data: typeof specialties, itemsPerPage: number) => {
  const pages = [];
  for (let i = 0; i < data.length; i += itemsPerPage) {
    pages.push(data.slice(i, i + itemsPerPage));
  }
  return pages;
};

export function SpecialtyGrid() {
  const [activeIndex, setActiveIndex] = useState(0);
  const pages = createPages(specialties, 6);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollPosition / PAGE_WIDTH);
    setActiveIndex(newIndex);
  };

  const renderPage = ({ item }: { item: typeof specialties }) => (
    <View style={styles.page}>
      {item.map((specialty) => (
        <SpecialtyCard key={specialty.id} item={specialty} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agende sua consulta</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
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
});


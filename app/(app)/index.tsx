import React from 'react';
import { StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS } from '../../src/constants/theme';
import { HomeHeader } from '../../src/components/HomeHeader';
import { SpecialtyGrid } from '../../src/components/SpecialtyGrid';
import { VideoCard } from '../../src/components/VideoCard';
import { FeaturedDoctorsList } from '../../src/components/FeaturedDoctorsList';

export default function HomeScreen() {
  const userName = "John"; 

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <HomeHeader userName={userName} />
        
        <SpecialtyGrid />
        
        <VideoCard />
        <FeaturedDoctorsList />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
});
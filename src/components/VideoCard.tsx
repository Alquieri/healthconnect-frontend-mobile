import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export function VideoCard() {
  const thumbnailUrl = 'https://www.youtube.com/watch?v=_pkY2mv3gJ4';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => console.log('Abrir vídeo')}
    >
      <ImageBackground
        source={{ uri: thumbnailUrl }}
        style={styles.imageBackground}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.overlay}>
          <Ionicons name="play-circle" size={64} color={COLORS.white} />
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 24,
    height: 200,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

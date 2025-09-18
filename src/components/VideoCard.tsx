import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

export function VideoCard() {
  const videoId = '_pkY2mv3gJ4';
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  const handlePress = async () => {
    const supported = await Linking.canOpenURL(videoUrl);
    if (supported) {
      await Linking.openURL(videoUrl);
    } else {
      Alert.alert(`Não foi possível abrir este URL: ${videoUrl}`);
    }
  };

  return (
    <View style={styles.sessionContainer}>
      <Text style={styles.sessionTitle}>Dica de Saúde</Text>
      <TouchableOpacity 
        style={styles.videoContainer} 
        onPress={handlePress}
      >
        <ImageBackground
          source={{ uri: thumbnailUrl }}
          style={styles.imageBackground}
          imageStyle={{ borderRadius: SIZES.radius * 2 }} 
        >
          <View style={styles.overlay}>
            <Ionicons name="play-circle" size={64} color={COLORS.primary} />
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sessionContainer: {
    marginTop: 24,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  videoContainer: {
    height: 180, 
    borderRadius: SIZES.radius * 2,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', 
    borderRadius: SIZES.radius * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


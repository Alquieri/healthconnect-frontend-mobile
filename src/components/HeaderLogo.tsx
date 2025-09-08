import React from 'react';
import { Image, StyleSheet } from 'react-native';

export function HeaderLogo() {
  return (
    <Image
      source={require('../assets/logo_1.png')}
      style={styles.logo}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 100,
    resizeMode: 'contain',
    marginRight: 10,
    marginTop: 15 
  },
});
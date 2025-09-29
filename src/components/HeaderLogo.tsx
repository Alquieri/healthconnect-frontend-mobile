import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { HEADER_CONSTANTS } from '../constants/layout';

export function HeaderLogo() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo_1.png')}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingRight: HEADER_CONSTANTS.paddingHorizontal,
    paddingTop: HEADER_CONSTANTS.paddingTop - 10, // ✅ Move 10px para cima
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 100,
    resizeMode: 'contain',
  },
});
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

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
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 16, // Espaçamento da borda direita
    marginRight: 4,   // Margem adicional para melhor posicionamento
  },
  logo: {
    width: 80,  // Tamanho reduzido para caber melhor no header
    height: 60, // Tamanho reduzido para caber melhor no header
    resizeMode: 'contain',
  },
});
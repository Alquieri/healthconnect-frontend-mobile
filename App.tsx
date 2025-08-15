import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native'; // 1. Import Image

const logo = require('./assets/image.png'); 

export default function App() {
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} /> 
      <Text style={{ fontWeight: 'bold', fontSize: 30 }}>CDC</Text>
      <Text style={{ fontWeight: 'bold', fontSize: 30, marginTop: 10, textAlign: 'center' }}>
        Clínica digital de{'\n'}Curitiba
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF2EA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 150,
    height: 150,
    marginBottom: 20, 
  },
});
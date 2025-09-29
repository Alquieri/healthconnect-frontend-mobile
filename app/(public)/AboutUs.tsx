import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { COLORS, SIZES } from '../../src/constants/theme';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Sobre o Health Connect</Text>
        
        <Text style={styles.description}>
          O Health Connect é uma plataforma inovadora que conecta pacientes 
          a médicos especialistas de forma rápida e segura.
        </Text>

        <Text style={styles.sectionTitle}>Nossa Missão</Text>
        <Text style={styles.text}>
          Democratizar o acesso à saúde através da tecnologia, 
          facilitando o agendamento de consultas e melhorando 
          a experiência de cuidados médicos.
        </Text>

        <Text style={styles.sectionTitle}>Por que escolher o Health Connect?</Text>
        <Text style={styles.text}>
          • Médicos verificados e qualificados{'\n'}
          • Agendamento online 24/7{'\n'}
          • Interface intuitiva e segura{'\n'}
          • Suporte personalizado
        </Text>

        <Text style={styles.sectionTitle}>Nossos Valores</Text>
        <Text style={styles.text}>
          🔒 <Text style={styles.boldText}>Segurança:</Text> Seus dados são protegidos com criptografia de ponta.{'\n\n'}
          ⚡ <Text style={styles.boldText}>Agilidade:</Text> Agende consultas em poucos cliques.{'\n\n'}
          💙 <Text style={styles.boldText}>Cuidado:</Text> Conectamos você aos melhores profissionais.{'\n\n'}
          🎯 <Text style={styles.boldText}>Qualidade:</Text> Médicos verificados e qualificados.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.text, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: COLORS.text, marginTop: 24, marginBottom: 12 },
  description: { fontSize: 18, color: COLORS.textSecondary, lineHeight: 26, marginBottom: 20 },
  text: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24 },
  boldText: { fontWeight: '600', color: COLORS.text },
});
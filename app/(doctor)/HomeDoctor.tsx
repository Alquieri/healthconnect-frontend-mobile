import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { AppointmentCard } from "../../src/components/AppointmentCard";
import { HeaderDoctor } from "../../src/components/HeaderDoctor";
import { COLORSDOCTOR } from "../../src/constants/themeDoctor";
import { useAuth } from "../../src/context/AuthContext";
import { getDoctorByIdDetail } from "../../src/api/services/doctor";
import { Stack } from "expo-router";

const appointments = [
  { id: "1", patientName: "João Silva", date: "2025-10-01", time: "14:00", status: "confirmed" },
  { id: "2", patientName: "Maria Oliveira", date: "2025-10-02", time: "09:30", status: "pending" },
  { id: "3", patientName: "Carlos Santos", date: "2025-10-03", time: "11:00", status: "canceled" },
];

export default function HomeDoctor() {
  const { session, isAuthenticated } = useAuth();
  const [userName, setUserName] = useState("Doutor");

  useEffect(() => {
    const loadDoctorName = async () => {
      if (!isAuthenticated || session.role !== "doctor" || !session.userId) {
        setUserName("Doutor");
        return;
      }
      try {
        const doctorData = await getDoctorByIdDetail(session.userId);
        setUserName(doctorData.name.split(" ")[0]); // pega o primeiro nome
      } catch (error) {
        console.error("[DoctorHome] Erro ao carregar nome:", error);
        setUserName("Doutor");
      }
    };
    loadDoctorName();
  }, [isAuthenticated, session.userId, session.role]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} /> 
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <HeaderDoctor
          userName={userName}
          onNotificationsPress={() => {}}
          hasUnreadNotifications={false}
        />

        <View style={styles.content}>
          <Text style={styles.title}>Consultas Agendadas</Text>
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AppointmentCard appointment={item} />}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORSDOCTOR.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORSDOCTOR.text,
    marginBottom: 16,
  },
});

import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "canceled";
}

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  return (
    <TouchableOpacity style={styles.card}>
      <Image
        source={{ uri: `https://i.pravatar.cc/150?u=${appointment.id}` }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {appointment.patientName}
        </Text>
        <Text style={styles.details} numberOfLines={1}>
          {appointment.date} às {appointment.time}
        </Text>
      </View>
      <View style={styles.statusContainer}>
        <Ionicons
          name={
            appointment.status === "confirmed"
              ? "checkmark-circle"
              : appointment.status === "pending"
              ? "time"
              : "close-circle"
          }
          size={18}
          color={
            appointment.status === "confirmed"
              ? "#16A34A"
              : appointment.status === "pending"
              ? "#FACC15"
              : "#DC2626"
          }
        />
        <Text style={styles.status}>{appointment.status}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingVertical: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
  },
  details: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  status: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
    textTransform: "capitalize",
  },
});

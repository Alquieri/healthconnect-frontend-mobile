import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: string;
  duration?: number;
  notes?: string;
}

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: () => void;
}

export function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmado":
      case "confirmed":
        return "checkmark-circle";
      case "agendado":
      case "scheduled":
        return "time";
      case "cancelado":
      case "cancelled":
        return "close-circle";
      case "concluído":
      case "completed":
        return "checkmark-done-circle";
      case "reagendado":
      case "rescheduled":
        return "swap-horizontal";
      case "não compareceu":
      case "no_show":
        return "alert-circle";
      default:
        return "help-circle";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmado":
      case "confirmed":
        return "#16A34A"; // Verde
      case "agendado":
      case "scheduled":
        return "#3B82F6"; // Azul
      case "cancelado":
      case "cancelled":
        return "#DC2626"; // Vermelho
      case "concluído":
      case "completed":
        return "#059669"; // Verde escuro
      case "reagendado":
      case "rescheduled":
        return "#F59E0B"; // Amarelo
      case "não compareceu":
      case "no_show":
        return "#EF4444"; // Vermelho claro
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    const color = getStatusColor(status);
    return color + '20'; // Adiciona transparência
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress}>
      <View style={styles.header}>
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
          {appointment.duration && (
            <Text style={styles.duration}>
              Duração: {appointment.duration} min
            </Text>
          )}
        </View>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusBackgroundColor(appointment.status) }
          ]}>
            <Ionicons
              name={getStatusIcon(appointment.status)}
              size={16}
              color={getStatusColor(appointment.status)}
            />
            <Text style={[
              styles.statusText,
              { color: getStatusColor(appointment.status) }
            ]}>
              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {appointment.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Observações:</Text>
          <Text style={styles.notesText} numberOfLines={2}>
            {appointment.notes}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  duration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
});

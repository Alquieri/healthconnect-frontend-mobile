import { apiPrivate } from "../api";
import { AppointmentPath } from "../enums/routes";
import { AppointmentDto } from "../models/appointment";

export async function createAppointment(appointment: AppointmentDto.AppointmentCreation): Promise<AppointmentDto.AppointmentDetails> {
  try {
    const response = await apiPrivate.post<AppointmentDto.AppointmentDetails>(
      `${AppointmentPath.CREATE_APPOINTMENT}`, 
      appointment
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    throw error;
  }
}

export async function getAppointmentById(appointmentId: string): Promise<AppointmentDto.AppointmentDetails> {
  try {
    const response = await apiPrivate.get<AppointmentDto.AppointmentDetails>(
      `${AppointmentPath.GET_APPOINTMENT_BY_ID}/${appointmentId}`
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao obter agendamento:', error);
    throw error;
  }
}

export async function getAllDoctorAppointments(doctorId: string): Promise<AppointmentDto.AppointmentDetails[]> {
  try {
    const response = await apiPrivate.get<AppointmentDto.AppointmentDetails[]>(
      `${AppointmentPath.GET_APPOINTMENTS_BY_DOCTOR_ID}/${doctorId}`
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao obter agendamentos do médico:', error);
    throw error;
  }
}

export async function getAllPatientAppointments(patientId: string): Promise<AppointmentDto.AppointmentDetails[]> {
  try {
    const response = await apiPrivate.get<AppointmentDto.AppointmentDetails[]>(
      `${AppointmentPath.GET_APPOINTMENTS_BY_PATIENT_ID}/${patientId}`
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao obter agendamentos do paciente:', error);
    throw error;
  }
}
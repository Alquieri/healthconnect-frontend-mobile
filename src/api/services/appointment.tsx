import { apiPrivate } from "../api";
import { AppointmentPath } from "../enums/routes";
import { AppointmentDto } from "../models/appointment";

export async function createAppointment(appointmentData: AppointmentDto.AppointmentCreation, patientId: string): Promise<AppointmentDto.AppointmentDetails> {
  try {
    const response = await apiPrivate.post<AppointmentDto.AppointmentDetails>(
      AppointmentPath.CREATE_APPOINTMENT + `/${patientId}`,
      appointmentData
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

export async function getAppointmentsByDoctorId(doctorId: string): Promise<AppointmentDto.AppointmentDetails[]> {
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

export async function getAppointmentsByPatientId(patientId: string): Promise<AppointmentDto.AppointmentDetails[]> {
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

export async function updateAppointment(appointmentId: string, appointmentData: Partial<AppointmentDto.AppointmentCreation>): Promise<AppointmentDto.AppointmentDetails> {
  try {
    const response = await apiPrivate.put<AppointmentDto.AppointmentDetails>(
      `${AppointmentPath.UPDATE_APPOINTMENT}/${appointmentId}`,
      appointmentData
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    throw error;
  }
}

export async function getAllAppointmentsByDoctorIdSummary(doctorId: string): Promise<AppointmentDto.AppointmentSummary[]> {
  try {
    const response = await apiPrivate.get<AppointmentDto.AppointmentSummary[]>(
      `${AppointmentPath.GET_ALL_APPOINTMENTS_BY_DOCTOR_ID_SUMMARY}/${doctorId}`
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao obter resumo dos agendamentos do médico:', error);
    throw error;
  }
}
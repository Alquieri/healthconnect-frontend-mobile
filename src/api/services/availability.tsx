import { apiPrivate } from "../api";
import { AvailabilityPath } from "../enums/routes";
import { AvailabilityDto } from "../models/availability";

export async function getAvailabilityById(availabilityId: string) {
  try {
    const response = await apiPrivate.get(`${AvailabilityPath.GET_AVAILABILITY_BY_ID}/${availabilityId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter disponibilidade:', error);
    throw error;
  }
}

export async function createAvailability(availability: AvailabilityDto.AvailabilityRegistration) {
  try {
    const response = await apiPrivate.post(`${AvailabilityPath.CREATE_AVAILABILITY}`, availability);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar disponibilidade:', error);
    throw error;
  }
}

export async function getAllAvailabilityByDoctorId(doctorId: string): Promise<AvailabilityDto.AvailabilitySummary[]> {
  try {
    const response = await apiPrivate.get<AvailabilityDto.AvailabilitySummary[]>(
      `${AvailabilityPath.GET_ALL_BY_DOCTOR_ID}/${doctorId}`
    );
    console.log("resposta data:", response.data);
    console.log("resposta completa:", response);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter disponibilidades do médico:', error);
    throw error;
  }
}

export async function deleteAvailability(availabilityId: string) {
  try {
    const response = await apiPrivate.delete(`${AvailabilityPath.DELETE_AVAILABILITY}/${availabilityId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao eliminar disponibilidade:', error);
    throw error;
  }
}
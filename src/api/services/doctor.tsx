import { DoctorPath } from "../enums/routes";
import { apiPrivate } from "../api";

export async function getDoctorById(doctorId: string) {
  try {
    const response = await apiPrivate.get(`${DoctorPath.GET_DOCTOR_BY_ID}/${doctorId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter médico:', error);
    throw error;
  }
}

export async function getDoctorByIdDetail(doctorId: string) {
    try {
        const response = await apiPrivate.get(`${DoctorPath.GET_DOCTOR_DETAIL_BY_ID}/${doctorId}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao obter detalhes do médico:', error);
        throw error;
    }
}

export async function getDoctorByRQE(rqe: string) {
    try {
        const response = await apiPrivate.get(`${DoctorPath.GET_DOCTOR_BY_RQE}/${rqe}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao obter médico por RQE:', error);
        throw error;
    }
}

export async function getAllDoctors() {
  try {
    const response = await apiPrivate.get(DoctorPath.GET_ALL_DOCTORS);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter todos os médicos:', error);
    throw error;
  }
}

export async function getAllDoctorsBySpeciality(speciality: string) {
    try {
        const response = await apiPrivate.get(`${DoctorPath.GET_DOCTORS_BY_SPECIALITY}/${speciality}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao obter médicos por especialidade:', error);
        throw error;
    }
}

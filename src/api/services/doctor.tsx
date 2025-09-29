import { DoctorPath } from "../enums/routes";
import { apiPrivate } from "../api";

export async function getDoctorById(doctorId: string) {
  try {
    console.log('[Doctor] 👨‍⚕️ Buscando médico por ID:', doctorId);
    const response = await apiPrivate.get(`${DoctorPath.GET_DOCTOR_BY_ID}/${doctorId}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    console.log('[Doctor] ✅ Médico encontrado');
    return response.data;
  } catch (error: any) {
    console.error('[Doctor] ❌ Erro ao buscar médico:', error.response?.status);
    throw error;
  }
}

export async function getDoctorByIdDetail(doctorId: string) {
  try {
    console.log('[Doctor] 📋 Buscando detalhes do médico:', doctorId);
    const response = await apiPrivate.get(`${DoctorPath.GET_DOCTOR_DETAIL_BY_ID}/${doctorId}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    console.log('[Doctor] ✅ Detalhes encontrados');
    return response.data;
  } catch (error: any) {
    console.error('[Doctor] ❌ Erro ao buscar detalhes:', error);
    throw error;
  }
}

export async function getDoctorByRQE(rqe: string) {
  try {
    console.log('[Doctor] 🆔 Buscando médico por RQE:', rqe);
    const response = await apiPrivate.get(`${DoctorPath.GET_DOCTOR_BY_RQE}/${rqe}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    console.log('[Doctor] ✅ Médico encontrado por RQE');
    return response.data;
  } catch (error: any) {
    console.error('[Doctor] ❌ Erro ao buscar por RQE:', error);
    throw error;
  }
}

export async function getAllDoctors() {
  try {
    console.log('[Doctor] 👥 Buscando todos os médicos...');
    const response = await apiPrivate.get(DoctorPath.GET_ALL_DOCTORS, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    console.log('[Doctor] ✅ Médicos carregados:', response.data.length);
    return response.data;
  } catch (error: any) {
    console.error('[Doctor] ❌ Erro ao buscar todos:', error.response?.status);
    throw error;
  }
}

export async function getAllDoctorsBySpeciality(specialityId: string) {
  try {
    console.log('[Doctor] 🏥 Buscando médicos da especialidade:', specialityId);
    console.log('[Doctor] 🔗 URL:', `${DoctorPath.GET_DOCTORS_BY_SPECIALITY}/${specialityId}`);
    
    const response = await apiPrivate.get(`${DoctorPath.GET_DOCTORS_BY_SPECIALITY}/${specialityId}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
    console.log('[Doctor] ✅ Médicos da especialidade carregados:', response.data.length);
    return response.data;
  } catch (error: any) {
    console.error('[Doctor] ❌ Erro ao buscar por especialidade:', error.response?.status);
    console.error('[Doctor] ❌ Dados do erro:', error.response?.data);
    console.error('[Doctor] ❌ URL que falhou:', error.config?.url);
    throw error;
  }
}

export async function getDoctorByUserId(userId: string) {
  try {
    console.log('[Doctor] 👤 Buscando médico por User ID:', userId);
    const response = await apiPrivate.get(`${DoctorPath.GET_DOCTOR_BY_USER_ID}/${userId}`);
    console.log('[Doctor] ✅ Médico encontrado por User ID');
    return response.data;
  } catch (error: any) {
    console.error('[Doctor] ❌ Erro ao buscar por User ID:', error.response?.status);
    throw error;
  }
}
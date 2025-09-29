import { PatientPath } from "../enums/routes";
import { apiPrivate, apiPublic } from "../api";
import { patientDTO } from "../models/patient";

export async function getClientProfileByUserId(userId: string): Promise<patientDTO.patientdetail> {
    try {
        console.log('[Client] 👤 Buscando cliente por ID:', userId);
        const response = await apiPrivate.get(`${PatientPath.GET_PATIENT_BY_USER_ID}/${userId}`, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
        console.log('[Client] ✅ Cliente encontrado');
        return response.data;
    } catch (error: any) {
        console.error('[Client] ❌ Erro ao buscar cliente:', error.response?.status);
        throw error;
    }
}

export async function getPatientById(patientId: string): Promise<patientDTO.patientdetail> {
    try {
        console.log('[Patient] 👤 Buscando paciente por ID:', patientId);
        const response = await apiPrivate.get(`${PatientPath.GET_PATIENT_BY_ID}/${patientId}`);
        console.log('[Patient] ✅ Paciente encontrado');
        return response.data;
    } catch (error: any) {
        console.error('[Patient] ❌ Erro ao buscar paciente:', error.response?.status);
        throw error;
    }
}

export async function getAllPatients(): Promise<patientDTO.patientdetail[]> {
    try {
        console.log('[Patient] 👥 Buscando todos os pacientes')
        const response = await apiPrivate.get(PatientPath.GET_ALL_PATIENTS);
        console.log('[Patient] ✅ Todos os pacientes encontrados');
        return response.data;
    } catch (error: any) {
        console.error('[Patient] ❌ Erro ao buscar todos os pacientes:', error.response?.status);
        throw error;
    }
}

export async function getPatientDetailById(patientId: string): Promise<patientDTO.patientdetail> {
    try {
        console.log('[Patient] 👤 Buscando detalhes do paciente por ID:', patientId);
        const response = await apiPrivate.get(`${PatientPath.GET_PATIENT_DETAIL_BY_ID}/${patientId}`);
        console.log('[Patient] ✅ Detalhes do paciente encontrados');
        return response.data;
    } catch (error: any) {
        console.error('[Patient] ❌ Erro ao buscar detalhes do paciente:', error.response?.status);
        throw error;
            }
};
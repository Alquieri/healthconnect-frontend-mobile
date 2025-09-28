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

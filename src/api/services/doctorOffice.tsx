import { DoctorOfficePath } from "../enums/routes";
import { apiPrivate } from "../api";
import { DoctorOfficeDto } from "../models/doctoroffice";

export async function getDoctorOfficeById(doctorOfficeId: string) {
    try {
        console.log('[DoctorOffice] 🏥 Buscando consultório do médico por ID:', doctorOfficeId);
        const response = await apiPrivate.get(`${DoctorOfficePath.GET_DOCTOR_OFFICE_BY_ID}/${doctorOfficeId}`);
        console.log('[DoctorOffice] ✅ Consultório do médico encontrado');
        return response.data;
    } catch (error: any) {
        console.error('[DoctorOffice] ❌ Erro ao buscar consultório do médico:', error.response?.status);
        throw error;
    }
}

export async function getAllDoctorOfficesByDoctorId(doctorId: string) {
    try {
        console.log('[DoctorOffice] 👥 Buscando todos os consultórios do médico por ID do médico:', doctorId);
        const response = await apiPrivate.get(`${DoctorOfficePath.GET_ALL_DOCTOR_OFFICES_BY_DOCTOR_ID}/${doctorId}`);
        console.log('[DoctorOffice] ✅ Todos os consultórios do médico encontrados');
        return response.data;
    } catch (error: any) {
        console.error('[DoctorOffice] ❌ Erro ao buscar todos os consultórios do médico:', error.response?.status);
            throw error;
        }
}

export async function getAllDoctorOffices() {
    try {
        console.log('[DoctorOffice] 👥 Buscando todos os consultórios dos médicos...');
        const response = await apiPrivate.get(DoctorOfficePath.GET_ALL_DOCTOR_OFFICES);
        console.log('[DoctorOffice] ✅ Todos os consultórios dos médicos encontrados');
        return response.data;
    }
    catch (error: any) {
        console.error('[DoctorOffice] ❌ Erro ao buscar todos os consultórios dos médicos:', error.response?.status);
        throw error;
    }  
}

export async function getPrimaryDoctorOfficeByDoctorId(doctorId: string) {
    try {
        console.log('[DoctorOffice] 🏥 Buscando consultório principal do médico por ID do médico:', doctorId);
        const response = await apiPrivate.get(`${DoctorOfficePath.GET_PRIMARY_DOCTOR_OFFICE_BY_DOCTOR_ID}/${doctorId}`);
        console.log('[DoctorOffice] ✅ Consultório principal do médico encontrado');
        return response.data;
    } catch (error: any) {
        console.error('[DoctorOffice] ❌ Erro ao buscar consultório principal do médico:', error.response?.status);
        throw error;
    }
}
export async function createDoctorOffice(doctorOfficeDto: DoctorOfficeDto.DoctorOffice) {
    try {
        console.log('[DoctorOffice] 🏥 Criando consultório do médico:', doctorOfficeDto);
        const response = await apiPrivate.post(DoctorOfficePath.CREATE_DOCTOR_OFFICE, doctorOfficeDto);
        console.log('[DoctorOffice] ✅ Consultório do médico criado');
        return response.data;
    } catch (error: any) {
        console.error('[DoctorOffice] ❌ Erro ao criar consultório do médico:', error.response?.status);
        throw error;
    }
}
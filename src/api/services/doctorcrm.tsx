import { DoctorCRMPath } from "../enums/routes";
import { apiPrivate } from "../api";
import { DoctorCRMDto } from "../models/doctorcrm";

export async function getDoctorCRMById(doctorCRMId: string) {
    try {
        console.log('[DoctorCRM] 👨‍⚕️ Buscando CRM do médico por ID:', doctorCRMId);
        const response = await apiPrivate.get(`${DoctorCRMPath.GET_DOCTORCRM_BY_ID}/${doctorCRMId}`);
        console.log('[DoctorCRM] ✅ CRM do médico encontrado');
        return response.data;
    } catch (error: any) {
        console.error('[DoctorCRM] ❌ Erro ao buscar CRM do médico:', error.response?.status);
        throw error;
    }
}

export async function getDoctorCRMByCode(crmNumber: string, crmState: string) {
    try {
        console.log('[DoctorCRM] 👨‍⚕️ Buscando CRM do médico por código:', crmNumber, crmState);
        const response = await apiPrivate.get(`${DoctorCRMPath.GET_DOCTORCRM_BY_CODE}/${crmNumber}/${crmState}`);
        console.log('[DoctorCRM] ✅ CRM do médico encontrado');
        return response.data;
    } catch (error: any) {
        console.error('[DoctorCRM] ❌ Erro ao buscar CRM do médico:', error.response?.status);
        throw error;
    }
}

export async function getAllDoctorsCRM() {
    try {
        console.log('[DoctorCRM] 👥 Buscando todos os CRMs dos médicos...');
        const response = await apiPrivate.get(DoctorCRMPath.GET_ALL_DOCTORSCRM);
        console.log('[DoctorCRM] ✅ Todos os CRMs dos médicos encontrados');
        return response.data;
    } catch (error: any) {
        console.error('[DoctorCRM] ❌ Erro ao buscar todos os CRMs dos médicos:', error.response?.status);
        throw error;
    }
}

export async function createDoctorCRM(DoctorCRMDto: DoctorCRMDto.DoctorCRMRegister) {
    try {
        console.log('[DoctorCRM] 👨‍⚕️ Criando CRM do médico:', DoctorCRMDto);
        const response = await apiPrivate.post(DoctorCRMPath.CREATE_DOCTORCRM, DoctorCRMDto);
        console.log('[DoctorCRM] ✅ CRM do médico criado');
        return response.data;
    } catch (error: any) {
        console.error('[DoctorCRM] ❌ Erro ao criar CRM do médico:', error.response?.status);
        throw error;
    }
}
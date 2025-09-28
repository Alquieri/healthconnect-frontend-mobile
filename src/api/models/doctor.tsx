import { SpecialityDto } from './speciality';

export namespace DoctorDto {
    // ✅ Interface corrigida baseada no erro da API
    export interface RegisterDoctorRequest {
        // Dados pessoais
        name: string;
        email: string;
        phone: string;
        password: string;
        sex: string;
        cpf: string;
        birthDate: string;
        // Dados profissionais - CORRIGIDO baseado no erro da API
        rqe: string;
        crm: string;
        crmState: string; // ✅ Campo obrigatório
        speciality: string; // ✅ Nome da especialidade (não ID)
        biography: string;
    }

    export interface RegisterDoctorResponse {
        id: string;
        name: string;
        email: string;
        phone: string;
        cpf: string;
        birthDate: string;
        rqe: string;
        crm: string;
        crmState: string;
        speciality: string;
        biography: string;
    }

    // Resposta básica do médico (para listagens)
    export interface DoctorSummaryResponse {
        id: string;
        name: string;
        rqe: string;
        specialty: string; 
        specialtyId?: string;
    }

    export interface DoctorDetailResponse {
        id: string;
        rqe: string;
        crm: string;
        biography: string;
        specialty: string; 
        specialtyId?: string;
        specialtyDetails?: SpecialityDto.SpecialityResponse;
        userId: string;
        name: string;
        email: string;
        phone: string;
        cpf: string;
        birthDate: string;
        profileImage?: string; 
        rating?: number;
        yearsExperience?: number;
        isOnline?: boolean;
    }

    export interface DoctorWithSpecialtyResponse {
        id: string;
        name: string;
        rqe: string;
        specialty: SpecialityDto.SpecialityResponse; 
        biography?: string;
        profileImage?: string;
        rating?: number;
        yearsExperience?: number;
        isOnline?: boolean;
    }
}
import { SpecialityDto } from './speciality';

export namespace DoctorDto {
    // Resposta básica do médico (para listagens)
    export interface DoctorSummaryResponse {
        id: string;
        name: string;
        rqe: string;
        specialty: string; 
        specialtyId?: string; // ID da especialidade para buscar detalhes
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
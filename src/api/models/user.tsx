export namespace UserDto {

    export interface RegisterPatientResponse {
        id: string;
        userId: string;
        name: string;
        email: string;
        sex: string;
        cpf: string;
        phone?: string;
        birthDate: string;
    }

     export interface RegisterDoctor {
        name: string;
        email: string;
        phone?: string;
        password: string;
        cpf: string;
        specialty: string;
        birthDate: string;
        rqe: string;
        crm: string;
        crmState: string;
        biography?: string;
        sex: string;
    }


    export interface SpecialitySummary {
        specialityName: string;
        rqeNumber: number;
    }

    export interface crmSummary {
        crm: string;
        crmState: string;
    }

    export interface UserResponse {
        id: string;
        name: string;
        email: string;
        role: string;
        createdAt: string;
        updatedAt: string;
    }
}
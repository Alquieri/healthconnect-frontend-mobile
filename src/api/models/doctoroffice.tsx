export namespace DoctorOfficeDto {
    export interface DoctorOffice {
        doctorId: string;
        street: string;
        number: number;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
        phone?: string;
        secretaryPhone?: string;
        secretaryEmail?: string;
        isPrimary: boolean;
    }
}
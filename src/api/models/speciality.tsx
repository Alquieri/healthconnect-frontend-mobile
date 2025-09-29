export namespace SpecialityDto {
    export interface SpecialityResponse {
        id: string;
        name: string;
        colorHex?: string; 
        iconName?: string; 
        description?: string; 
        isActive?: boolean; 
    }
    export interface SpecialityCreateRequest {
        name: string;
        colorHex: string;
        iconName: string;
        description?: string;
        isActive: boolean;
    }
    export interface SpecialitySummary {
        specialityName: string;
        rqeNumber: number;
    }

    export interface Specialities { 
        specialities: SpecialitySummary[];
    }
}
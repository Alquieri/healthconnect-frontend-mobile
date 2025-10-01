export namespace AvailabilityDto {
  export interface AvailabilitySummary {
    id: string;
    doctorId: string;
    name: string;
    specialty: string;
    rqe: string;
    slotDateTime: string; 
    durationMinutes: number;
  }

  export interface AvailabilityRegistration {
    doctorId: string;
    slotDateTime: string;
    durationMinutes: number;
    doctorOfficeId?: string;
  }

  export interface AvailabilityRegistrationOld {
    doctorId: string;
    date: Date;
    timeSlots: string[];
    durationMinutes: number;
    doctorOfficeId?: string;
  }
}
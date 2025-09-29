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
    date: Date;
    timeSlots: string[];
    doctorOfficeId?: string;
  }
}
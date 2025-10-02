export namespace AppointmentDto {
  export interface AppointmentCreation {
    availabilityId: string;
    notes?: string;
  }

  export interface AppointmentDetails {
    id: string;
    doctorId: string;
    clientId: string;
    availabilityId: string;
    appointmentDate: string;
    duration: number;
    status: string;
    notes: string;
    doctorName: string;
    clientName: string;
  }

  export interface AppointmentSummary {
    id: string;
    doctorId: string;
    availabilityId: string;
    appointmentDate: Date;
    duration: number;
    status: string;
    doctorName: string;
  }
}
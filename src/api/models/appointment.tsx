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
}
export enum AuthPath {
    LOGIN = "/api/v1/auth/login",
}

export enum UserPath {
    REGISTER_DOCTOR = "/api/v1/user/doctor",
    REGISTER_PATIENT = "/api/v1/user/client",
    GET_USERID = "/api/v1/user",
    GET_USER_BY_EMAIL = "/api/v1/user/email",
    GET_ALL_USERS = "/api/v1/user/all",
    UPDATE_USER = "/api/v1/user",
    DELETE_USER_BY_EMAIL = "/api/v1/user",
    ADD_ROLE = "/api/v1/user/add-role",
    REMOVE_ROLE = "/api/v1/user/remove-role",
}

export enum PatientPath {
    GET_PATIENT_BY_ID = "/api/v1/client",
    GET_ALL_PATIENTS = "/api/v1/client/all",
    GET_PATIENT_BY_USER_ID = "/api/v1/client/user",
    GET_PATIENT_DETAIL_BY_ID = "/api/v1/client/detail",
}

export enum DoctorPath {
    GET_DOCTOR_BY_ID = "/api/v1/doctor",
    GET_ALL_DOCTORS = "/api/v1/doctor/all",
    GET_DOCTOR_BY_USER_ID = "/api/v1/doctor/user",
    GET_DOCTOR_BY_RQE = "/api/v1/doctor/by-rqe",
    GET_DOCTOR_DETAIL_BY_ID = "/api/v1/doctor/detail",
    GET_DOCTORS_BY_SPECIALITY = "/api/v1/doctor/by-Speciality/all",
}

export enum DoctorCRMPath {
    GET_DOCTORCRM_BY_ID = "/api/v1/doctorcrm",
    CREATE_DOCTORCRM = "/api/v1/doctorcrm",
    GET_DOCTORCRM_BY_CODE = "/api/v1/doctorcrm/by-code",
    GET_ALL_DOCTORSCRM = "/api/v1/doctorcrm/all",
}

export enum DoctorOfficePath {
    GET_DOCTOR_OFFICE_BY_ID = "/api/v1/doctoroffice",
    GET_ALL_DOCTOR_OFFICES_BY_DOCTOR_ID = "/api/v1/doctoroffice/all/by-doctor",
    GET_ALL_DOCTOR_OFFICES = "/api/v1/doctoroffice/all",
    GET_PRIMARY_DOCTOR_OFFICE_BY_DOCTOR_ID = "/api/v1/doctoroffice/isprimary/office",
    CREATE_DOCTOR_OFFICE = "/api/v1/doctoroffice",
}

export enum AvailabilityPath {
    CREATE_AVAILABILITY = "/api/v1/availability",
    GET_AVAILABILITY_BY_ID = "/api/v1/availability",
    GET_ALL_BY_DOCTOR_ID = "/api/v1/availability/by-doctor",
    DELETE_AVAILABILITY = "/api/v1/availability",
}

export enum AppointmentPath {
    CREATE_APPOINTMENT = "/api/v1/appointment",
    GET_APPOINTMENT_BY_ID = "/api/v1/appointment",
    GET_APPOINTMENTS_BY_DOCTOR_ID = "/api/v1/appointment/by-doctor",
    GET_APPOINTMENTS_BY_PATIENT_ID = "/api/v1/appointment/by-client",
    UPDATE_APPOINTMENT = "/api/v1/appointment",
}

export enum SpecialityPath {
    GET_ALL_SPECIALITIES = "/api/v1/speciality/all",
    GET_SPECIALITY_BY_ID = "/api/v1/speciality",
    GET_POPULAR_SPECIALITIES = "/api/v1/speciality/popular",
    CREATE_SPECIALITY = "/api/v1/speciality", // Para futuro uso admin
    UPDATE_SPECIALITY = "/api/v1/speciality", // Para futuro uso admin
}
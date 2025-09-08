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
    GET_DOCTOR_DETAIL_BY_ID = "/api/v1/doctor/detail",
}
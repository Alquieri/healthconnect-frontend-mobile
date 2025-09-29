export namespace patientDTO {

    export interface patientdetail {
        id: string;
        userId: string;
        name: string;
        email: string;
        sex: string;
        cpf: string;
        phone: string;
        birthDate: Date;
    }

    export interface patientSummary {
        id: string;
        userId: string;
        name: string;
        email: string;
        sex: string;
    }

}

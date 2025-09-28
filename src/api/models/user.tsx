export namespace UserDto {

    export interface RegisterRequest {
        name: string;
        email: string;
        phone: string;
        password: string;
        sex: string;
        cpf: string;
        birthDate: string;
    }
    
    export interface RegisterResponse {
        id: string;
        name: string;
        email: string;
        phone: string;
        cpf: string;
        birthDate: string;
    }
}
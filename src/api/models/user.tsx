export namespace UserDto {

    export interface RegisterRequest {
        name: string;
        email: string;
        phone: string;
        password: string;
        sex:string;
        cpf: string;
        birthDate: string;
    }
    
    export interface RegisterResponse {
        id: string;
        name: string;
        email: string;
        phone: string;
        // Removi 'password' da resposta, pois geralmente não é retornado
        cpf: string;
        birthDate: string;
    }

}
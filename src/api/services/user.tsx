import { AxiosError } from 'axios';
import { apiPrivate, apiPublic } from '../api'; 
import { UserPath } from '../enums/routes'
import { UserDto } from '../models/user';

export async function registerPatient(request: UserDto.RegisterRequest): Promise<UserDto.RegisterResponse> {
    try {
        console.log('Registering patient with request:', request);
        const { data: response } = await apiPublic.post<UserDto.RegisterResponse>(UserPath.REGISTER_PATIENT, request);
        console.log('Received response:', response);
        return response;
    } catch (error: any) {
        if (error instanceof AxiosError) {
            const responseData = error.response?.data;
            const errorMessage = responseData?.title || responseData?.message || 'Os dados enviados são inválidos.';
            throw new Error(errorMessage);
        } else {
            console.error('Erro inesperado no registro:', error);
            throw new Error('Ocorreu um erro inesperado.');
        }
    }
}

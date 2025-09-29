import { AxiosError } from 'axios';
import { apiPrivate, apiPublic } from '../api'; 
import { UserPath } from '../enums/routes'
import { UserDto } from '../models/user';


export async function registerPatient(request: UserDto.RegisterPatient): Promise<UserDto.RegisterPatientResponse> {

    try {
        console.log('Registering patient with request:', request);
        const { data: response } = await apiPublic.post<UserDto.RegisterPatientResponse>(UserPath.REGISTER_PATIENT, request);
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

export async function registerDoctor(request: UserDto.RegisterDoctor): Promise<UserDto.RegisterDoctorResponse> {

    try {
        console.log('Registering doctor with request:', request);
        const { data: response } = await apiPublic.post<UserDto.RegisterDoctorResponse>(UserPath.REGISTER_DOCTOR, request);
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

export async function getUserByEmail(email: string): Promise<UserDto.UserResponse> {

    try {
        console.log('Fetching user by email:', email);
        const { data: response } = await apiPrivate.get<UserDto.UserResponse>(`${UserPath.GET_USER_BY_EMAIL}?email=${encodeURIComponent(email)}`);
        console.log('Received response:', response);
        return response;
    } catch (error: any) {
        if (error instanceof AxiosError) {
            const responseData = error.response?.data;
            const errorMessage = responseData?.title || responseData?.message || 'Não foi possível buscar o usuário.';
            throw new Error(errorMessage);
        } else {
            console.error('Erro inesperado ao buscar usuário:', error);
            throw new Error('Ocorreu um erro inesperado.');
        }
    }
}

export async function deleteUserByEmail(email: string): Promise<void> {
    try {
        console.log('Deleting user by email:', email);
        await apiPrivate.delete(`${UserPath.DELETE_USER_BY_EMAIL}?email=${encodeURIComponent(email)}`);
        console.log('User deleted successfully');
    } catch (error: any) {
        if (error instanceof AxiosError) {
            const responseData = error.response?.data;
            const errorMessage = responseData?.title || responseData?.message || 'Não foi possível deletar o usuário.';
            throw new Error(errorMessage);
        } else {
            console.error('Erro inesperado ao deletar usuário:', error);
            throw new Error('Ocorreu um erro inesperado.');
        }
    }
}


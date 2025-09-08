import axios, { AxiosError } from 'axios';
import { apiPrivate, apiPublic } from '../api'; 
import { AuthPath } from '../enums/routes'
import { AuthDto } from '../models/auth'
import { saveToken, deleteToken } from './secure-store.service'; 

export async function login(request: AuthDto.LoginRequest): Promise<AuthDto.LoginResponse> {
    try {
        const { data: response } = await apiPublic.post<AuthDto.LoginResponse>(AuthPath.LOGIN, request);
        if(response.token){
            await saveToken(response.token);
            apiPrivate.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
        }
        return response;
    } catch (error: any) {
        throw new Error(error?.message || 'Ocorreu um erro inesperado durante o login.');

    }
}


export async function logout(): Promise<void> {
    await deleteToken();
    delete apiPrivate.defaults.headers.common['Authorization'];
}





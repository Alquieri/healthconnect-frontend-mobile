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
        console.error('Error registering patient:', error);
        throw new Error(error?.message || 'Ocorreu um erro inesperado durante o registro.');
    }
}

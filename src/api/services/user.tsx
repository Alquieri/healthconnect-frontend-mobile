import { AxiosError } from 'axios';
import { apiPrivate, apiPublic } from '../api'; 
import { User, UserDto } from '../models/user'; 

// O enum para os caminhos da API do utilizador
export enum UserPath {
  GET_MY_PROFILE = "/api/v1/user",
  REGISTER_PATIENT = "/api/v1/user/client",
}

/**
 * Busca os dados do perfil do utilizador atualmente autenticado.
 * @returns {Promise<User>} Os dados do perfil do utilizador.
 */
export const getMyProfile = async (): Promise<User> => {
  try {
    const response = await apiPrivate.get<User>(UserPath.GET_MY_PROFILE);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar perfil do utilizador:', error);
    throw error;
  }
};

/**
 * Regista um novo paciente na plataforma.
 * @param {UserDto.RegisterRequest} request - Os dados de registo do paciente.
 * @returns {Promise<UserDto.RegisterResponse>} A resposta da API após o registo.
 */
export async function registerPatient(request: UserDto.RegisterRequest): Promise<UserDto.RegisterResponse> {
  try {
    console.log('A registar paciente com os dados:', request);
    const { data: response } = await apiPublic.post<UserDto.RegisterResponse>(UserPath.REGISTER_PATIENT, request);
    console.log('Resposta recebida:', response);
    return response;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      const responseData = error.response?.data;
      const errorMessage = responseData?.title || responseData?.message || 'Os dados enviados são inválidos.';
      throw new Error(errorMessage);
    } else {
      console.error('Erro inesperado no registo:', error);
      throw new Error('Ocorreu um erro inesperado.');
    }
  }
}


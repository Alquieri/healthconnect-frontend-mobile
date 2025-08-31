import axios, { AxiosError } from 'axios';
import apiClient from './api/axiosConfig';

/**
 * Interface para os dados de login.
 * Garante que a função de login receba os parâmetros corretos.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Resposta esperada da API de login.
 * A sua API pode retornar outros campos, como 'userId' ou 'refreshToken'.
 */
export interface AuthResponse {
  token: string;
  // userId: string; // Exemplo de outro campo
}

/**
 * Envia uma requisição de login para a API.
 * @param credentials Objeto com email e senha do usuário.
 * @returns Um objeto com o token de autenticação e outras informações.
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // TODO: Salvar o token no AsyncStorage ou em outro armazenamento seguro
    // await AsyncStorage.setItem('userToken', response.data.token);

    return response.data;
  } catch (error) {
    // Agora, verificamos se o erro é uma instância de AxiosError
    if (axios.isAxiosError(error)) {
        if (error.response) {
            // O servidor respondeu com um status de erro (ex: 400, 401, 500)
            console.error('Erro de resposta do servidor:', error.response.data);
            throw new Error(error.response.data?.message || 'Credenciais inválidas.');
        } else if (error.request) {
            // A requisição foi feita, mas não houve resposta do servidor
            console.error('Erro de requisição:', error.request);
            throw new Error('Sem resposta do servidor. Verifique sua conexão e a URL da API.');
        } else {
            // Algo aconteceu ao configurar a requisição
            console.error('Erro de configuração do Axios:', error.message);
            throw new Error('Erro ao configurar a requisição.');
        }
    } else {
        // Erro inesperado que não é do Axios
        console.error('Erro inesperado:', error);
        throw new Error('Ocorreu um erro inesperado.');
    }
  }
};

/**
 * Função de logout para remover o token e limpar o estado.
 */
export const logout = async () => {
  // TODO: Remover o token do armazenamento seguro
  // await AsyncStorage.removeItem('userToken');
  // Você também pode invalidar o token no servidor se necessário
};

/**
 * Função para verificar se o usuário está autenticado.
 */
export const isAuthenticated = async (): Promise<boolean> => {
  // TODO: Verificar a existência e a validade do token no armazenamento seguro
  // const token = await AsyncStorage.getItem('userToken');
  // return !!token; // Retorna true se o token existir
  return false; // Implementação temporária
};

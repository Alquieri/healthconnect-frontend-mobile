import { AxiosError } from 'axios';
import { apiPrivate, apiPublic } from '../api'; 
import { UserPath } from '../enums/routes'
import { UserDto } from '../models/user';

// ✅ Registro de Paciente
export async function registerPatient(request: UserDto.RegisterPatient): Promise<UserDto.RegisterPatientResponse> {
    try {
        console.log('[UserService] 👤 Registrando paciente...');
        console.log('[UserService] 📝 Dados do paciente:', JSON.stringify(request, null, 2));
        
        const { data: response } = await apiPublic.post<UserDto.RegisterPatientResponse>(
            UserPath.REGISTER_PATIENT, 
            request,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                timeout: 30000
            }
        );
        
        console.log('[UserService] ✅ Paciente registrado com sucesso');
        console.log('[UserService] 📄 Resposta:', response);
        return response;
        
    } catch (error: any) {
        console.error('[UserService] ❌ Erro no registro de paciente:', error);
        
        if (error instanceof AxiosError) {
            const status = error.response?.status;
            const responseData = error.response?.data;
            
            console.error('[UserService] ❌ Status:', status);
            console.error('[UserService] ❌ Dados do erro:', responseData);
            
            // Tratar erros específicos
            let errorMessage = 'Erro no registro do paciente.';
            
            switch (status) {
                case 400:
                    if (responseData?.errors) {
                        // Tratar erros de validação específicos
                        const errors = responseData.errors;
                        let specificErrors = [];
                        
                        Object.keys(errors).forEach(field => {
                            if (Array.isArray(errors[field])) {
                                specificErrors.push(`${field}: ${errors[field][0]}`);
                            }
                        });
                        
                        errorMessage = specificErrors.length > 0 ? specificErrors.join('\n') : 'Dados inválidos fornecidos.';
                    } else {
                        errorMessage = responseData?.message || responseData?.title || 'Dados inválidos fornecidos.';
                    }
                    break;
                case 409:
                    errorMessage = 'Email ou CPF já cadastrado no sistema.';
                    break;
                case 422:
                    errorMessage = 'Dados não processáveis. Verifique as informações.';
                    break;
                case 500:
                    errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
                    break;
                default:
                    errorMessage = responseData?.message || responseData?.title || `Erro ${status}: Falha na comunicação com o servidor.`;
            }
            
            throw new Error(errorMessage);
            
        } else if (error.request) {
            // Erro de rede
            console.error('[UserService] ❌ Erro de rede');
            throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
            
        } else {
            // Erro de configuração
            console.error('[UserService] ❌ Erro de configuração:', error.message);
            throw new Error('Erro interno. Tente novamente.');
        }
    }
}

// ✅ Registro de Médico - Usando tipo correto
export async function registerDoctor(request: UserDto.RegisterDoctor): Promise<UserDto.RegisterPatientResponse> {
    try {
        console.log('[UserService] 🩺 Registrando médico...');
        console.log('[UserService] 📝 Dados do médico:', JSON.stringify(request, null, 2));
        
        const { data: response } = await apiPublic.post<UserDto.RegisterPatientResponse>(
            UserPath.REGISTER_DOCTOR, 
            request,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                timeout: 30000
            }
        );
        
        console.log('[UserService] ✅ Médico registrado com sucesso');
        console.log('[UserService] 📄 Resposta:', response);
        return response;
        
    } catch (error: any) {
        console.error('[UserService] ❌ Erro no registro de médico:', error);
        
        if (error instanceof AxiosError) {
            const status = error.response?.status;
            const responseData = error.response?.data;
            
            console.error('[UserService] ❌ Status:', status);
            console.error('[UserService] ❌ Dados do erro:', responseData);
            
            // Tratar erros específicos
            let errorMessage = 'Erro no registro médico.';
            
            switch (status) {
                case 400:
                    if (responseData?.errors) {
                        // Tratar erros de validação específicos da API
                        const errors = responseData.errors;
                        let specificErrors = [];
                        
                        Object.keys(errors).forEach(field => {
                            if (Array.isArray(errors[field])) {
                                specificErrors.push(`${field}: ${errors[field][0]}`);
                            }
                        });
                        
                        errorMessage = specificErrors.length > 0 ? specificErrors.join('\n') : 'Dados inválidos fornecidos.';
                    } else {
                        errorMessage = responseData?.message || responseData?.title || 'Dados inválidos fornecidos.';
                    }
                    break;
                case 409:
                    errorMessage = 'Email, CPF ou CRM já cadastrado no sistema.';
                    break;
                case 422:
                    errorMessage = 'Dados não processáveis. Verifique as informações.';
                    break;
                case 500:
                    errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
                    break;
                default:
                    errorMessage = responseData?.message || responseData?.title || `Erro ${status}: Falha na comunicação com o servidor.`;
            }
            
            throw new Error(errorMessage);
            
        } else if (error.request) {
            // Erro de rede
            console.error('[UserService] ❌ Erro de rede');
            throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
            
        } else {
            // Erro de configuração
            console.error('[UserService] ❌ Erro de configuração:', error.message);
            throw new Error('Erro interno. Tente novamente.');
        }
    }
}

// ✅ Buscar usuário por email
export async function getUserByEmail(email: string): Promise<UserDto.UserResponse> {
    try {
        console.log('[UserService] 🔍 Buscando usuário por email:', email);
        
        const { data: response } = await apiPrivate.get<UserDto.UserResponse>(
            `${UserPath.GET_USER_BY_EMAIL}?email=${encodeURIComponent(email)}`,
            {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            }
        );
        
        console.log('[UserService] ✅ Usuário encontrado');
        return response;
        
    } catch (error: any) {
        console.error('[UserService] ❌ Erro ao buscar usuário:', error);
        
        if (error instanceof AxiosError) {
            const status = error.response?.status;
            const responseData = error.response?.data;
            
            let errorMessage = 'Não foi possível buscar o usuário.';
            
            switch (status) {
                case 404:
                    errorMessage = 'Usuário não encontrado.';
                    break;
                case 400:
                    errorMessage = 'Email inválido fornecido.';
                    break;
                case 401:
                    errorMessage = 'Acesso negado. Faça login novamente.';
                    break;
                case 500:
                    errorMessage = 'Erro interno do servidor.';
                    break;
                default:
                    errorMessage = responseData?.title || responseData?.message || 'Erro ao buscar usuário.';
            }
            
            throw new Error(errorMessage);
        } else {
            console.error('[UserService] ❌ Erro inesperado ao buscar usuário:', error);
            throw new Error('Ocorreu um erro inesperado.');
        }
    }
}

// ✅ Deletar usuário por email
export async function deleteUserByEmail(email: string): Promise<void> {
    try {
        console.log('[UserService] 🗑️ Deletando usuário por email:', email);
        
        await apiPrivate.delete(
            `${UserPath.DELETE_USER_BY_EMAIL}?email=${encodeURIComponent(email)}`,
            {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            }
        );
        
        console.log('[UserService] ✅ Usuário deletado com sucesso');
        
    } catch (error: any) {
        console.error('[UserService] ❌ Erro ao deletar usuário:', error);
        
        if (error instanceof AxiosError) {
            const status = error.response?.status;
            const responseData = error.response?.data;
            
            let errorMessage = 'Não foi possível deletar o usuário.';
            
            switch (status) {
                case 404:
                    errorMessage = 'Usuário não encontrado para deletar.';
                    break;
                case 403:
                    errorMessage = 'Você não tem permissão para deletar este usuário.';
                    break;
                case 401:
                    errorMessage = 'Acesso negado. Faça login novamente.';
                    break;
                case 409:
                    errorMessage = 'Usuário não pode ser deletado (possui agendamentos ativos).';
                    break;
                case 500:
                    errorMessage = 'Erro interno do servidor.';
                    break;
                default:
                    errorMessage = responseData?.title || responseData?.message || 'Erro ao deletar usuário.';
            }
            
            throw new Error(errorMessage);
        } else {
            console.error('[UserService] ❌ Erro inesperado ao deletar usuário:', error);
            throw new Error('Ocorreu um erro inesperado.');
        }
    }
}
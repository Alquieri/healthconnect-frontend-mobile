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


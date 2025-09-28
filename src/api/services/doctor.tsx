import { AxiosError } from 'axios';
import { DoctorPath, UserPath } from "../enums/routes";
import { apiPrivate, apiPublic } from "../api";
import { DoctorDto } from '../models/doctor';
import { baseURL } from '../config'; // ✅ Importação necessária

export async function getDoctorById(doctorId: string) {
  try {
    console.log('[Doctor] 👨‍⚕️ Buscando médico por ID:', doctorId);
    const response = await apiPrivate.get(`${DoctorPath.GET_DOCTOR_BY_ID}/${doctorId}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    console.log('[Doctor] ✅ Médico encontrado');
    return response.data;
  } catch (error: any) {
    console.error('[Doctor] ❌ Erro ao buscar médico:', error.response?.status);
    throw error;
  }
}

export async function getDoctorByIdDetail(doctorId: string) {
  try {
    console.log('[Doctor] 📋 Buscando detalhes do médico:', doctorId);
    const response = await apiPrivate.get(`${DoctorPath.GET_DOCTOR_DETAIL_BY_ID}/${doctorId}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    console.log('[Doctor] ✅ Detalhes encontrados');
    return response.data;
  } catch (error: any) {
    console.error('[Doctor] ❌ Erro ao buscar detalhes:', error);
    throw error;
  }
}

export async function getDoctorByRQE(rqe: string) {
  try {
    console.log('[Doctor] 🆔 Buscando médico por RQE:', rqe);
    const response = await apiPrivate.get(`${DoctorPath.GET_DOCTOR_BY_RQE}/${rqe}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    console.log('[Doctor] ✅ Médico encontrado por RQE');
    return response.data;
  } catch (error: any) {
    console.error('[Doctor] ❌ Erro ao buscar por RQE:', error);
    throw error;
  }
}

export async function getAllDoctors() {
  try {
    console.log('[Doctor] 👥 Buscando todos os médicos...');
    const response = await apiPrivate.get(DoctorPath.GET_ALL_DOCTORS, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    console.log('[Doctor] ✅ Médicos carregados:', response.data.length);
    return response.data;
  } catch (error: any) {
    console.error('[Doctor] ❌ Erro ao buscar todos:', error.response?.status);
    throw error;
  }
}

export async function getAllDoctorsBySpeciality(specialityId: string) {
  try {
    console.log('[Doctor] 🏥 Buscando médicos da especialidade:', specialityId);
    console.log('[Doctor] 🔗 URL:', `${DoctorPath.GET_DOCTORS_BY_SPECIALITY}/${specialityId}`);
    
    const response = await apiPrivate.get(`${DoctorPath.GET_DOCTORS_BY_SPECIALITY}/${specialityId}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
    console.log('[Doctor] ✅ Médicos da especialidade carregados:', response.data.length);
    return response.data;
  } catch (error: any) {
    console.error('[Doctor] ❌ Erro ao buscar por especialidade:', error.response?.status);
    console.error('[Doctor] ❌ Dados do erro:', error.response?.data);
    console.error('[Doctor] ❌ URL que falhou:', error.config?.url);
    throw error;
  }
}

// ✅ Função principal de registro
export async function registerDoctor(request: DoctorDto.RegisterDoctorRequest): Promise<DoctorDto.RegisterDoctorResponse> {
  try {
    console.log('🌐 [DoctorService] 🩺 Iniciando registro de médico...');
    console.log('🌐 [DoctorService] 📝 Request payload:', JSON.stringify(request, null, 2));
    
    // ✅ Validar se todos os campos obrigatórios estão presentes
    if (!request.name || !request.email || !request.password || !request.cpf || 
        !request.phone || !request.birthDate || !request.sex || !request.rqe || 
        !request.crm || !request.crmState || !request.speciality) { // ✅ ATUALIZADO
      console.error('🌐 [DoctorService] ❌ Campos obrigatórios faltando no payload');
      
      const missingFields = {
        name: !!request.name,
        email: !!request.email,
        password: !!request.password,
        cpf: !!request.cpf,
        phone: !!request.phone,
        birthDate: !!request.birthDate,
        sex: !!request.sex,
        rqe: !!request.rqe,
        crm: !!request.crm,
        crmState: !!request.crmState, 
        speciality: !!request.speciality, 
      };
      
      console.error('🌐 [DoctorService] ❌ Campos faltando:', missingFields);
      throw new Error('Todos os campos obrigatórios devem ser preenchidos');
    }

    // ✅ Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      console.error('🌐 [DoctorService] ❌ Email inválido:', request.email);
      throw new Error('Formato de email inválido');
    }

    // ✅ Construir URL completa para debug
    const fullUrl = `${baseURL}${UserPath.REGISTER_DOCTOR}`;
    console.log('🌐 [DoctorService] 🔗 URL completa:', fullUrl);
    console.log('🌐 [DoctorService] 🔗 Endpoint:', UserPath.REGISTER_DOCTOR);
    
    // ✅ Fazer a requisição com headers explícitos
    const { data: response } = await apiPublic.post<DoctorDto.RegisterDoctorResponse>(
      UserPath.REGISTER_DOCTOR, 
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000 // 30 segundos
      }
    );
    
    console.log('🌐 [DoctorService] ✅ Resposta recebida com sucesso:', JSON.stringify(response, null, 2));
    
    return response;
  } catch (error: any) {
    console.error('🌐 [DoctorService] ❌ ERRO DETALHADO:');
    console.error('🌐 [DoctorService] ❌ Full error object:', error);
    console.error('🌐 [DoctorService] ❌ Error name:', error.name);
    console.error('🌐 [DoctorService] ❌ Error message:', error.message);
    console.error('🌐 [DoctorService] ❌ Error code:', error.code);
    
    if (error.response) {
      // Erro com resposta do servidor
      console.error('🌐 [DoctorService] ❌ Response status:', error.response.status);
      console.error('🌐 [DoctorService] ❌ Response data:', error.response.data);
      console.error('🌐 [DoctorService] ❌ Response headers:', error.response.headers);
      console.error('🌐 [DoctorService] ❌ Config URL:', error.config?.url);
      
      const responseData = error.response.data;
      let errorMessage = 'Erro no cadastro médico.';
      
      // ✅ Tratar diferentes status codes com detalhes específicos
      switch (error.response.status) {
        case 400:
          // ✅ Tratar erros de validação específicos
          if (responseData?.errors) {
            const errors = responseData.errors;
            let specificErrors = [];
            
            if (errors.CRM) {
              specificErrors.push(`CRM: ${errors.CRM[0]}`);
            }
            if (errors.RQE) {
              specificErrors.push(`RQE: ${errors.RQE[0]}`);
            }
            if (errors.speciality) {
              specificErrors.push(`Especialidade: ${errors.speciality[0]}`);
            }
            if (errors.crmState) {
              specificErrors.push(`Estado CRM: ${errors.crmState[0]}`);
            }
            if (errors.email) {
              specificErrors.push(`Email: ${errors.email[0]}`);
            }
            if (errors.cpf) {
              specificErrors.push(`CPF: ${errors.cpf[0]}`);
            }
            
            if (specificErrors.length > 0) {
              errorMessage = specificErrors.join('\n');
            } else {
              errorMessage = responseData?.title || 'Dados inválidos fornecidos.';
            }
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
          errorMessage = responseData?.message || responseData?.title || `Erro ${error.response.status}: ${error.response.statusText}`;
      }
      
      throw new Error(errorMessage);
      
    } else if (error.request) {
      // Erro de rede (sem resposta)
      console.error('🌐 [DoctorService] ❌ Network error - no response received');
      console.error('🌐 [DoctorService] ❌ Request config:', error.request);
      console.error('🌐 [DoctorService] ❌ Request timeout:', error.request.timeout);
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      
    } else {
      // Erro na configuração da requisição
      console.error('🌐 [DoctorService] ❌ Request setup error:', error.message);
      console.error('🌐 [DoctorService] ❌ Error stack:', error.stack);
      
      // ✅ Tratar erros específicos de configuração
      if (error.message.includes('timeout')) {
        throw new Error('Tempo limite excedido. Tente novamente.');
      } else if (error.message.includes('Network Error')) {
        throw new Error('Erro de rede. Verifique sua conexão.');
      } else {
        throw new Error('Erro interno na configuração da requisição: ' + error.message);
      }
    }
  }
}
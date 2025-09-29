import { SpecialityPath } from "../enums/routes";
import { apiPrivate } from "../api";
import { SpecialityDto } from "../models/speciality";

export async function getAllSpecialities(): Promise<SpecialityDto.SpecialityResponse[]> {
  try {
    console.log('[Speciality] 📋 Buscando especialidades...');
    console.log('[Speciality] 🔗 URL:', SpecialityPath.GET_ALL_SPECIALITIES);
    
    const response = await apiPrivate.get<SpecialityDto.SpecialityResponse[]>(
      SpecialityPath.GET_ALL_SPECIALITIES,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
    
    console.log('[Speciality] ✅ Especialidades carregadas:', response.data.length);
    console.log('[Speciality] ✅ Primeira especialidade:', response.data[0]);
    return response.data;
  } catch (error: any) {
    console.error('[Speciality] ❌ Erro completo:', error);
    console.error('[Speciality] ❌ Status:', error.response?.status);
    console.error('[Speciality] ❌ Data:', error.response?.data);
    console.error('[Speciality] ❌ URL que falhou:', error.config?.url);
    throw error;
  }
}

export async function getSpecialityById(specialityId: string): Promise<SpecialityDto.SpecialityResponse> {
  try {
    console.log('[Speciality] 🔍 Buscando especialidade:', specialityId);
    
    const response = await apiPrivate.get<SpecialityDto.SpecialityResponse>(
      `${SpecialityPath.GET_SPECIALITY_BY_ID}/${specialityId}`,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
    
    console.log('[Speciality] ✅ Especialidade encontrada');
    return response.data;
  } catch (error: any) {
    console.error('[Speciality] ❌ Erro ao buscar especialidade:', error);
    throw error;
  }
}

export async function getPopularSpecialities(): Promise<SpecialityDto.SpecialityResponse[]> {
  try {
    console.log('[Speciality] 🌟 Buscando especialidades populares...');
    
    const response = await apiPrivate.get<SpecialityDto.SpecialityResponse[]>(
      SpecialityPath.GET_POPULAR_SPECIALITIES,
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
    
    console.log('[Speciality] ✅ Especialidades populares carregadas:', response.data.length);
    return response.data;
  } catch (error: any) {
    console.error('[Speciality] ❌ Erro ao buscar populares:', error);
    throw error;
  }
}
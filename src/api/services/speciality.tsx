import { apiPrivate } from "../api";
import { SpecialityPath } from "../enums/routes";
import { SpecialityDto } from "../models/speciality";

export async function getAllSpecialities(): Promise<SpecialityDto.SpecialityResponse[]> {
  try {
    console.log('[Speciality] 📋 Buscando especialidades...');
    
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
    return response.data;
  } catch (error: any) {
    console.error('[Speciality] ❌ Erro:', error.response?.status, error.response?.data);
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
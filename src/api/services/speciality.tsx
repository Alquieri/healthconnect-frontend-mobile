import { apiPrivate } from "../api";
import { SpecialityPath } from "../enums/routes";
import { SpecialityDto } from "../models/speciality";

export async function getAllSpecialities(): Promise<SpecialityDto.SpecialityResponse[]> {
  try {
    const response = await apiPrivate.get<SpecialityDto.SpecialityResponse[]>(
      SpecialityPath.GET_ALL_SPECIALITIES
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao obter especialidades:', error);
    throw error;
  }
}

export async function getSpecialityById(specialityId: string): Promise<SpecialityDto.SpecialityResponse> {
  try {
    const response = await apiPrivate.get<SpecialityDto.SpecialityResponse>(
      `${SpecialityPath.GET_SPECIALITY_BY_ID}/${specialityId}`
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao obter especialidade:', error);
    throw error;
  }
}

export async function getPopularSpecialities(): Promise<SpecialityDto.SpecialityResponse[]> {
  try {
    const response = await apiPrivate.get<SpecialityDto.SpecialityResponse[]>(
      SpecialityPath.GET_POPULAR_SPECIALITIES
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao obter especialidades populares:', error);
    throw error;
  }
}
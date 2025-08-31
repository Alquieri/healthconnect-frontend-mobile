// Importa a instância configurada do axios
import apiClient from './api/axiosConfig';

/**
 * Funções para interagir com a API HealthConnect.
 * Cada função corresponde a um ou mais endpoints da sua API C#.
 */

// Exemplo: Buscar dados vitais de um usuário
// Corresponderia a um GET em /api/vitals/{userId}
const getVitals = (userId: string) => {
  return apiClient.get(`/vitals/${userId}`);
};

// Exemplo: Buscar o perfil de um usuário
// Corresponderia a um GET em /api/user/{userId}/profile
const getUserProfile = (userId: string) => {
  return apiClient.get(`/user/${userId}/profile`);
};



// Exporta todas as funções para que possam ser usadas em outras partes do app
export const healthConnectService = {
  getVitals,
  getUserProfile
};

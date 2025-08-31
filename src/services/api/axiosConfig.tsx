// src/lib/api.ts
import axios from 'axios';

// URL base da sua API C#/.NET.
// Durante o desenvolvimento, use o IP da sua máquina na rede local
// para que o celular (físico ou emulador) consiga acessá-la.
// Ex: 'http://192.168.0.114:5251/api'
const API_BASE_URL = 'http://192.168.0.114:5251/api';

// Cria uma instância do axios com configurações pré-definidas.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Você pode adicionar outros headers padrões aqui
  },
});

/*
 * INTERCEPTOR (Opcional, mas recomendado para autenticação)
 *
 * Se sua API usa autenticação baseada em token (ex: JWT),
 * um interceptor é a melhor forma de adicionar o token a todas as requisições.
 */
apiClient.interceptors.request.use(
  async (config) => {
    // Aqui você buscaria o token salvo no dispositivo (ex: AsyncStorage)
    // const token = await AsyncStorage.getItem('userToken');
    const token = "SEU_TOKEN_JWT_AQUI"; // Exemplo estático

    if (token) {
      // Adiciona o header de autorização se o token existir
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Lida com erros na configuração da requisição
    return Promise.reject(error);
  }
);

export default apiClient;

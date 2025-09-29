// Caminho: src/api/api.ts

import axios, { InternalAxiosRequestConfig } from 'axios';
import { baseURL } from './config';
import { getToken, deleteToken } from './services/secure-store.service';

const createHeaders = () => ({
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true', 
});

// API Pública (sem token)
export const apiPublic = axios.create({
  baseURL,
  timeout: 30000, // ✅ Timeout de 30 segundos
  headers: createHeaders(),
});

// API Privada (com token)
export const apiPrivate = axios.create({
  baseURL,
  timeout: 30000, // ✅ Timeout de 30 segundos
  headers: createHeaders(),
});

// ✅ Interceptor para API Pública (adicionar logs)
apiPublic.interceptors.request.use(
  (config) => {
    console.log(`[API-PUBLIC] 🚀 ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`[API-PUBLIC] 📦 Data:`, config.data);
    return config;
  },
  (error) => {
    console.error('[API-PUBLIC] ❌ Request error:', error);
    return Promise.reject(error);
  }
);

apiPublic.interceptors.response.use(
  (response) => {
    console.log(`[API-PUBLIC] ✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[API-PUBLIC] ❌ ${error.response?.status || 'NETWORK'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.error('[API-PUBLIC] ❌ Response data:', error.response?.data);
    return Promise.reject(error);
  }
);

// --- Interceptor de Request (Pedido) ---
// Adiciona o token a todas as chamadas da apiPrivate
apiPrivate.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 1. GARANTE que o objeto de headers exista. Se for undefined, cria um objeto vazio.
    // Esta é a correção principal para o erro 'Cannot set property of undefined'.
    config.headers = config.headers || {};

    const token = await getToken();
    if (token) {
      // 2. AGORA é 100% seguro definir a propriedade Authorization.
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 3. Mantemos a sua lógica de cache
    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';
    
    console.log(`[API] 🚀 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] ❌ Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);

// --- Interceptor de Response (Resposta) ---
// Lida com as respostas de todas as chamadas da apiPrivate
let isHandling401 = false;

apiPrivate.interceptors.response.use(
  (response) => {
    // Mantemos o seu log de sucesso
    console.log(`[API] ✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    console.error(`[API] ❌ ${status} ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`, error.response?.data);

    // Mantemos a sua lógica para erros 401 (Token Inválido/Expirado)
    // Se o erro for 401 e ainda não estivermos a tratar de um 401...
    if (status === 401 && !isHandling401) {
      isHandling401 = true;
      console.log('[API] 🔄 Token inválido ou expirado. A limpar sessão...');
      
      try {
        await deleteToken();
        // Aqui, no futuro, você poderia chamar uma função para redirecionar o utilizador para o login.
        // Ex: navigateToLogin();
        console.log('[API] ✅ Token removido e sessão limpa.');
      } catch (deleteError) {
        console.error('[API] ❌ Falha ao tentar remover o token.', deleteError);
      } finally {
        isHandling401 = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// --- Função de Reset ---
// Esta função é chamada pelo AuthContext e continua a funcionar como esperado.
export const resetApiInstances = () => {
  console.log('[API] 🔄 Função resetApiInstances chamada.');
  // A lógica de reatribuir defaults não é estritamente necessária, pois os interceptors
  // já lidam com a atualização dinâmica do token, mas mantê-la não quebra nada.
};
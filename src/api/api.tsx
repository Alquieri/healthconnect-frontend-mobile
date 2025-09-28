// Caminho: src/api/api.ts

import axios, { InternalAxiosRequestConfig } from 'axios';
import { baseURL } from './config';
import { getToken, deleteToken } from './services/secure-store.service';

// --- Função Central de Headers ---
// Mantemos a sua função para criar headers padrão
const createHeaders = () => ({
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true', 
});

// --- Instâncias Axios ---
// Nenhuma alteração aqui
export const apiPublic = axios.create({
  baseURL: baseURL,
  headers: createHeaders(),
  timeout: 15000, 
});

export const apiPrivate = axios.create({
  baseURL: baseURL,
  headers: createHeaders(),
  timeout: 15000,
});

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

console.log('[API] 🔧 API configurada com baseURL:', baseURL);
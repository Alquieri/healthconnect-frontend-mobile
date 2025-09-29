import axios, { InternalAxiosRequestConfig } from 'axios';
import { baseURL } from './config';
import { getToken, deleteToken } from './services/secure-store.service';

const createHeaders = () => ({
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true', 
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
});

export const apiPublic = axios.create({
  baseURL,
  timeout: 30000,
  headers: createHeaders(),
});

// API Privada (com token)
export const apiPrivate = axios.create({
  baseURL,
  timeout: 30000, 
  headers: createHeaders(),
});

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

apiPrivate.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    config.headers = config.headers || {};

    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
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

let isHandling401 = false;

apiPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    
    if (status === 401 && !isHandling401) {
      isHandling401 = true;
      
      try {
        console.log('[API] 🔄 Token inválido, limpando...');
        await deleteToken();
        
        setTimeout(() => {
          isHandling401 = false;
        }, 1000);
        
      } catch (deleteError) {
        console.error('[API] ❌ Erro ao remover token:', deleteError);
        isHandling401 = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export const resetApiInstances = () => {
  console.log('[API] 🔄 Função resetApiInstances chamada.');
};
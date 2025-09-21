import axios from 'axios';
import { baseURL } from './config';
import { getToken, deleteToken } from './services/secure-store.service';

const createHeaders = () => ({
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true', 
  'Cache-Control': 'no-cache', 
  'Pragma': 'no-cache',
});

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

apiPrivate.interceptors.request.eject(0);
apiPrivate.interceptors.response.eject(0);

let isRefreshing = false;

apiPrivate.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      console.log(`[API] 🚀 ${config.method?.toUpperCase()} ${config.url}`);
      console.log('[API] 🔑 Token presente:', !!token);
      
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
      
      return config;
    } catch (error) {
      console.error('[API] ❌ Erro ao configurar request:', error);
      return config;
    }
  },
  (error) => {
    console.error('[API] ❌ Erro no request interceptor:', error);
    return Promise.reject(error);
  }
);

apiPrivate.interceptors.response.use(
  (response) => {
    console.log(`[API] ✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    
    console.error(`[API] ❌ ${status} ${method} ${url}`);
    console.error('[API] ❌ Erro detalhado:', error.response?.data);
    
    if (status === 401 && !isRefreshing) {
      console.log('[API] 🔄 Token inválido, limpando...');
      isRefreshing = true;
      
      try {
        await deleteToken();
        console.log('[API] ✅ Token removido do storage');
      } catch (deleteError) {
        console.error('[API] ❌ Erro ao remover token:', deleteError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export const resetApiInstances = () => {
  console.log('[API] 🔄 Resetando instâncias da API...');
  
  Object.assign(apiPublic.defaults, {
    baseURL: baseURL,
    headers: createHeaders(),
    timeout: 15000,
  });
  
  Object.assign(apiPrivate.defaults, {
    baseURL: baseURL,
    headers: createHeaders(),
    timeout: 15000,
  });
};

console.log('[API] 🔧 API configurada com baseURL:', baseURL);
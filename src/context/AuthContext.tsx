import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api/services/auth';
import { AuthDto } from '../api/models/auth';
import { saveToken, getToken, deleteToken, hasToken } from '../api/services/secure-store.service';
import { resetApiInstances } from '../api/api';

type AuthStatus = 'pending' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  token: string | null;
  status: AuthStatus;
  login: (loginData: AuthDto.LoginRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
  forceLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('pending');

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      console.log('[AuthProvider] 🔄 Inicializando bootstrap...');
      setStatus('pending');
      
      const tokenExists = await hasToken();
      console.log('[AuthProvider] 🔍 Token existe?', tokenExists);
      
      if (tokenExists) {
        const storedToken = await getToken();
        if (storedToken) {
          console.log('[AuthProvider] ✅ Token recuperado no bootstrap');
          setToken(storedToken);
          setStatus('authenticated');
          resetApiInstances();
        } else {
          console.log('[AuthProvider] ❌ Token existe mas não foi recuperado');
          setStatus('unauthenticated');
        }
      } else {
        console.log('[AuthProvider] ❌ Nenhum token salvo');
        setStatus('unauthenticated');
      }
    } catch (e) {
      console.error('[AuthProvider] ❌ Erro no bootstrap:', e);
      setStatus('unauthenticated');
    }
  };

  const refreshAuth = async () => {
    try {
      console.log('[AuthProvider] 🔄 Refresh de autenticação...');
      
      const storedToken = await getToken();
      
      if (storedToken) {
        console.log('[AuthProvider] ✅ Token encontrado no refresh');
        setToken(storedToken);
        setStatus('authenticated');
        resetApiInstances();
      } else {
        console.log('[AuthProvider] ❌ Token não encontrado no refresh');
        await forceLogout();
      }
    } catch (error) {
      console.error('[AuthProvider] ❌ Erro no refresh:', error);
      await forceLogout();
    }
  };

  const forceLogout = async () => {
    try {
      console.log('[AuthProvider] 🚨 Forçando logout...');
      await deleteToken();
      setToken(null);
      setStatus('unauthenticated');
      resetApiInstances();
      console.log('[AuthProvider] ✅ Logout forçado concluído');
    } catch (error) {
      console.error('[AuthProvider] ❌ Erro no logout forçado:', error);
      setToken(null);
      setStatus('unauthenticated');
      resetApiInstances();
    }
  };

  const login = async (loginData: AuthDto.LoginRequest) => {
    try {
      console.log('[AuthProvider] 🔑 Fazendo login...');
      setStatus('pending');
      
      const response = await apiLogin(loginData);
      
      if (!response.token) {
        throw new Error('Token não recebido do servidor');
      }
      
      await saveToken(response.token);
      
      const savedToken = await getToken();
      if (!savedToken) {
        throw new Error('Falha ao salvar token no dispositivo');
      }
      
      setToken(response.token);
      setStatus('authenticated');
      resetApiInstances();
      
      console.log('[AuthProvider] ✅ Login realizado com sucesso');
    } catch (error: any) {
      console.error('[AuthProvider] ❌ Erro no login:', error);
      setStatus('unauthenticated');
      throw new Error(error.message || 'Ocorreu um erro inesperado.');
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthProvider] 🚪 Fazendo logout...');
      
      try {
        await apiLogout();
      } catch (apiError) {
        console.warn('[AuthProvider] ⚠️ Erro na API de logout:', apiError);
      }
      
      await deleteToken();
      setToken(null);
      setStatus('unauthenticated');
      resetApiInstances();
      
      console.log('[AuthProvider] ✅ Logout realizado');
    } catch (error) {
      console.error('[AuthProvider] ❌ Erro no logout:', error);
      await forceLogout();
    }
  };

  const value = {
    token,
    status,
    login,
    logout,
    isAuthenticated: status === 'authenticated',
    refreshAuth,
    forceLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
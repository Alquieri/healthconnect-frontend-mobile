import React, { createContext, useContext, useState, useEffect, Children, use } from 'react';
import { useNavigation } from '@react-navigation/native';
import {login as apiLogin, logout as apiLogout} from '../api/services/auth';
import { AuthDto } from '../api/models/auth';
import { saveToken, getToken, deleteToken  } from '../api/services/secure-store.service';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

type AuthStatus = 'pending' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
    token: string | null;
    status: AuthStatus;
    login: (loginData: AuthDto.LoginRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [status, setStatus] = useState<AuthStatus>('pending');


    useEffect(() => {
      const bootstrapAsync = async () => {
        try {
          console.log('[AuthProvider] useEffect: Buscando token no keychain...');
          const storedToken = await getToken();
          console.log('[AuthProvider] useEffect: Token recuperado:', storedToken);
          if (storedToken) {
            setToken(storedToken);
            setStatus('authenticated');
          } else {
            setStatus('unauthenticated');
          }
        } catch (e) {
            console.error('[AuthProvider] useEffect: Erro ao buscar token!', e);
            setStatus('unauthenticated');
        }
      };
      bootstrapAsync();
    }, []);


    const login = async (loginData: AuthDto.LoginRequest) => {
      try {
        const response = await apiLogin(loginData);
        setToken(response.token);
        setStatus('authenticated');
      } catch (error: any) {
        setStatus('unauthenticated');
        throw new Error(error.message || 'Ocorreu um erro inesperado.');
      }
    };
    const logout = async () => {
      await apiLogout();
      setToken(null);
      setStatus('unauthenticated');
    };

    const value = {
      token,
      status,
      login,
      logout,
      isAuthenticated: status === 'authenticated',
    };  

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

  }
  
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



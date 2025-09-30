import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import { login as apiLogin, logout as apiLogout } from '../api/services/auth';
import { AuthDto } from '../api/models/auth';
import { saveToken, getToken, deleteToken } from '../api/services/secure-store.service';
import { resetApiInstances } from '../api/api';

interface DecodedToken {
  sub: string;
  role: string | string[];
  email: string;
}

interface Session {
  token: string | null;
  role: string | null;
  userId: string | null;
}

type AuthStatus = 'pending' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
  session: Session;
  status: AuthStatus;
  login: (loginData: AuthDto.LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  forceLogout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useProtectedRoute(status: AuthStatus) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inProtectedGroup = segments[0] === '(patient)' || segments[0] === '(doctor)';

    if (status === 'pending') {
      return;
    }

    if (status === 'unauthenticated' && inProtectedGroup) {
      console.log('[Auth] Acesso negado a rota protegida. Redirecionando para a home pública.');
      router.replace('/(app)');
    }
  }, [status, segments]);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session>({ token: null, role: null, userId: null });
  const [status, setStatus] = useState<AuthStatus>('pending');
  const router = useRouter();

  useProtectedRoute(status);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    setStatus('pending');
    const storedToken = await getToken();
    if (storedToken) {
      try {
        const decodedToken: DecodedToken = jwtDecode(storedToken);
        let userRole: string;
        if (Array.isArray(decodedToken.role)) {
          userRole = decodedToken.role.includes('doctor') ? 'doctor' : decodedToken.role[0];
        } else {
          userRole = decodedToken.role;
        }

        setSession({ token: storedToken, role: userRole, userId: decodedToken.sub });
        setStatus('authenticated');
        resetApiInstances();
        console.log(`[AuthProvider] ✅ Sessão restaurada como '${userRole}'.`);

        // ❌ REMOVA O BLOCO DE REDIRECIONAMENTO DAQUI ❌
        // if (userRole === 'doctor') {
        //   router.replace('/(doctor)');
        // } else {
        //   router.replace('/(patient)');
        // }

      } catch (e) {
        // ... (seu catch block)
      }
    } else {
      setSession({ token: null, role: null, userId: null });
      setStatus('unauthenticated');
    }
  };


  const refreshAuth = async () => {
    console.log('[AuthProvider] 🔄 Refresh de autenticação...');
    await bootstrapAsync();
  };

  const login = async (loginData: AuthDto.LoginRequest) => {
    setStatus('pending');
    try {
      const response = await apiLogin(loginData);
      await saveToken(response.token);
      const decodedToken: DecodedToken = jwtDecode(response.token);

      // ✅ CORREÇÃO 1: Lógica de prioridade de role
      let userRole: string;
      if (Array.isArray(decodedToken.role)) {
        if (decodedToken.role.includes('doctor')) {
          userRole = 'doctor';
        } else {
          userRole = decodedToken.role[0];
        }
      } else {
        userRole = decodedToken.role;
      }
      
      setSession({ token: response.token, role: userRole, userId: decodedToken.sub });
      setStatus('authenticated');
      resetApiInstances();
      console.log(`[AuthProvider] ✅ Login como '${userRole}' realizado. Redirecionando...`);

      if (userRole === 'doctor') {
        router.replace('/(doctor)');
      } else {
        router.replace('/(patient)');
      }

    } catch (error) {
      console.error('[AuthProvider] ❌ Erro no login:', error);
      await forceLogout();
      throw error;
    }
  };

  const forceLogout = async () => {
    await deleteToken();
    setSession({ token: null, role: null, userId: null });
    setStatus('unauthenticated');
    resetApiInstances();
    
    console.log('[Auth] Logout forçado. Redirecionando para a home pública.');
    router.replace('/(app)'); 
  };
  
  const logout = async () => {
    try {
      await apiLogout();
    } catch (apiError) {
      console.warn('[AuthProvider] ⚠️ Erro na API de logout:', apiError);
    } finally {
      await forceLogout();
    }
  };

  const value = {
    session,
    status,
    login,
    logout,
    isAuthenticated: status === 'authenticated',
    forceLogout,
    refreshAuth,
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
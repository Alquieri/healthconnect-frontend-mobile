import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as apiLogin, logout as apiLogout } from '../api/services/auth';
import { AuthDto } from '../api/models/auth';
import { saveToken, getToken, deleteToken } from '../api/services/secure-store.service';
import { resetApiInstances } from '../api/api';

interface DecodedToken {
  sub: string;
  role: string | string[];
  email: string;
  profileId: string;
}

interface Session {
  token: string | null;
  role: string | null;
  userId: string | null;
  profileId: string | null;
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session>({ token: null, role: null, userId: null, profileId: null });
  const [status, setStatus] = useState<AuthStatus>('pending');

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    setStatus('pending');
    const storedToken = await getToken();
    if (storedToken) {
      try {
        const decodedToken: DecodedToken = jwtDecode(storedToken);
        
        // Lógica de prioridade de 'role' para consistência
        let userRole: string;
        if (Array.isArray(decodedToken.role)) {
          userRole = decodedToken.role.includes('doctor') ? 'doctor' : decodedToken.role[0];
        } else {
          userRole = decodedToken.role;
        }

        setSession({ token: storedToken, role: userRole, userId: decodedToken.sub, profileId: decodedToken.profileId });
        setStatus('authenticated');
        resetApiInstances();
        console.log(`[AuthProvider] ✅ Sessão restaurada como '${userRole}'.`);

      } catch (e) {
        console.error('[AuthProvider] ❌ Token inválido ou expirado:', e);
        await deleteToken();
        resetApiInstances();
        setSession({ token: null, role: null, userId: null, profileId: null });
        setStatus('unauthenticated');
        console.log('[AuthProvider] Sessão limpa. Redirecionando para a home pública.');
        router.replace('/(app)');
      }
    } else {
      setSession({ token: null, role: null, userId: null, profileId: null });
      setStatus('unauthenticated');
    }
  };

  const refreshAuth = async () => {
    console.log('[AuthProvider] 🔄 Refresh de autenticação...');
    await bootstrapAsync();
  };

  const login = async (loginData: AuthDto.LoginRequest) => {
    try {
      // Faz o login na API
      const response = await apiLogin(loginData);
      // Salva o novo token
      await saveToken(response.token);
      await bootstrapAsync();

    } catch (error) {
      // Se o login falhar, força um logout completo para limpar qualquer estado inválido
      await forceLogout();
      console.error('[AuthProvider] ❌ Erro no login:', error);
      throw error; // Lança o erro para a tela de login poder mostrá-lo
    }
  };

  const forceLogout = async () => {
    await deleteToken();
    setSession({ token: null, role: null, userId: null, profileId: null });
    setStatus('unauthenticated');
    resetApiInstances();
    console.log('[Auth] Logout forçado. Estado atualizado.');
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
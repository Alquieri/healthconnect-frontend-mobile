import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { login as apiLogin, logout as apiLogout } from '../api/services/auth';
import { AuthDto } from '../api/models/auth';
import { saveToken, getToken, deleteToken } from '../api/services/secure-store.service';
import { resetApiInstances } from '../api/api';

// --- DEFINIÇÕES DE TIPO ---
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
  logout: () => void;
  isAuthenticated: boolean;
  forceLogout: () => Promise<void>;
  refreshAuth: () => Promise<void>; // <-- REINTRODUZIDO
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session>({ token: null, role: null, userId: null });
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
        const userRole = Array.isArray(decodedToken.role) ? decodedToken.role[0] : decodedToken.role;
        setSession({ token: storedToken, role: userRole, userId: decodedToken.sub });
        setStatus('authenticated');
        resetApiInstances();
        console.log('[AuthProvider] ✅ Sessão restaurada a partir do token.');
      } catch (e) {
        console.error('[AuthProvider] ❌ Token guardado é inválido. A forçar logout.', e);
        await forceLogout();
      }
    } else {
      setStatus('unauthenticated');
    }
  };

  // --- FUNÇÃO REFRESH AUTH REINTRODUZIDA E ADAPTADA ---
  const refreshAuth = async () => {
    console.log('[AuthProvider] 🔄 Refresh de autenticação...');
    const storedToken = await getToken();
    if (storedToken) {
      try {
        // Usa a mesma lógica do bootstrap para garantir consistência
        const decodedToken: DecodedToken = jwtDecode(storedToken);
        const userRole = Array.isArray(decodedToken.role) ? decodedToken.role[0] : decodedToken.role;
        setSession({ token: storedToken, role: userRole, userId: decodedToken.sub });
        setStatus('authenticated');
        resetApiInstances();
        console.log('[AuthProvider] ✅ Sessão atualizada com sucesso.');
      } catch (error) {
          console.error('[AuthProvider] ❌ Token inválido durante o refresh. A forçar logout.', error);
          await forceLogout();
          throw error; // Lança o erro para a tela saber que o refresh falhou
      }
    } else {
      console.log('[AuthProvider] ❌ Token não encontrado no refresh, forçando logout.');
      await forceLogout();
      throw new Error("Nenhum token encontrado durante o refresh.");
    }
  };

  const login = async (loginData: AuthDto.LoginRequest) => {
    // ... (função login permanece igual)
    setStatus('pending');
    try {
      const response = await apiLogin(loginData);
      await saveToken(response.token);
      const decodedToken: DecodedToken = jwtDecode(response.token);
      console.log('########## CONTEÚDO REAL DO TOKEN ##########', JSON.stringify(decodedToken, null, 2));
      const userRole = Array.isArray(decodedToken.role) ? decodedToken.role[0] : decodedToken.role;
      setSession({ token: response.token, role: userRole, userId: decodedToken.sub });
      setStatus('authenticated');
      resetApiInstances();
      console.log(`[AuthProvider] ✅ Login como '${userRole}' realizado. UserID: ${decodedToken.sub}`);
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
    refreshAuth, // <-- REINTRODUZIDO
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
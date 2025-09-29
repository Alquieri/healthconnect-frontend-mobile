import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router'; // ✅ ADICIONAR ESTES IMPORTS
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
  exp?: number;
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
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session>({ token: null, role: null, userId: null });
  const [status, setStatus] = useState<AuthStatus>('pending');
  
  // ✅ HOOKS DO EXPO ROUTER
  const router = useRouter();
  const segments = useSegments();

  // ✅ useProtectedRoute
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const inPatientGroup = segments[0] === '(patient)';
    const inDoctorGroup = segments[0] === '(doctor)';
    
    console.log('[AuthProvider] 📍 Segmentos atuais:', segments);
    console.log('[AuthProvider] 🔍 Status:', status, 'Role:', session?.role);

    if (status === 'pending') return;

    if (status === 'unauthenticated') {
      if (!inAuthGroup) {
        console.log('[AuthProvider] ➡️ Redirecionando para login');
        router.replace('/(auth)/login');
      }
    } else if (status === 'authenticated' && session?.role) {
      if (inAuthGroup) {
        // Vem do login - redirecionar baseado no role
        if (session.role === 'doctor') {
          console.log('[AuthProvider] ➡️ Redirecionando médico para dashboard');
          router.replace('/(doctor)');
        } else {
          console.log('[AuthProvider] ➡️ Redirecionando paciente para home');
          router.replace('/(patient)');
        }
      } else {
        // Verificar se está no grupo correto baseado no role
        const shouldBeInDoctorGroup = session.role === 'doctor';
        const shouldBeInPatientGroup = ['client', 'patient', 'admin'].includes(session.role);
        
        if (shouldBeInDoctorGroup && !inDoctorGroup) {
          console.log('[AuthProvider] ➡️ Médico no grupo errado, redirecionando');
          router.replace('/(doctor)');
        } else if (shouldBeInPatientGroup && !inPatientGroup) {
          console.log('[AuthProvider] ➡️ Paciente no grupo errado, redirecionando');
          router.replace('/(patient)');
        }
      }
    }
  }, [status, session?.role, segments, router]);

  // ✅ Bootstrap na inicialização
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    setStatus('pending');
    const storedToken = await getToken();
    if (storedToken) {
      try {
        const decodedToken: DecodedToken = jwtDecode(storedToken);
        
        // ✅ Verificar se token não expirou
        const now = Math.floor(Date.now() / 1000);
        if (decodedToken.exp && decodedToken.exp < now) {
          console.log('[AuthProvider] ⏰ Token expirado');
          await forceLogout();
          return;
        }
        
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

  const refreshAuth = async () => {
    console.log('[AuthProvider] 🔄 Refresh de autenticação...');
    const storedToken = await getToken();
    if (storedToken) {
      try {
        const decodedToken: DecodedToken = jwtDecode(storedToken);
        
        // ✅ Verificar se token não expirou
        const now = Math.floor(Date.now() / 1000);
        if (decodedToken.exp && decodedToken.exp < now) {
          console.log('[AuthProvider] ⏰ Token expirado no refresh');
          await forceLogout();
          throw new Error("Token expirado");
        }
        
        const userRole = Array.isArray(decodedToken.role) ? decodedToken.role[0] : decodedToken.role;
        setSession({ token: storedToken, role: userRole, userId: decodedToken.sub });
        setStatus('authenticated');
        resetApiInstances();
        console.log('[AuthProvider] ✅ Sessão atualizada com sucesso.');
      } catch (error) {
        console.error('[AuthProvider] ❌ Token inválido durante o refresh. A forçar logout.', error);
        await forceLogout();
        throw error;
      }
    } else {
      console.log('[AuthProvider] ❌ Token não encontrado no refresh, forçando logout.');
      await forceLogout();
      throw new Error("Nenhum token encontrado durante o refresh.");
    }
  };

  const login = async (loginData: AuthDto.LoginRequest) => {
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
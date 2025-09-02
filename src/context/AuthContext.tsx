import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipagem para o contexto de autenticação
interface AuthContextData {
  token: string | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aqui você pode adicionar uma lógica para carregar o token do AsyncStorage
    // Por enquanto, vamos simular que ele começa deslogado.
    setLoading(false);
  }, []);

  const signIn = async () => {
    // Aqui você faria a chamada para a sua API com Axios
    // Se a autenticação for bem-sucedida, você recebe e guarda o token.
    // Vamos simular um token para o exemplo:
    setToken('dummy-auth-token'); 
  };

  const signOut = () => {
    setToken(null);
    // Aqui você também limparia o token do AsyncStorage
  };

  return (
    <AuthContext.Provider value={{ token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
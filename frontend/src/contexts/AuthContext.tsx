/**
 * Contexto de Autenticação
 *
 * Gerencia o estado global de autenticação do usuário
 * Integração real com backend via authService
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService } from '@/services/authService';
import type { User } from '@/types';

/**
 * Interface do contexto de autenticação
 */
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider de Autenticação
 *
 * Responsável por:
 * - Carregar usuário do localStorage ao iniciar
 * - Validar sessão com backend
 * - Gerenciar estado de autenticação
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carregar perfil do usuário ao montar componente
   * Tenta recuperar sessão existente do localStorage
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar se tem token válido
        const token = authService.getAccessToken();
        const storedUser = authService.getStoredUser();

        if (token && storedUser) {
          // Tentar carregar perfil atualizado do backend
          try {
            const response = await authService.getProfile();
            if (response.success && response.data) {
              setUser(response.data);
            } else {
              // Se falhar, usar usuário do localStorage
              setUser(storedUser);
            }
          } catch (error) {
            // Se erro ao buscar perfil, usar dados locais
            console.warn('Usando dados do localStorage, falha ao buscar perfil:', error);
            setUser(storedUser);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        authService.clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Fazer login
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        setUser(response.data.user);
        return true;
      } else {
        setError(response.error || 'Falha ao fazer login');
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Erro ao fazer login');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Registrar novo usuário
   */
  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authService.register({
          full_name: name,
          email,
          password,
        });

        if (response.success && response.data) {
          setUser(response.data.user);
          return true;
        } else {
          setError(response.error || 'Falha ao registrar usuário');
          return false;
        }
      } catch (error: any) {
        console.error('Signup error:', error);
        setError(error.message || 'Erro ao registrar usuário');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Fazer logout
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Limpar estado mesmo com erro
      setUser(null);
    }
  }, []);

  /**
   * Atualizar dados do usuário
   */
  const updateUser = useCallback(async (data: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.updateProfile(data);

      if (response.success && response.data) {
        setUser(response.data);
        return true;
      } else {
        setError(response.error || 'Falha ao atualizar perfil');
        return false;
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      setError(error.message || 'Erro ao atualizar perfil');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Recarregar dados do usuário do backend
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    updateUser,
    refreshUser,
    isLoading,
    isAuthenticated: !!user,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook para usar o contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
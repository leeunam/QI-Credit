/**
 * React Query Hooks para Autenticação
 *
 * Hooks opcionais para operações de autenticação usando React Query
 * Úteis quando precisar de cache, invalidação automática, etc.
 *
 * NOTA: O AuthContext continua sendo a forma principal de gerenciar auth.
 * Estes hooks são complementares para casos específicos.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import type { LoginCredentials, RegisterData, User } from '@/types';

/**
 * Query keys para autenticação
 */
export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
  status: () => [...authKeys.all, 'status'] as const,
  users: () => [...authKeys.all, 'users'] as const,
  user: (id: string) => [...authKeys.all, 'user', id] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para obter perfil do usuário autenticado
 *
 * Uso:
 * ```tsx
 * const { data: user, isLoading, error } = useUserProfile();
 * ```
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao buscar perfil');
    },
    enabled: authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 1,
  });
};

/**
 * Hook para verificar status de autenticação
 *
 * Uso:
 * ```tsx
 * const { data: authStatus } = useAuthStatus();
 * ```
 */
export const useAuthStatus = () => {
  return useQuery({
    queryKey: authKeys.status(),
    queryFn: async () => {
      const response = await authService.checkAuthStatus();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao verificar status');
    },
    enabled: authService.isAuthenticated(),
    staleTime: 30 * 1000, // Cache por 30 segundos
  });
};

/**
 * Hook para listar usuários (admin)
 *
 * Uso:
 * ```tsx
 * const { data: users, isLoading } = useUsersList();
 * ```
 */
export const useUsersList = () => {
  return useQuery({
    queryKey: authKeys.users(),
    queryFn: async () => {
      const response = await authService.listUsers();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao listar usuários');
    },
    enabled: authService.isAuthenticated(),
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos
  });
};

/**
 * Hook para obter usuário específico (admin)
 *
 * Uso:
 * ```tsx
 * const { data: user, isLoading } = useUser(userId);
 * ```
 */
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: authKeys.user(userId),
    queryFn: async () => {
      const response = await authService.getUser(userId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao buscar usuário');
    },
    enabled: !!userId && authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para fazer login
 *
 * Uso:
 * ```tsx
 * const loginMutation = useLogin();
 *
 * const handleLogin = async () => {
 *   try {
 *     const result = await loginMutation.mutateAsync({
 *       email: 'user@example.com',
 *       password: '123456'
 *     });
 *     console.log('Usuário:', result.user);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao fazer login');
    },
    onSuccess: (data) => {
      // Atualizar cache do perfil
      queryClient.setQueryData(authKeys.profile(), data.user);
      // Invalidar outras queries relacionadas
      queryClient.invalidateQueries({ queryKey: authKeys.status() });
    },
  });
};

/**
 * Hook para registrar novo usuário
 *
 * Uso:
 * ```tsx
 * const registerMutation = useRegister();
 *
 * const handleRegister = async () => {
 *   try {
 *     const result = await registerMutation.mutateAsync({
 *       full_name: 'João Silva',
 *       email: 'joao@example.com',
 *       password: '123456'
 *     });
 *     console.log('Usuário criado:', result.user);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await authService.register(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao registrar usuário');
    },
    onSuccess: (data) => {
      // Atualizar cache do perfil
      queryClient.setQueryData(authKeys.profile(), data.user);
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: authKeys.status() });
    },
  });
};

/**
 * Hook para fazer logout
 *
 * Uso:
 * ```tsx
 * const logoutMutation = useLogout();
 *
 * const handleLogout = () => {
 *   logoutMutation.mutate();
 * };
 * ```
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      // Limpar todo o cache de autenticação
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
    },
  });
};

/**
 * Hook para atualizar perfil
 *
 * Uso:
 * ```tsx
 * const updateProfileMutation = useUpdateProfile();
 *
 * const handleUpdate = async () => {
 *   try {
 *     const updatedUser = await updateProfileMutation.mutateAsync({
 *       full_name: 'João Silva Jr.'
 *     });
 *     console.log('Perfil atualizado:', updatedUser);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await authService.updateProfile(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao atualizar perfil');
    },
    onSuccess: (data) => {
      // Atualizar cache do perfil
      queryClient.setQueryData(authKeys.profile(), data);
    },
  });
};

/**
 * Hook para atualizar usuário específico (admin)
 *
 * Uso:
 * ```tsx
 * const updateUserMutation = useUpdateUser();
 *
 * const handleUpdate = async (userId: string) => {
 *   try {
 *     const updatedUser = await updateUserMutation.mutateAsync({
 *       userId,
 *       data: { role: 'admin' }
 *     });
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<User> }) => {
      const response = await authService.updateUser(userId, data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao atualizar usuário');
    },
    onSuccess: (data, variables) => {
      // Atualizar cache do usuário específico
      queryClient.setQueryData(authKeys.user(variables.userId), data);
      // Invalidar lista de usuários
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

/**
 * Hook para deletar usuário (admin)
 *
 * Uso:
 * ```tsx
 * const deleteUserMutation = useDeleteUser();
 *
 * const handleDelete = async (userId: string) => {
 *   if (confirm('Tem certeza?')) {
 *     await deleteUserMutation.mutateAsync(userId);
 *   }
 * };
 * ```
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await authService.deleteUser(userId);
      if (response.success) {
        return userId;
      }
      throw new Error(response.error || 'Erro ao deletar usuário');
    },
    onSuccess: (userId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: authKeys.user(userId) });
      // Invalidar lista de usuários
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
    },
  });
};

// ============================================================================
// HOOKS COMPOSTOS
// ============================================================================

/**
 * Hook combinado para gerenciar autenticação completa
 *
 * Uso:
 * ```tsx
 * const {
 *   user,
 *   isLoading,
 *   isAuthenticated,
 *   login,
 *   logout,
 *   register,
 *   updateProfile
 * } = useAuthManagement();
 * ```
 */
export const useAuthManagement = () => {
  const { data: user, isLoading } = useUserProfile();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const registerMutation = useRegister();
  const updateProfileMutation = useUpdateProfile();

  return {
    // Estado
    user: user || null,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    isAuthenticated: !!user,
    error:
      loginMutation.error?.message ||
      registerMutation.error?.message ||
      updateProfileMutation.error?.message ||
      null,

    // Ações
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,

    // Estados das mutações
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isUpdating: updateProfileMutation.isPending,
  };
};

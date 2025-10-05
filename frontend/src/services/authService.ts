/**
 * Serviço de Autenticação
 *
 * Integração real com o backend /api/auth
 * Substitui os mocks anteriores por chamadas HTTP reais
 */

import { apiClient } from './apiClients';
import type {
  ApiResponse,
  User,
  AuthTokens,
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from '@/types';

/**
 * Chaves de armazenamento local
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

/**
 * Serviço de Autenticação
 */
export const authService = {
  /**
   * Fazer login
   * POST /api/auth/login
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post('/auth/login', credentials);

      // Salvar tokens e dados do usuário
      if (response.data.success && response.data.data) {
        const { tokens, user } = response.data.data;
        this.saveTokens(tokens);
        this.saveUser(user);
      }

      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao fazer login',
        code: error.response?.data?.code || 'LOGIN_ERROR',
      };
    }
  },

  /**
   * Registrar novo usuário
   * POST /api/auth/register
   */
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post('/auth/register', data);

      // Salvar tokens e dados do usuário automaticamente após registro
      if (response.data.success && response.data.data) {
        const { tokens, user } = response.data.data;
        this.saveTokens(tokens);
        this.saveUser(user);
      }

      return response.data;
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao registrar usuário',
        code: error.response?.data?.code || 'REGISTER_ERROR',
        details: error.response?.data?.details,
      };
    }
  },

  /**
   * Renovar token de acesso
   * POST /api/auth/refresh-token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    try {
      const response = await apiClient.post('/auth/refresh-token', { refreshToken });

      // Salvar novos tokens
      if (response.data.success && response.data.data) {
        this.saveTokens(response.data.data);
      }

      return response.data;
    } catch (error: any) {
      console.error('Refresh token error:', error);

      // Se falhar ao renovar, limpar sessão
      this.clearSession();

      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao renovar token',
        code: error.response?.data?.code || 'REFRESH_TOKEN_ERROR',
      };
    }
  },

  /**
   * Obter perfil do usuário autenticado
   * GET /api/auth/profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get('/auth/profile');

      // Atualizar usuário no localStorage
      if (response.data.success && response.data.data) {
        this.saveUser(response.data.data);
      }

      return response.data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar perfil',
        code: error.response?.data?.code || 'GET_PROFILE_ERROR',
      };
    }
  },

  /**
   * Atualizar perfil do usuário
   * PUT /api/auth/profile
   */
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put('/auth/profile', data);

      // Atualizar usuário no localStorage
      if (response.data.success && response.data.data) {
        this.saveUser(response.data.data);
      }

      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar perfil',
        code: error.response?.data?.code || 'UPDATE_PROFILE_ERROR',
        details: error.response?.data?.details,
      };
    }
  },

  /**
   * Verificar status de autenticação
   * GET /api/auth/status
   */
  async checkAuthStatus(): Promise<ApiResponse<{ authenticated: boolean; user?: User }>> {
    try {
      const response = await apiClient.get('/auth/status');
      return response.data;
    } catch (error: any) {
      console.error('Check auth status error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao verificar status',
        code: error.response?.data?.code || 'CHECK_STATUS_ERROR',
      };
    }
  },

  /**
   * Fazer logout
   * Limpa tokens e dados do usuário do localStorage
   */
  async logout(): Promise<void> {
    try {
      // Pode adicionar chamada ao backend se houver endpoint de logout
      // await apiClient.post('/auth/logout');

      this.clearSession();
    } catch (error) {
      console.error('Logout error:', error);
      // Limpar sessão mesmo com erro
      this.clearSession();
    }
  },

  // ============================================================================
  // MÉTODOS AUXILIARES DE ARMAZENAMENTO
  // ============================================================================

  /**
   * Salvar tokens no localStorage
   */
  saveTokens(tokens: AuthTokens): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  },

  /**
   * Salvar usuário no localStorage
   */
  saveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  /**
   * Obter access token do localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Obter refresh token do localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Obter usuário do localStorage
   */
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  },

  /**
   * Verificar se está autenticado (tem token)
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  /**
   * Limpar sessão completa
   */
  clearSession(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // ============================================================================
  // ADMIN - GERENCIAMENTO DE USUÁRIOS (futuro)
  // ============================================================================

  /**
   * Listar todos os usuários (admin)
   * GET /api/auth/users
   */
  async listUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await apiClient.get('/auth/users');
      return response.data;
    } catch (error: any) {
      console.error('List users error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar usuários',
        code: error.response?.data?.code || 'LIST_USERS_ERROR',
      };
    }
  },

  /**
   * Obter usuário específico (admin)
   * GET /api/auth/users/:id
   */
  async getUser(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get(`/auth/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get user error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar usuário',
        code: error.response?.data?.code || 'GET_USER_ERROR',
      };
    }
  },

  /**
   * Atualizar usuário específico (admin)
   * PUT /api/auth/users/:id
   */
  async updateUser(userId: string, data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put(`/auth/users/${userId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar usuário',
        code: error.response?.data?.code || 'UPDATE_USER_ERROR',
      };
    }
  },

  /**
   * Deletar usuário (admin)
   * DELETE /api/auth/users/:id
   */
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/auth/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete user error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao deletar usuário',
        code: error.response?.data?.code || 'DELETE_USER_ERROR',
      };
    }
  },
};

export default authService;

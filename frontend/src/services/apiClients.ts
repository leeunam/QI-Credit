import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Cliente HTTP configurado para comunicação com o backend
 * Inclui interceptors para:
 * - Autenticação automática via JWT
 * - Refresh token automático em caso de 401
 * - Tratamento de erros comuns
 */

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

/**
 * Processar fila de requisições que falharam durante refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ============================================================================
// INTERCEPTOR DE REQUISIÇÃO - Adiciona token JWT automaticamente
// ============================================================================

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Para FormData, deixar o navegador definir Content-Type automaticamente
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// INTERCEPTOR DE RESPOSTA - Refresh token automático em 401
// ============================================================================

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - arquivo muito grande ou conexão lenta');
      return Promise.reject(error);
    }

    // Payload muito grande
    if (error.response?.status === 413) {
      console.error('Arquivo muito grande');
      return Promise.reject(error);
    }

    // ========================================================================
    // Tratamento de 401 - Não autorizado
    // ========================================================================

    if (error.response?.status === 401 && originalRequest) {
      // Evitar loop infinito em endpoints de auth
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh-token')
      ) {
        // Se falhou no login/register/refresh, não tentar refresh
        return Promise.reject(error);
      }

      // Se já tentou fazer refresh, redirecionar para login
      if (originalRequest._retry) {
        console.warn('Refresh token falhou, redirecionando para login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Se já está fazendo refresh, adicionar à fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Marcar que está fazendo refresh
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        console.warn('Nenhum refresh token disponível');
        isRefreshing = false;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Tentar renovar o token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/refresh-token`,
          { refreshToken }
        );

        if (response.data.success && response.data.data) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Salvar novos tokens
          localStorage.setItem('authToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Atualizar header da requisição original
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          // Processar fila de requisições que estavam esperando
          processQueue(null, accessToken);
          isRefreshing = false;

          // Retentar requisição original
          return apiClient(originalRequest);
        } else {
          throw new Error('Resposta inválida do refresh token');
        }
      } catch (refreshError) {
        // Falha no refresh - limpar sessão e redirecionar
        processQueue(refreshError as Error, null);
        isRefreshing = false;

        console.error('Erro ao renovar token:', refreshError);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // Outros erros
    return Promise.reject(error);
  }
);

export { apiClient };
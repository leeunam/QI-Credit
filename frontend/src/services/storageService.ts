/**
 * Serviço de Storage
 *
 * Integração com backend /api/storage para upload e gerenciamento de arquivos
 * Usado principalmente para upload de documentos durante onboarding/KYC
 *
 * Rotas backend:
 * - POST /api/storage/upload - Upload de arquivo
 * - GET /api/storage/download/:fileId - Download de arquivo
 * - GET /api/storage/files - Listar arquivos
 * - DELETE /api/storage/files/:fileId - Deletar arquivo
 */

import { apiClient } from './apiClients';
import type { ApiResponse, UploadFileResult, FileMetadata } from '@/types';

// ============================================================================
// INTERFACES ESPECÍFICAS DO STORAGE
// ============================================================================

/**
 * Opções para upload de arquivo
 */
export interface UploadOptions {
  userId?: string;
  category?: 'document' | 'selfie' | 'proof' | 'other';
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
}

/**
 * Filtros para listagem de arquivos
 */
export interface ListFilesFilters {
  userId?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// SERVIÇO DE STORAGE
// ============================================================================

export const storageService = {
  /**
   * Upload de arquivo
   * POST /api/storage/upload
   *
   * @param file - Arquivo a ser enviado
   * @param options - Opções de upload (categoria, userId, etc)
   */
  async uploadFile(
    file: File,
    options?: UploadOptions
  ): Promise<ApiResponse<UploadFileResult>> {
    try {
      // Criar FormData
      const formData = new FormData();
      formData.append('file', file);

      // Adicionar metadados se fornecidos
      if (options?.userId) {
        formData.append('userId', options.userId);
      }
      if (options?.category) {
        formData.append('category', options.category);
      }
      if (options?.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata));
      }

      // Configurar tracking de progresso
      const config = options?.onProgress
        ? {
            onUploadProgress: (progressEvent: any) => {
              const progress = progressEvent.total
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;
              options.onProgress?.(progress);
            },
          }
        : {};

      const response = await apiClient.post('/storage/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        ...config,
      });

      return {
        success: true,
        data: response.data,
        message: 'Arquivo enviado com sucesso',
      };
    } catch (error: any) {
      console.error('Upload file error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao fazer upload do arquivo',
        code: error.response?.data?.code || 'UPLOAD_ERROR',
      };
    }
  },

  /**
   * Gerar URL de download
   * GET /api/storage/download/:fileId
   */
  async getDownloadUrl(fileId: string): Promise<ApiResponse<{ url: string; expiresAt: string }>> {
    try {
      const response = await apiClient.get(`/storage/download/${fileId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Get download URL error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao gerar URL de download',
        code: error.response?.data?.code || 'DOWNLOAD_URL_ERROR',
      };
    }
  },

  /**
   * Listar arquivos
   * GET /api/storage/files
   */
  async listFiles(filters?: ListFilesFilters): Promise<ApiResponse<FileMetadata[]>> {
    try {
      const params = new URLSearchParams();

      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await apiClient.get(`/storage/files?${params.toString()}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('List files error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar arquivos',
        code: error.response?.data?.code || 'LIST_FILES_ERROR',
      };
    }
  },

  /**
   * Deletar arquivo
   * DELETE /api/storage/files/:fileId
   */
  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/storage/files/${fileId}`);

      return {
        success: true,
        message: 'Arquivo deletado com sucesso',
      };
    } catch (error: any) {
      console.error('Delete file error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao deletar arquivo',
        code: error.response?.data?.code || 'DELETE_FILE_ERROR',
      };
    }
  },

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  /**
   * Validar arquivo antes do upload
   */
  validateFile(
    file: File,
    options?: {
      maxSize?: number; // em bytes
      allowedTypes?: string[];
    }
  ): { valid: boolean; error?: string } {
    const maxSize = options?.maxSize || 10 * 1024 * 1024; // 10MB padrão
    const allowedTypes = options?.allowedTypes || [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];

    // Validar tamanho
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024);
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo ${maxSizeMB}MB.`,
      };
    }

    // Validar tipo
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não permitido.',
      };
    }

    return { valid: true };
  },

  /**
   * Formatar tamanho de arquivo para exibição
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Obter extensão do arquivo
   */
  getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
  },

  /**
   * Verificar se arquivo é imagem
   */
  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  },

  /**
   * Verificar se arquivo é PDF
   */
  isPdfFile(file: File): boolean {
    return file.type === 'application/pdf';
  },

  /**
   * Criar preview de imagem
   */
  createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isImageFile(file)) {
        reject(new Error('File is not an image'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to create preview'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsDataURL(file);
    });
  },

  /**
   * Upload múltiplos arquivos
   */
  async uploadMultipleFiles(
    files: File[],
    options?: UploadOptions
  ): Promise<ApiResponse<UploadFileResult[]>> {
    try {
      const uploadPromises = files.map((file) => this.uploadFile(file, options));
      const results = await Promise.all(uploadPromises);

      // Verificar se todos foram bem-sucedidos
      const failedUploads = results.filter((r) => !r.success);
      if (failedUploads.length > 0) {
        return {
          success: false,
          error: `${failedUploads.length} arquivo(s) falharam no upload`,
        };
      }

      const uploadedFiles = results
        .filter((r) => r.success && r.data)
        .map((r) => r.data!);

      return {
        success: true,
        data: uploadedFiles,
        message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
      };
    } catch (error: any) {
      console.error('Upload multiple files error:', error);
      return {
        success: false,
        error: 'Erro ao fazer upload de múltiplos arquivos',
      };
    }
  },
};

export default storageService;

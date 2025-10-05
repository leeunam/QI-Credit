import { apiClient } from './apiClients';

export interface UploadOptions {
  bucket?: 'documents' | 'contracts' | 'kyc';
  folder?: string;
  isPublic?: boolean;
}

export interface UploadResponse {
  success: boolean;
  data?: {
    fileId: string;
    path: string;
    fileName: string;
    publicUrl?: string;
    size: number;
    mimetype: string;
    uploadedAt: Date;
  };
  error?: string;
}

export interface DownloadUrlResponse {
  success: boolean;
  data?: {
    downloadUrl: string;
    expiresAt: Date;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
  error?: string;
}

class StorageService {
  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResponse> {
    try {
      const validation = this.validateFile(file, options);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', options.bucket || 'documents');
      
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      
      if (options.isPublic) {
        formData.append('isPublic', 'true');
      }

      // Enviar a requisição sem definir explicitamente Content-Type
      // O axios irá definir automaticamente com o boundary correto quando for FormData
      const response = await apiClient.post('/storage/upload', formData);

      // Verificar se a resposta tem a estrutura esperada
      if (response.data && typeof response.data === 'object' && response.data.success !== undefined) {
        return {
          success: response.data.success,
          data: response.data.data,
          error: response.data.error
        };
      } else {
        console.error('Estrutura de resposta inesperada:', response.data);
        return {
          success: false,
          error: 'Estrutura de resposta inesperada do servidor'
        };
      }

    } catch (error: any) {
      console.error('Upload error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        request: error.request
      });
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Erro no upload do arquivo'
      };
    }
  }

  async getDownloadUrl(fileId: string, expiresIn: number = 3600): Promise<DownloadUrlResponse> {
    try {
      const response = await apiClient.get(`/storage/download/${fileId}`, {
        params: { expiresIn }
      });

      return {
        success: true,
        data: response.data.data
      };

    } catch (error: any) {
      console.error('Download URL error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao gerar link de download'
      };
    }
  }

  async listFiles(bucket?: string) {
    try {
      const params = bucket ? { bucket } : {};
      const response = await apiClient.get('/storage/files', { params });

      return {
        success: true,
        data: response.data.data,
        count: response.data.count
      };

    } catch (error: any) {
      console.error('List files error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao listar arquivos'
      };
    }
  }

  async deleteFile(fileId: string) {
    try {
      await apiClient.delete(`/storage/files/${fileId}`);
      return { success: true };

    } catch (error: any) {
      console.error('Delete file error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao deletar arquivo'
      };
    }
  }

  private validateFile(file: File, options: UploadOptions) {
    const errors: string[] = [];

    const bucketConfig = {
      documents: {
        maxSize: 8 * 1024 * 1024, 
        allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf']
      },
      contracts: {
        maxSize: 10 * 1024 * 1024, 
        allowedTypes: ['application/pdf'],
        allowedExtensions: ['.pdf']
      },
      kyc: {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png'],
        allowedExtensions: ['.jpg', '.jpeg', '.png']
      }
    };

    const config = bucketConfig[options.bucket || 'documents'];

    if (file.size > config.maxSize) {
      const maxSizeMB = config.maxSize / (1024 * 1024);
      errors.push(`Arquivo muito grande. Máximo ${maxSizeMB}MB`);
    }

    if (!config.allowedTypes.includes(file.type)) {
      errors.push(`Tipo de arquivo não permitido. Use: ${config.allowedTypes.join(', ')}`);
    }

    const fileName = file.name.toLowerCase();
    const hasValidExtension = config.allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      errors.push(`Extensão não permitida. Use: ${config.allowedExtensions.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const storageService = new StorageService();
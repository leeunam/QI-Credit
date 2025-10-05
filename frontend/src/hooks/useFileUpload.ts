import { useState, useCallback } from 'react';
import { storageService, UploadOptions, UploadResponse } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: UploadResponse['data'] | null;
}

export interface UseFileUploadReturn {
  uploadState: UploadState;
  uploadFile: (file: File, options?: UploadOptions) => Promise<{ success: boolean; data?: UploadResponse['data'] }>;
  resetUpload: () => void;
  deleteFile: (fileId: string) => Promise<boolean>;
}

export function useFileUpload(): UseFileUploadReturn {
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedFile: null
  });

  const uploadFile = useCallback(async (file: File, options?: UploadOptions): Promise<{ success: boolean; data?: UploadResponse['data'] }> => {
    try {
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
        uploadedFile: null
      });

      // Simular progresso (em produção, usar onUploadProgress do axios)
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 100);

      const result = await storageService.uploadFile(file, options);

      clearInterval(progressInterval);

      console.log('Resultado do upload no hook:', result);

      if (result.success === true && result.data) {
        setUploadState({
          isUploading: false,
          progress: 100,
          error: null,
          uploadedFile: result.data
        });

        toast({
          title: 'Upload concluído!',
          description: `${file.name} foi enviado com sucesso.`,
        });

        return { success: true, data: result.data };
      } else {
        const errorMessage = result.error || 'Erro desconhecido no upload';
        setUploadState({
          isUploading: false,
          progress: 0,
          error: errorMessage,
          uploadedFile: null
        });

        toast({
          variant: 'destructive',
          title: 'Erro no upload',
          description: errorMessage,
        });

        return { success: false };
      }

    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: 'Erro inesperado no upload',
        uploadedFile: null
      });

      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro inesperado durante o upload',
      });

      return { success: false };
    }
  }, [toast]);

  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedFile: null
    });
  }, []);

  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    try {
      const result = await storageService.deleteFile(fileId);
      
      if (result.success) {
        toast({
          title: 'Arquivo deletado',
          description: 'Arquivo removido com sucesso.',
        });
        resetUpload();
        return true;
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: result.error || 'Erro ao deletar arquivo',
        });
        return false;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro inesperado ao deletar arquivo',
      });
      return false;
    }
  }, [toast, resetUpload]);

  return {
    uploadState,
    uploadFile,
    resetUpload,
    deleteFile
  };
}

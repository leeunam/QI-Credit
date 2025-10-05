/**
 * React Query Hooks para Onboarding & KYC
 *
 * Hooks para gerenciar estado de onboarding usando React Query
 * Inclui cache automático, invalidação e estados de loading
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { onboardingService } from '@/services/onboardingService';
import { storageService } from '@/services/storageService';
import type {
  VerifyIdentityData,
  UploadOptions,
} from '@/services/onboardingService';

/**
 * Query keys para onboarding
 */
export const onboardingKeys = {
  all: ['onboarding'] as const,
  status: (userId: string) => [...onboardingKeys.all, 'status', userId] as const,
  files: (userId: string) => [...onboardingKeys.all, 'files', userId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para obter status do onboarding
 *
 * Uso:
 * ```tsx
 * const { data: status, isLoading } = useOnboardingStatus(userId);
 * ```
 */
export const useOnboardingStatus = (userId: string) => {
  return useQuery({
    queryKey: onboardingKeys.status(userId),
    queryFn: async () => {
      const response = await onboardingService.getStatus(userId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao buscar status do onboarding');
    },
    enabled: !!userId,
    refetchInterval: 10000, // Atualizar a cada 10 segundos
    staleTime: 5000, // Cache por 5 segundos
  });
};

/**
 * Hook para listar arquivos do usuário
 *
 * Uso:
 * ```tsx
 * const { data: files, isLoading } = useUserFiles(userId);
 * ```
 */
export const useUserFiles = (userId: string, category?: string) => {
  return useQuery({
    queryKey: [...onboardingKeys.files(userId), category],
    queryFn: async () => {
      const response = await storageService.listFiles({ userId, category });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao listar arquivos');
    },
    enabled: !!userId,
    staleTime: 30000, // Cache por 30 segundos
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para verificar identidade (KYC)
 *
 * Uso:
 * ```tsx
 * const verifyMutation = useVerifyIdentity();
 *
 * const handleVerify = async () => {
 *   try {
 *     const result = await verifyMutation.mutateAsync({
 *       userId: user.id,
 *       documentType: 'cpf',
 *       documentNumber: '12345678900',
 *       documentImage: documentFile,
 *       faceImage: selfieFile
 *     });
 *     console.log('Verificação:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useVerifyIdentity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VerifyIdentityData) => {
      // Preparar dados (converter Files para base64 se necessário)
      const preparedData = await onboardingService.prepareVerificationData(data);

      const response = await onboardingService.verifyIdentity(preparedData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao verificar identidade');
    },
    onSuccess: (data, variables) => {
      // Invalidar status do onboarding para atualizar
      queryClient.invalidateQueries({
        queryKey: onboardingKeys.status(variables.userId),
      });
    },
  });
};

/**
 * Hook para completar onboarding
 *
 * Uso:
 * ```tsx
 * const completeMutation = useCompleteOnboarding();
 *
 * const handleComplete = async () => {
 *   try {
 *     await completeMutation.mutateAsync(userId);
 *     navigate('/dashboard');
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await onboardingService.complete(userId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao completar onboarding');
    },
    onSuccess: (data, userId) => {
      // Invalidar status do onboarding
      queryClient.invalidateQueries({
        queryKey: onboardingKeys.status(userId),
      });
    },
  });
};

/**
 * Hook para upload de arquivo
 *
 * Uso:
 * ```tsx
 * const uploadMutation = useUploadFile();
 *
 * const handleUpload = async (file: File) => {
 *   try {
 *     const result = await uploadMutation.mutateAsync({
 *       file,
 *       options: {
 *         userId: user.id,
 *         category: 'document',
 *         onProgress: (progress) => console.log(`${progress}%`)
 *       }
 *     });
 *     console.log('Upload:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      options,
    }: {
      file: File;
      options?: UploadOptions;
    }) => {
      const response = await storageService.uploadFile(file, options);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao fazer upload');
    },
    onSuccess: (data, variables) => {
      // Invalidar lista de arquivos do usuário
      if (variables.options?.userId) {
        queryClient.invalidateQueries({
          queryKey: onboardingKeys.files(variables.options.userId),
        });
      }
    },
  });
};

/**
 * Hook para upload de múltiplos arquivos
 *
 * Uso:
 * ```tsx
 * const uploadMultipleMutation = useUploadMultipleFiles();
 *
 * const handleUploadMultiple = async (files: File[]) => {
 *   try {
 *     const results = await uploadMultipleMutation.mutateAsync({
 *       files,
 *       options: { userId: user.id, category: 'document' }
 *     });
 *     console.log(`${results.length} arquivos enviados`);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useUploadMultipleFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      files,
      options,
    }: {
      files: File[];
      options?: UploadOptions;
    }) => {
      const response = await storageService.uploadMultipleFiles(files, options);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao fazer upload de múltiplos arquivos');
    },
    onSuccess: (data, variables) => {
      // Invalidar lista de arquivos do usuário
      if (variables.options?.userId) {
        queryClient.invalidateQueries({
          queryKey: onboardingKeys.files(variables.options.userId),
        });
      }
    },
  });
};

/**
 * Hook para deletar arquivo
 *
 * Uso:
 * ```tsx
 * const deleteMutation = useDeleteFile();
 *
 * const handleDelete = async (fileId: string) => {
 *   if (confirm('Deletar arquivo?')) {
 *     await deleteMutation.mutateAsync({ fileId, userId: user.id });
 *   }
 * };
 * ```
 */
export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, userId }: { fileId: string; userId?: string }) => {
      const response = await storageService.deleteFile(fileId);
      if (response.success) {
        return fileId;
      }
      throw new Error(response.error || 'Erro ao deletar arquivo');
    },
    onSuccess: (fileId, variables) => {
      // Invalidar lista de arquivos do usuário
      if (variables.userId) {
        queryClient.invalidateQueries({
          queryKey: onboardingKeys.files(variables.userId),
        });
      }
    },
  });
};

// ============================================================================
// HOOKS COMPOSTOS
// ============================================================================

/**
 * Hook combinado para gerenciar onboarding completo
 *
 * Uso:
 * ```tsx
 * const {
 *   status,
 *   files,
 *   isLoading,
 *   verifyIdentity,
 *   completeOnboarding,
 *   uploadFile
 * } = useOnboardingManagement(userId);
 * ```
 */
export const useOnboardingManagement = (userId: string) => {
  const { data: status, isLoading: statusLoading } = useOnboardingStatus(userId);
  const { data: files, isLoading: filesLoading } = useUserFiles(userId);
  const verifyMutation = useVerifyIdentity();
  const completeMutation = useCompleteOnboarding();
  const uploadMutation = useUploadFile();

  return {
    // Estado
    status: status || null,
    files: files || [],
    isLoading: statusLoading || filesLoading,
    error:
      verifyMutation.error?.message ||
      completeMutation.error?.message ||
      uploadMutation.error?.message ||
      null,

    // Ações
    verifyIdentity: verifyMutation.mutateAsync,
    completeOnboarding: completeMutation.mutateAsync,
    uploadFile: uploadMutation.mutateAsync,

    // Estados das mutações
    isVerifying: verifyMutation.isPending,
    isCompleting: completeMutation.isPending,
    isUploading: uploadMutation.isPending,
  };
};

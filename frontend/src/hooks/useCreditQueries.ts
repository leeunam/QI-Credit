/**
 * React Query Hooks para Análise de Crédito
 *
 * Hooks para gerenciar análise de crédito usando React Query
 * Inclui cache automático, invalidação e estados de loading
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { creditAnalysisService } from '@/services/creditAnalysisService';
import type {
  IndividualCreditAnalysisData,
  BusinessCreditAnalysisData,
  CreditHistoryFilters,
} from '@/services/creditAnalysisService';
import type { CreditAnalysisStatus } from '@/types';

/**
 * Query keys para análise de crédito
 */
export const creditKeys = {
  all: ['credit'] as const,
  score: (userId: string) => [...creditKeys.all, 'score', userId] as const,
  history: (userId: string, filters?: Partial<CreditHistoryFilters>) =>
    [...creditKeys.all, 'history', userId, filters] as const,
  analysis: (analysisId: string) => [...creditKeys.all, 'analysis', analysisId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para obter score de crédito do usuário
 *
 * Uso:
 * ```tsx
 * const { data: score, isLoading } = useCreditScore(userId);
 * ```
 */
export const useCreditScore = (
  userId: string,
  entityType: 'natural_person' | 'legal_entity' = 'natural_person'
) => {
  return useQuery({
    queryKey: [...creditKeys.score(userId), entityType],
    queryFn: async () => {
      const response = await creditAnalysisService.getCreditScore(userId, entityType);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao buscar score de crédito');
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 2,
  });
};

/**
 * Hook para obter histórico de análises de crédito
 *
 * Uso:
 * ```tsx
 * const { data: history, isLoading } = useCreditHistory(userId, {
 *   status: 'approved',
 *   limit: 10
 * });
 * ```
 */
export const useCreditHistory = (userId: string, filters?: Partial<CreditHistoryFilters>) => {
  return useQuery({
    queryKey: creditKeys.history(userId, filters),
    queryFn: async () => {
      const response = await creditAnalysisService.getHistory({
        userId,
        ...filters,
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao buscar histórico');
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para submeter análise de crédito individual (PF)
 *
 * Uso:
 * ```tsx
 * const submitIndividualMutation = useSubmitIndividualCredit();
 *
 * const handleSubmit = async () => {
 *   try {
 *     const result = await submitIndividualMutation.mutateAsync({
 *       userId: user.id,
 *       document: '12345678900',
 *       fullName: 'João Silva',
 *       birthDate: '1990-01-01',
 *       monthlyIncome: 5000,
 *       requestedAmount: 10000,
 *       loanPurpose: 'Capital de giro'
 *     });
 *     console.log('Análise:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useSubmitIndividualCredit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IndividualCreditAnalysisData) => {
      // Validar dados antes de enviar
      const validation = creditAnalysisService.validateIndividualData(data);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await creditAnalysisService.submitIndividual(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao enviar análise de crédito');
    },
    onSuccess: (data, variables) => {
      // Invalidar score do usuário (pode ter sido atualizado)
      queryClient.invalidateQueries({
        queryKey: creditKeys.score(variables.userId),
      });
      // Invalidar histórico
      queryClient.invalidateQueries({
        queryKey: creditKeys.history(variables.userId),
      });
    },
  });
};

/**
 * Hook para submeter análise de crédito empresarial (PJ)
 *
 * Uso:
 * ```tsx
 * const submitBusinessMutation = useSubmitBusinessCredit();
 *
 * const handleSubmit = async () => {
 *   try {
 *     const result = await submitBusinessMutation.mutateAsync({
 *       userId: user.id,
 *       document: '12345678000190',
 *       companyName: 'Empresa LTDA',
 *       foundedDate: '2020-01-01',
 *       monthlyRevenue: 50000,
 *       requestedAmount: 100000,
 *       loanPurpose: 'Expansão'
 *     });
 *     console.log('Análise:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useSubmitBusinessCredit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BusinessCreditAnalysisData) => {
      // Validar dados antes de enviar
      const validation = creditAnalysisService.validateBusinessData(data);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await creditAnalysisService.submitBusiness(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao enviar análise empresarial');
    },
    onSuccess: (data, variables) => {
      // Invalidar score do usuário
      queryClient.invalidateQueries({
        queryKey: creditKeys.score(variables.userId),
      });
      // Invalidar histórico
      queryClient.invalidateQueries({
        queryKey: creditKeys.history(variables.userId),
      });
    },
  });
};

/**
 * Hook para atualizar status de análise
 *
 * Uso:
 * ```tsx
 * const updateStatusMutation = useUpdateCreditStatus();
 *
 * const handleUpdateStatus = async (analysisId: string) => {
 *   await updateStatusMutation.mutateAsync({
 *     analysisId,
 *     status: 'approved',
 *     entityType: 'natural_person'
 *   });
 * };
 * ```
 */
export const useUpdateCreditStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      analysisId,
      status,
      entityType = 'natural_person',
    }: {
      analysisId: string;
      status: CreditAnalysisStatus;
      entityType?: 'natural_person' | 'legal_entity';
    }) => {
      const response = await creditAnalysisService.updateStatus(
        analysisId,
        status,
        entityType
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao atualizar status');
    },
    onSuccess: (data) => {
      // Invalidar análise específica
      queryClient.invalidateQueries({
        queryKey: creditKeys.analysis(data.id),
      });
      // Invalidar histórico do usuário
      queryClient.invalidateQueries({
        queryKey: creditKeys.history(data.userId),
      });
    },
  });
};

// ============================================================================
// HOOKS COMPOSTOS
// ============================================================================

/**
 * Hook combinado para gerenciar crédito completo
 *
 * Uso:
 * ```tsx
 * const {
 *   score,
 *   history,
 *   isLoading,
 *   submitIndividual,
 *   submitBusiness,
 *   updateStatus
 * } = useCreditManagement(userId);
 * ```
 */
export const useCreditManagement = (
  userId: string,
  entityType: 'natural_person' | 'legal_entity' = 'natural_person'
) => {
  const { data: score, isLoading: scoreLoading } = useCreditScore(userId, entityType);
  const { data: history, isLoading: historyLoading } = useCreditHistory(userId);
  const submitIndividualMutation = useSubmitIndividualCredit();
  const submitBusinessMutation = useSubmitBusinessCredit();
  const updateStatusMutation = useUpdateCreditStatus();

  return {
    // Estado
    score: score || null,
    history: history || [],
    isLoading: scoreLoading || historyLoading,
    error:
      submitIndividualMutation.error?.message ||
      submitBusinessMutation.error?.message ||
      updateStatusMutation.error?.message ||
      null,

    // Ações
    submitIndividual: submitIndividualMutation.mutateAsync,
    submitBusiness: submitBusinessMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,

    // Estados das mutações
    isSubmittingIndividual: submitIndividualMutation.isPending,
    isSubmittingBusiness: submitBusinessMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,

    // Helpers
    calculateEstimatedScore: creditAnalysisService.calculateEstimatedScore,
    formatScore: creditAnalysisService.formatScore,
    getScoreColor: creditAnalysisService.getScoreColor,
    getRiskDescription: creditAnalysisService.getRiskDescription,
  };
};

/**
 * Hook para obter apenas o score (mais leve)
 *
 * Uso:
 * ```tsx
 * const { score, riskLevel, isLoading } = useUserCreditScore(userId);
 * ```
 */
export const useUserCreditScore = (userId: string) => {
  const { data: score, isLoading, error } = useCreditScore(userId);

  return {
    score: score?.score || 0,
    riskLevel: score?.riskLevel || 'medium',
    approvedAmount: score?.approvedAmount || 0,
    suggestedInterestRate: score?.suggestedInterestRate || 0,
    analysis: score?.analysis || null,
    factors: score?.factors || null,
    isLoading,
    error,
  };
};

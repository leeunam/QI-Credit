/**
 * React Query Hooks para Banking (BaaS)
 *
 * Hooks para gerenciar operações bancárias usando React Query
 * Inclui cache automático, invalidação e estados de loading
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bankingService } from '@/services/bankingService';
import type {
  CreateDigitalAccountData,
  CreatePixTransactionData,
  IssueBoletoData,
} from '@/services/bankingService';

/**
 * Query keys para banking
 */
export const bankingKeys = {
  all: ['banking'] as const,
  accounts: () => [...bankingKeys.all, 'accounts'] as const,
  account: (accountId: string) => [...bankingKeys.accounts(), accountId] as const,
  boletos: () => [...bankingKeys.all, 'boletos'] as const,
  boleto: (boletoId: string) => [...bankingKeys.boletos(), boletoId] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para obter detalhes da conta digital
 *
 * Uso:
 * ```tsx
 * const { data: account, isLoading } = useDigitalAccount(accountId);
 * ```
 */
export const useDigitalAccount = (accountId: string) => {
  return useQuery({
    queryKey: bankingKeys.account(accountId),
    queryFn: async () => {
      const response = await bankingService.getAccountDetails(accountId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao buscar conta digital');
    },
    enabled: !!accountId,
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos
    retry: 2,
  });
};

/**
 * Hook para obter detalhes do boleto
 *
 * Uso:
 * ```tsx
 * const { data: boleto, isLoading } = useBoleto(boletoId);
 * ```
 */
export const useBoleto = (boletoId: string) => {
  return useQuery({
    queryKey: bankingKeys.boleto(boletoId),
    queryFn: async () => {
      const response = await bankingService.getBoletoDetails(boletoId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao buscar boleto');
    },
    enabled: !!boletoId,
    staleTime: 1 * 60 * 1000, // Cache por 1 minuto
    retry: 2,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para criar conta digital
 *
 * Uso:
 * ```tsx
 * const createAccountMutation = useCreateDigitalAccount();
 *
 * const handleCreateAccount = async () => {
 *   try {
 *     const result = await createAccountMutation.mutateAsync({
 *       document: '12345678900',
 *       name: 'João Silva',
 *       email: 'joao@example.com',
 *       phone: '11999999999'
 *     });
 *     console.log('Conta criada:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useCreateDigitalAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDigitalAccountData) => {
      const response = await bankingService.createDigitalAccount(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao criar conta digital');
    },
    onSuccess: (data) => {
      // Adicionar ao cache de contas
      queryClient.setQueryData(bankingKeys.account(data.accountId), data);
      // Invalidar lista de contas (se existir)
      queryClient.invalidateQueries({
        queryKey: bankingKeys.accounts(),
      });
    },
  });
};

/**
 * Hook para criar transação Pix
 *
 * Uso:
 * ```tsx
 * const createPixMutation = useCreatePixTransaction();
 *
 * const handleCreatePix = async () => {
 *   try {
 *     const result = await createPixMutation.mutateAsync({
 *       amount: 10000, // R$ 100,00 em centavos
 *       recipientDocument: '98765432100',
 *       description: 'Pagamento de teste'
 *     });
 *     console.log('Pix criado:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useCreatePixTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePixTransactionData) => {
      const response = await bankingService.createPixTransaction(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao criar transação Pix');
    },
    onSuccess: (data, variables) => {
      // Invalidar conta se fornecida
      if (variables.accountId) {
        queryClient.invalidateQueries({
          queryKey: bankingKeys.account(variables.accountId),
        });
      }
    },
  });
};

/**
 * Hook para emitir boleto
 *
 * Uso:
 * ```tsx
 * const issueBoletoMutation = useIssueBoleto();
 *
 * const handleIssueBoleto = async () => {
 *   try {
 *     const result = await issueBoletoMutation.mutateAsync({
 *       amount: 50000, // R$ 500,00 em centavos
 *       dueDate: '2025-12-31',
 *       payerDocument: '12345678900',
 *       description: 'Pagamento de serviço'
 *     });
 *     console.log('Boleto emitido:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useIssueBoleto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: IssueBoletoData) => {
      const response = await bankingService.issueBoleto(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao emitir boleto');
    },
    onSuccess: (data) => {
      // Adicionar ao cache de boletos
      queryClient.setQueryData(bankingKeys.boleto(data.boletoId), data);
      // Invalidar lista de boletos (se existir)
      queryClient.invalidateQueries({
        queryKey: bankingKeys.boletos(),
      });
    },
  });
};

// ============================================================================
// HOOKS COMPOSTOS
// ============================================================================

/**
 * Hook combinado para gerenciar banking completo
 *
 * Uso:
 * ```tsx
 * const {
 *   account,
 *   isLoadingAccount,
 *   createAccount,
 *   createPix,
 *   issueBoleto,
 *   isCreatingAccount,
 *   isCreatingPix,
 *   isIssuingBoleto
 * } = useBankingManagement(accountId);
 * ```
 */
export const useBankingManagement = (accountId?: string) => {
  const { data: account, isLoading: isLoadingAccount } = useDigitalAccount(accountId || '');
  const createAccountMutation = useCreateDigitalAccount();
  const createPixMutation = useCreatePixTransaction();
  const issueBoletoMutation = useIssueBoleto();

  return {
    // Estado
    account: account || null,
    isLoadingAccount,
    error:
      createAccountMutation.error?.message ||
      createPixMutation.error?.message ||
      issueBoletoMutation.error?.message ||
      null,

    // Ações
    createAccount: createAccountMutation.mutateAsync,
    createPix: createPixMutation.mutateAsync,
    issueBoleto: issueBoletoMutation.mutateAsync,

    // Estados das mutações
    isCreatingAccount: createAccountMutation.isPending,
    isCreatingPix: createPixMutation.isPending,
    isIssuingBoleto: issueBoletoMutation.isPending,

    // Helpers
    formatCurrency: bankingService.formatCurrency,
    validateDocument: bankingService.validateDocument,
    getStatusColor: bankingService.getStatusColor,
    getStatusDescription: bankingService.getStatusDescription,
  };
};

/**
 * Hook para apenas criar conta (mais leve)
 *
 * Uso:
 * ```tsx
 * const { createAccount, isCreating, error } = useAccountCreation();
 *
 * await createAccount({
 *   document: '12345678900',
 *   name: 'João Silva',
 *   email: 'joao@example.com',
 *   phone: '11999999999'
 * });
 * ```
 */
export const useAccountCreation = () => {
  const mutation = useCreateDigitalAccount();

  return {
    createAccount: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};

/**
 * Hook para operações Pix
 *
 * Uso:
 * ```tsx
 * const { createPix, isCreating } = usePixOperations();
 *
 * await createPix({
 *   amount: 10000,
 *   recipientDocument: '98765432100'
 * });
 * ```
 */
export const usePixOperations = () => {
  const mutation = useCreatePixTransaction();

  return {
    createPix: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};

/**
 * Hook para operações com boleto
 *
 * Uso:
 * ```tsx
 * const { boleto, issueBoleto, isIssuing } = useBoletoOperations(boletoId);
 *
 * await issueBoleto({
 *   amount: 50000,
 *   dueDate: '2025-12-31',
 *   payerDocument: '12345678900'
 * });
 * ```
 */
export const useBoletoOperations = (boletoId?: string) => {
  const { data: boleto, isLoading } = useBoleto(boletoId || '');
  const mutation = useIssueBoleto();

  return {
    boleto: boleto || null,
    isLoadingBoleto: isLoading,
    issueBoleto: mutation.mutateAsync,
    isIssuing: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};

/**
 * React Query Hooks para Lending (LaaS)
 *
 * Hooks para gerenciar operações de empréstimo usando React Query
 * Inclui cache automático, invalidação e estados de loading
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lendingService } from '@/services/lendingService';
import type {
  CreateCreditContractData,
  NotifyPaymentData,
  AssignContractData,
} from '@/services/lendingService';

/**
 * Query keys para lending
 */
export const lendingKeys = {
  all: ['lending'] as const,
  contracts: () => [...lendingKeys.all, 'contracts'] as const,
  contract: (contractId: string) => [...lendingKeys.contracts(), contractId] as const,
  payments: (contractId: string) =>
    [...lendingKeys.contract(contractId), 'payments'] as const,
  schedule: (loanAmount: number, interestRate: number, term: number) =>
    [...lendingKeys.all, 'schedule', loanAmount, interestRate, term] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para obter pagamentos do contrato
 *
 * Uso:
 * ```tsx
 * const { data: payments, isLoading } = useContractPayments(contractId);
 * ```
 */
export const useContractPayments = (contractId: string) => {
  return useQuery({
    queryKey: lendingKeys.payments(contractId),
    queryFn: async () => {
      const response = await lendingService.getContractPayments(contractId);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao buscar pagamentos do contrato');
    },
    enabled: !!contractId,
    staleTime: 1 * 60 * 1000, // Cache por 1 minuto
    retry: 2,
  });
};

/**
 * Hook para calcular cronograma de empréstimo
 *
 * Uso:
 * ```tsx
 * const { data: schedule, isLoading } = useLoanSchedule(10000, 2.5, 12);
 * ```
 */
export const useLoanSchedule = (
  loanAmount: number,
  interestRate: number,
  term: number,
  enabled = true
) => {
  return useQuery({
    queryKey: lendingKeys.schedule(loanAmount, interestRate, term),
    queryFn: async () => {
      const response = await lendingService.calculateLoanSchedule(
        loanAmount,
        interestRate,
        term
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao calcular cronograma');
    },
    enabled: enabled && loanAmount > 0 && interestRate > 0 && term > 0,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para criar contrato de crédito
 *
 * Uso:
 * ```tsx
 * const createContractMutation = useCreateCreditContract();
 *
 * const handleCreateContract = async () => {
 *   try {
 *     const result = await createContractMutation.mutateAsync({
 *       borrowerDocument: '12345678900',
 *       amount: 10000,
 *       interestRate: 2.5,
 *       installments: 12
 *     });
 *     console.log('Contrato criado:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useCreateCreditContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCreditContractData) => {
      // Validar dados antes de enviar
      const validation = lendingService.validateContractData(data);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await lendingService.createCreditContract(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao criar contrato de crédito');
    },
    onSuccess: (data) => {
      // Adicionar ao cache de contratos
      queryClient.setQueryData(lendingKeys.contract(data.contractId), data);
      // Invalidar lista de contratos
      queryClient.invalidateQueries({
        queryKey: lendingKeys.contracts(),
      });
    },
  });
};

/**
 * Hook para assinar contrato
 *
 * Uso:
 * ```tsx
 * const signContractMutation = useSignContract();
 *
 * const handleSignContract = async (contractId: string) => {
 *   try {
 *     const result = await signContractMutation.mutateAsync({
 *       contractId,
 *       signerEmail: 'joao@example.com'
 *     });
 *     console.log('Assinatura iniciada:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useSignContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contractId,
      signerEmail,
    }: {
      contractId: string;
      signerEmail?: string;
    }) => {
      const response = await lendingService.signContract(contractId, signerEmail);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao iniciar assinatura do contrato');
    },
    onSuccess: (data) => {
      // Invalidar contrato (status mudou)
      queryClient.invalidateQueries({
        queryKey: lendingKeys.contract(data.contractId),
      });
    },
  });
};

/**
 * Hook para notificar pagamento
 *
 * Uso:
 * ```tsx
 * const notifyPaymentMutation = useNotifyPayment();
 *
 * const handleNotifyPayment = async () => {
 *   try {
 *     const result = await notifyPaymentMutation.mutateAsync({
 *       contractId: 'contract123',
 *       installmentNumber: 1,
 *       amount: 1000,
 *       paymentMethod: 'pix'
 *     });
 *     console.log('Pagamento notificado:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useNotifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NotifyPaymentData) => {
      const response = await lendingService.notifyPayment(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao notificar pagamento');
    },
    onSuccess: (data, variables) => {
      // Invalidar pagamentos do contrato
      queryClient.invalidateQueries({
        queryKey: lendingKeys.payments(variables.contractId),
      });
      // Invalidar contrato
      queryClient.invalidateQueries({
        queryKey: lendingKeys.contract(variables.contractId),
      });
    },
  });
};

/**
 * Hook para atribuir contrato a fundos
 *
 * Uso:
 * ```tsx
 * const assignContractMutation = useAssignContract();
 *
 * const handleAssignContract = async () => {
 *   try {
 *     const result = await assignContractMutation.mutateAsync({
 *       contractId: 'contract123',
 *       fundId: 'fund456',
 *       assignmentPercentage: 100
 *     });
 *     console.log('Contrato atribuído:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useAssignContract = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AssignContractData) => {
      const response = await lendingService.assignContractToFunds(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao atribuir contrato');
    },
    onSuccess: (data, variables) => {
      // Invalidar contrato
      queryClient.invalidateQueries({
        queryKey: lendingKeys.contract(variables.contractId),
      });
    },
  });
};

// ============================================================================
// HOOKS COMPOSTOS
// ============================================================================

/**
 * Hook combinado para gerenciar lending completo
 *
 * Uso:
 * ```tsx
 * const {
 *   payments,
 *   isLoadingPayments,
 *   createContract,
 *   signContract,
 *   notifyPayment,
 *   assignContract,
 *   isCreatingContract,
 *   isSigningContract,
 *   isNotifyingPayment,
 *   isAssigningContract
 * } = useLendingManagement(contractId);
 * ```
 */
export const useLendingManagement = (contractId?: string) => {
  const { data: payments, isLoading: isLoadingPayments } = useContractPayments(
    contractId || ''
  );
  const createContractMutation = useCreateCreditContract();
  const signContractMutation = useSignContract();
  const notifyPaymentMutation = useNotifyPayment();
  const assignContractMutation = useAssignContract();

  return {
    // Estado
    payments: payments || null,
    isLoadingPayments,
    error:
      createContractMutation.error?.message ||
      signContractMutation.error?.message ||
      notifyPaymentMutation.error?.message ||
      assignContractMutation.error?.message ||
      null,

    // Ações
    createContract: createContractMutation.mutateAsync,
    signContract: signContractMutation.mutateAsync,
    notifyPayment: notifyPaymentMutation.mutateAsync,
    assignContract: assignContractMutation.mutateAsync,

    // Estados das mutações
    isCreatingContract: createContractMutation.isPending,
    isSigningContract: signContractMutation.isPending,
    isNotifyingPayment: notifyPaymentMutation.isPending,
    isAssigningContract: assignContractMutation.isPending,

    // Helpers
    formatCurrency: lendingService.formatCurrency,
    calculateTotalInterest: lendingService.calculateTotalInterest,
    getNextDuePayment: lendingService.getNextDuePayment,
    getStatusColor: lendingService.getStatusColor,
    getStatusDescription: lendingService.getStatusDescription,
  };
};

/**
 * Hook para gerenciar criação de contrato com preview do cronograma
 *
 * Uso:
 * ```tsx
 * const {
 *   schedule,
 *   isLoadingSchedule,
 *   createContract,
 *   isCreating
 * } = useContractCreation(10000, 2.5, 12);
 *
 * // Preview do cronograma
 * console.log('Total a pagar:', schedule?.totalAmount);
 *
 * // Criar contrato
 * await createContract({
 *   borrowerDocument: '12345678900',
 *   amount: 10000,
 *   interestRate: 2.5,
 *   installments: 12
 * });
 * ```
 */
export const useContractCreation = (
  loanAmount: number,
  interestRate: number,
  term: number
) => {
  const { data: schedule, isLoading: isLoadingSchedule } = useLoanSchedule(
    loanAmount,
    interestRate,
    term
  );
  const mutation = useCreateCreditContract();

  return {
    // Preview do cronograma
    schedule: schedule || null,
    isLoadingSchedule,

    // Criação de contrato
    createContract: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};

/**
 * Hook para gerenciar pagamentos de um contrato
 *
 * Uso:
 * ```tsx
 * const {
 *   payments,
 *   nextDuePayment,
 *   totalPaid,
 *   totalRemaining,
 *   notifyPayment,
 *   isNotifying
 * } = useContractPaymentManagement(contractId);
 * ```
 */
export const useContractPaymentManagement = (contractId: string) => {
  const { data: payments, isLoading } = useContractPayments(contractId);
  const mutation = useNotifyPayment();

  const nextDuePayment = payments
    ? lendingService.getNextDuePayment(payments.payments)
    : null;

  return {
    payments: payments || null,
    isLoadingPayments: isLoading,
    nextDuePayment,
    totalPaid: payments?.paidAmount || 0,
    totalRemaining: payments?.remainingAmount || 0,
    paidInstallments: payments?.paidInstallments || 0,
    remainingInstallments: payments?.remainingInstallments || 0,

    notifyPayment: mutation.mutateAsync,
    isNotifying: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};

/**
 * Hook simplificado para calcular cronograma
 *
 * Uso:
 * ```tsx
 * const { schedule, recalculate } = useScheduleCalculator();
 *
 * const result = await recalculate(10000, 2.5, 12);
 * console.log('Cronograma:', result);
 * ```
 */
export const useScheduleCalculator = () => {
  const queryClient = useQueryClient();

  const recalculate = async (loanAmount: number, interestRate: number, term: number) => {
    const response = await lendingService.calculateLoanSchedule(
      loanAmount,
      interestRate,
      term
    );

    if (response.success && response.data) {
      // Atualizar cache
      queryClient.setQueryData(
        lendingKeys.schedule(loanAmount, interestRate, term),
        response.data
      );
      return response.data;
    }

    throw new Error(response.error || 'Erro ao calcular cronograma');
  };

  return {
    recalculate,
  };
};

/**
 * React Query Hooks para Blockchain
 *
 * Hooks para gerenciar operações blockchain usando React Query
 * Inclui cache automático, invalidação e estados de loading
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blockchainService } from '@/services/blockchainService';
import type {
  CreateEscrowData,
  MintTokensData,
  TransferTokensData,
} from '@/services/blockchainService';

/**
 * Query keys para blockchain
 */
export const blockchainKeys = {
  all: ['blockchain'] as const,
  wallet: () => [...blockchainKeys.all, 'wallet'] as const,
  walletBalance: () => [...blockchainKeys.wallet(), 'balance'] as const,
  escrows: () => [...blockchainKeys.all, 'escrows'] as const,
  escrow: (address: string) => [...blockchainKeys.escrows(), address] as const,
  tokens: () => [...blockchainKeys.all, 'tokens'] as const,
  tokenBalance: (address: string) => [...blockchainKeys.tokens(), 'balance', address] as const,
  transactions: () => [...blockchainKeys.all, 'transactions'] as const,
  transaction: (txHash: string) => [...blockchainKeys.transactions(), txHash] as const,
};

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Hook para obter saldo da carteira
 *
 * Uso:
 * ```tsx
 * const { data: wallet, isLoading } = useWalletBalance();
 * ```
 */
export const useWalletBalance = () => {
  return useQuery({
    queryKey: blockchainKeys.walletBalance(),
    queryFn: async () => {
      const response = await blockchainService.getWalletBalance();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao buscar saldo da carteira');
    },
    staleTime: 30 * 1000, // Cache por 30 segundos
    retry: 2,
  });
};

/**
 * Hook para obter status do escrow
 *
 * Uso:
 * ```tsx
 * const { data: escrow, isLoading } = useEscrowStatus(escrowAddress);
 * ```
 */
export const useEscrowStatus = (escrowAddress: string) => {
  return useQuery({
    queryKey: blockchainKeys.escrow(escrowAddress),
    queryFn: async () => {
      const response = await blockchainService.getEscrowStatus(escrowAddress);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao buscar status do escrow');
    },
    enabled: !!escrowAddress && blockchainService.validateAddress(escrowAddress),
    staleTime: 1 * 60 * 1000, // Cache por 1 minuto
    retry: 2,
  });
};

/**
 * Hook para obter saldo de tokens
 *
 * Uso:
 * ```tsx
 * const { data: tokenBalance, isLoading } = useTokenBalance(address);
 * ```
 */
export const useTokenBalance = (address: string) => {
  return useQuery({
    queryKey: blockchainKeys.tokenBalance(address),
    queryFn: async () => {
      const response = await blockchainService.getTokenBalance(address);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao buscar saldo de tokens');
    },
    enabled: !!address && blockchainService.validateAddress(address),
    staleTime: 30 * 1000, // Cache por 30 segundos
    retry: 2,
  });
};

/**
 * Hook para obter detalhes da transação
 *
 * Uso:
 * ```tsx
 * const { data: transaction, isLoading } = useTransactionDetails(txHash);
 * ```
 */
export const useTransactionDetails = (txHash: string) => {
  return useQuery({
    queryKey: blockchainKeys.transaction(txHash),
    queryFn: async () => {
      const response = await blockchainService.getTransactionDetails(txHash);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao buscar detalhes da transação');
    },
    enabled: !!txHash && blockchainService.validateTxHash(txHash),
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos
    retry: 2,
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Hook para depositar em escrow
 *
 * Uso:
 * ```tsx
 * const depositMutation = useDepositToEscrow();
 *
 * const handleDeposit = async () => {
 *   try {
 *     const result = await depositMutation.mutateAsync({
 *       escrowId: 'escrow123',
 *       borrowerAddress: '0x123...',
 *       lenderAddress: '0x456...',
 *       arbitratorAddress: '0x789...',
 *       amount: 10000
 *     });
 *     console.log('Escrow criado:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useDepositToEscrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEscrowData) => {
      const response = await blockchainService.depositToEscrow(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao depositar em escrow');
    },
    onSuccess: (data) => {
      // Adicionar ao cache se temos o endereço do contrato
      if (data.escrowContractAddress) {
        queryClient.setQueryData(
          blockchainKeys.escrow(data.escrowContractAddress),
          data.escrowDetails
        );
      }
      // Invalidar lista de escrows
      queryClient.invalidateQueries({
        queryKey: blockchainKeys.escrows(),
      });
      // Invalidar saldo da carteira
      queryClient.invalidateQueries({
        queryKey: blockchainKeys.walletBalance(),
      });
    },
  });
};

/**
 * Hook para liberar fundos do escrow
 *
 * Uso:
 * ```tsx
 * const releaseMutation = useReleaseFundsFromEscrow();
 *
 * const handleRelease = async (escrowAddress: string) => {
 *   try {
 *     const result = await releaseMutation.mutateAsync(escrowAddress);
 *     console.log('Fundos liberados:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useReleaseFundsFromEscrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (escrowAddress: string) => {
      const response = await blockchainService.releaseFundsFromEscrow(escrowAddress);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao liberar fundos');
    },
    onSuccess: (data, escrowAddress) => {
      // Invalidar escrow específico
      queryClient.invalidateQueries({
        queryKey: blockchainKeys.escrow(escrowAddress),
      });
      // Invalidar saldo da carteira
      queryClient.invalidateQueries({
        queryKey: blockchainKeys.walletBalance(),
      });
    },
  });
};

/**
 * Hook para devolver fundos do escrow
 *
 * Uso:
 * ```tsx
 * const refundMutation = useRefundFundsFromEscrow();
 *
 * const handleRefund = async (escrowAddress: string) => {
 *   try {
 *     const result = await refundMutation.mutateAsync(escrowAddress);
 *     console.log('Fundos devolvidos:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useRefundFundsFromEscrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (escrowAddress: string) => {
      const response = await blockchainService.refundFundsFromEscrow(escrowAddress);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao devolver fundos');
    },
    onSuccess: (data, escrowAddress) => {
      // Invalidar escrow específico
      queryClient.invalidateQueries({
        queryKey: blockchainKeys.escrow(escrowAddress),
      });
      // Invalidar saldo da carteira
      queryClient.invalidateQueries({
        queryKey: blockchainKeys.walletBalance(),
      });
    },
  });
};

/**
 * Hook para cunhar tokens
 *
 * Uso:
 * ```tsx
 * const mintMutation = useMintTokens();
 *
 * const handleMint = async () => {
 *   try {
 *     const result = await mintMutation.mutateAsync({
 *       toAddress: '0x123...',
 *       amount: 1000
 *     });
 *     console.log('Tokens cunhados:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useMintTokens = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MintTokensData) => {
      const response = await blockchainService.mintTokens(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao cunhar tokens');
    },
    onSuccess: (data, variables) => {
      // Invalidar saldo de tokens do destinatário
      queryClient.invalidateQueries({
        queryKey: blockchainKeys.tokenBalance(variables.toAddress),
      });
    },
  });
};

/**
 * Hook para transferir tokens
 *
 * Uso:
 * ```tsx
 * const transferMutation = useTransferTokens();
 *
 * const handleTransfer = async () => {
 *   try {
 *     const result = await transferMutation.mutateAsync({
 *       toAddress: '0x123...',
 *       amount: 100
 *     });
 *     console.log('Tokens transferidos:', result);
 *   } catch (error) {
 *     console.error('Erro:', error);
 *   }
 * };
 * ```
 */
export const useTransferTokens = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransferTokensData) => {
      const response = await blockchainService.transferTokens(data);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || 'Erro ao transferir tokens');
    },
    onSuccess: (data, variables) => {
      // Invalidar saldo de tokens do remetente (se conhecido)
      if (data.from) {
        queryClient.invalidateQueries({
          queryKey: blockchainKeys.tokenBalance(data.from),
        });
      }
      // Invalidar saldo de tokens do destinatário
      queryClient.invalidateQueries({
        queryKey: blockchainKeys.tokenBalance(variables.toAddress),
      });
    },
  });
};

// ============================================================================
// HOOKS COMPOSTOS
// ============================================================================

/**
 * Hook combinado para gerenciar escrow completo
 *
 * Uso:
 * ```tsx
 * const {
 *   escrow,
 *   isLoading,
 *   depositToEscrow,
 *   releaseFunds,
 *   refundFunds,
 *   isDepositing,
 *   isReleasing,
 *   isRefunding
 * } = useEscrowManagement(escrowAddress);
 * ```
 */
export const useEscrowManagement = (escrowAddress?: string) => {
  const { data: escrow, isLoading } = useEscrowStatus(escrowAddress || '');
  const depositMutation = useDepositToEscrow();
  const releaseMutation = useReleaseFundsFromEscrow();
  const refundMutation = useRefundFundsFromEscrow();

  return {
    // Estado
    escrow: escrow || null,
    isLoading,
    error:
      depositMutation.error?.message ||
      releaseMutation.error?.message ||
      refundMutation.error?.message ||
      null,

    // Ações
    depositToEscrow: depositMutation.mutateAsync,
    releaseFunds: releaseMutation.mutateAsync,
    refundFunds: refundMutation.mutateAsync,

    // Estados das mutações
    isDepositing: depositMutation.isPending,
    isReleasing: releaseMutation.isPending,
    isRefunding: refundMutation.isPending,

    // Helpers
    getStateName: blockchainService.getEscrowStateName,
    getStateColor: blockchainService.getEscrowStateColor,
    shortenAddress: blockchainService.shortenAddress,
    formatWeiToEth: blockchainService.formatWeiToEth,
  };
};

/**
 * Hook para gerenciar tokens
 *
 * Uso:
 * ```tsx
 * const {
 *   tokenBalance,
 *   isLoadingBalance,
 *   mintTokens,
 *   transferTokens,
 *   isMinting,
 *   isTransferring
 * } = useTokenManagement(address);
 * ```
 */
export const useTokenManagement = (address?: string) => {
  const { data: tokenBalance, isLoading: isLoadingBalance } = useTokenBalance(address || '');
  const mintMutation = useMintTokens();
  const transferMutation = useTransferTokens();

  return {
    // Estado
    tokenBalance: tokenBalance || null,
    isLoadingBalance,
    error: mintMutation.error?.message || transferMutation.error?.message || null,

    // Ações
    mintTokens: mintMutation.mutateAsync,
    transferTokens: transferMutation.mutateAsync,

    // Estados das mutações
    isMinting: mintMutation.isPending,
    isTransferring: transferMutation.isPending,

    // Helpers
    validateAddress: blockchainService.validateAddress,
    shortenAddress: blockchainService.shortenAddress,
  };
};

/**
 * Hook para gerenciar carteira
 *
 * Uso:
 * ```tsx
 * const {
 *   wallet,
 *   isLoading,
 *   refreshBalance
 * } = useWalletManagement();
 * ```
 */
export const useWalletManagement = () => {
  const { data: wallet, isLoading, refetch } = useWalletBalance();

  return {
    wallet: wallet || null,
    isLoading,
    refreshBalance: refetch,
    formatWeiToEth: blockchainService.formatWeiToEth,
    shortenAddress: blockchainService.shortenAddress,
  };
};

/**
 * Hook para monitorar transação
 *
 * Uso:
 * ```tsx
 * const {
 *   transaction,
 *   isLoading,
 *   isPending,
 *   isSuccess,
 *   isFailed
 * } = useTransactionMonitor(txHash);
 * ```
 */
export const useTransactionMonitor = (txHash: string) => {
  const { data: transaction, isLoading } = useTransactionDetails(txHash);

  const isPending = transaction?.status === 'PENDING';
  const isSuccess = transaction?.status === 'SUCCESS';
  const isFailed = transaction?.status === 'FAILED';

  return {
    transaction: transaction || null,
    isLoading,
    isPending,
    isSuccess,
    isFailed,
    getStatusName: blockchainService.getTransactionStatusName,
    getStatusColor: blockchainService.getTransactionStatusColor,
    shortenTxHash: blockchainService.shortenTxHash,
    formatGasPrice: blockchainService.formatGasPrice,
    calculateTransactionCost: blockchainService.calculateTransactionCost,
    getExplorerUrl: blockchainService.getExplorerUrl,
  };
};

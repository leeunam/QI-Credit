/**
 * Serviço de Blockchain
 *
 * Integração com backend /api/blockchain (mockado)
 * Operações de escrow, tokens ERC-20 e transações blockchain
 *
 * Rotas backend:
 * - GET /api/blockchain/wallet/balance - Saldo da carteira
 * - POST /api/blockchain/escrow/deposit - Depositar em escrow
 * - POST /api/blockchain/escrow/:address/release - Liberar fundos
 * - POST /api/blockchain/escrow/:address/refund - Devolver fundos
 * - GET /api/blockchain/escrow/:address - Status do escrow
 * - POST /api/blockchain/tokens/mint - Cunhar tokens
 * - POST /api/blockchain/tokens/transfer - Transferir tokens
 * - GET /api/blockchain/tokens/balance/:address - Saldo de tokens
 * - GET /api/blockchain/transactions/:txHash - Detalhes da transação
 *
 * NOTA: Estas APIs estão mockadas no backend quando BLOCKCHAIN_MOCK_MODE=true
 */

import { apiClient } from './apiClients';
import type { ApiResponse } from '@/types';

// ============================================================================
// INTERFACES ESPECÍFICAS
// ============================================================================

/**
 * Saldo da carteira
 */
export interface WalletBalance {
  address: string;
  balance: string; // Em ETH/xDAI
  balanceWei: string; // Em Wei
}

/**
 * Dados para criar escrow
 */
export interface CreateEscrowData {
  escrowId: string;
  borrowerAddress: string;
  lenderAddress: string;
  arbitratorAddress: string;
  amount: number;
}

/**
 * Detalhes do escrow
 */
export interface EscrowDetails {
  id?: string;
  borrower: string;
  lender: string;
  arbitrator: string;
  amount: string | number;
  status?: string;
  isReleased?: boolean;
  isRefunded?: boolean;
  currentState?: number;
  currentStateName?: string;
  createdAt?: string;
  updatedAt?: string;
  contractData?: {
    borrower: string;
    lender: string;
    arbitrator: string;
    amount: number;
    timeout: number;
  };
}

/**
 * Resultado de operação de escrow
 */
export interface EscrowOperationResult {
  success: boolean;
  escrowContractAddress?: string;
  transactionHash: string;
  status: string;
  escrowDetails?: EscrowDetails;
  updatedAt?: string;
}

/**
 * Dados para cunhar tokens
 */
export interface MintTokensData {
  toAddress: string;
  amount: number;
}

/**
 * Dados para transferir tokens
 */
export interface TransferTokensData {
  toAddress: string;
  amount: number;
}

/**
 * Resultado de operação com tokens
 */
export interface TokenOperationResult {
  success: boolean;
  transactionHash: string;
  from?: string;
  to: string;
  amount: number;
  message?: string;
  updatedAt?: string;
}

/**
 * Saldo de tokens
 */
export interface TokenBalance {
  success: boolean;
  address: string;
  balance: number;
  balanceWei: string;
}

/**
 * Detalhes da transação
 */
export interface TransactionDetails {
  success: boolean;
  transaction: {
    hash: string;
    from: string;
    to: string;
    value: string;
    gasLimit: string | bigint;
    gasPrice: string | bigint;
    nonce: number;
    data: string;
    chainId: number;
  };
  receipt: {
    transactionHash: string;
    blockHash: string;
    blockNumber: number;
    gasUsed: string | bigint;
    status: number;
  };
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
}

// ============================================================================
// SERVIÇO DE BLOCKCHAIN
// ============================================================================

export const blockchainService = {
  /**
   * Obter saldo da carteira
   * GET /api/blockchain/wallet/balance
   *
   * @returns Saldo da carteira
   */
  async getWalletBalance(): Promise<ApiResponse<WalletBalance>> {
    try {
      const response = await apiClient.get('/blockchain/wallet/balance');

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Get wallet balance error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar saldo da carteira',
        code: error.response?.data?.code || 'GET_WALLET_BALANCE_ERROR',
      };
    }
  },

  /**
   * Depositar fundos em escrow
   * POST /api/blockchain/escrow/deposit
   *
   * @param data - Dados do escrow
   * @returns Resultado da operação
   */
  async depositToEscrow(data: CreateEscrowData): Promise<ApiResponse<EscrowOperationResult>> {
    try {
      const response = await apiClient.post('/blockchain/escrow/deposit', {
        escrowId: data.escrowId,
        borrowerAddress: data.borrowerAddress,
        lenderAddress: data.lenderAddress,
        arbitratorAddress: data.arbitratorAddress,
        amount: data.amount,
      });

      return {
        success: true,
        data: response.data,
        message: 'Fundos depositados em escrow com sucesso',
      };
    } catch (error: any) {
      console.error('Deposit to escrow error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao depositar em escrow',
        code: error.response?.data?.code || 'DEPOSIT_ESCROW_ERROR',
      };
    }
  },

  /**
   * Liberar fundos do escrow
   * POST /api/blockchain/escrow/:address/release
   *
   * @param escrowAddress - Endereço do contrato de escrow
   * @returns Resultado da operação
   */
  async releaseFundsFromEscrow(
    escrowAddress: string
  ): Promise<ApiResponse<EscrowOperationResult>> {
    try {
      const response = await apiClient.post(`/blockchain/escrow/${escrowAddress}/release`);

      return {
        success: true,
        data: response.data,
        message: 'Fundos liberados com sucesso',
      };
    } catch (error: any) {
      console.error('Release funds error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao liberar fundos',
        code: error.response?.data?.code || 'RELEASE_FUNDS_ERROR',
      };
    }
  },

  /**
   * Devolver fundos do escrow
   * POST /api/blockchain/escrow/:address/refund
   *
   * @param escrowAddress - Endereço do contrato de escrow
   * @returns Resultado da operação
   */
  async refundFundsFromEscrow(
    escrowAddress: string
  ): Promise<ApiResponse<EscrowOperationResult>> {
    try {
      const response = await apiClient.post(`/blockchain/escrow/${escrowAddress}/refund`);

      return {
        success: true,
        data: response.data,
        message: 'Fundos devolvidos com sucesso',
      };
    } catch (error: any) {
      console.error('Refund funds error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao devolver fundos',
        code: error.response?.data?.code || 'REFUND_FUNDS_ERROR',
      };
    }
  },

  /**
   * Obter status do escrow
   * GET /api/blockchain/escrow/:address
   *
   * @param escrowAddress - Endereço do contrato de escrow
   * @returns Status do escrow
   */
  async getEscrowStatus(escrowAddress: string): Promise<ApiResponse<EscrowDetails>> {
    try {
      const response = await apiClient.get(`/blockchain/escrow/${escrowAddress}`);

      return {
        success: true,
        data: response.data.escrowDetails || response.data,
      };
    } catch (error: any) {
      console.error('Get escrow status error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar status do escrow',
        code: error.response?.data?.code || 'GET_ESCROW_STATUS_ERROR',
      };
    }
  },

  /**
   * Cunhar tokens
   * POST /api/blockchain/tokens/mint
   *
   * @param data - Dados para cunhar tokens
   * @returns Resultado da operação
   */
  async mintTokens(data: MintTokensData): Promise<ApiResponse<TokenOperationResult>> {
    try {
      const response = await apiClient.post('/blockchain/tokens/mint', {
        toAddress: data.toAddress,
        amount: data.amount,
      });

      return {
        success: true,
        data: response.data,
        message: 'Tokens cunhados com sucesso',
      };
    } catch (error: any) {
      console.error('Mint tokens error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao cunhar tokens',
        code: error.response?.data?.code || 'MINT_TOKENS_ERROR',
      };
    }
  },

  /**
   * Transferir tokens
   * POST /api/blockchain/tokens/transfer
   *
   * @param data - Dados para transferir tokens
   * @returns Resultado da operação
   */
  async transferTokens(data: TransferTokensData): Promise<ApiResponse<TokenOperationResult>> {
    try {
      const response = await apiClient.post('/blockchain/tokens/transfer', {
        toAddress: data.toAddress,
        amount: data.amount,
      });

      return {
        success: true,
        data: response.data,
        message: 'Tokens transferidos com sucesso',
      };
    } catch (error: any) {
      console.error('Transfer tokens error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao transferir tokens',
        code: error.response?.data?.code || 'TRANSFER_TOKENS_ERROR',
      };
    }
  },

  /**
   * Obter saldo de tokens
   * GET /api/blockchain/tokens/balance/:address
   *
   * @param address - Endereço da carteira
   * @returns Saldo de tokens
   */
  async getTokenBalance(address: string): Promise<ApiResponse<TokenBalance>> {
    try {
      const response = await apiClient.get(`/blockchain/tokens/balance/${address}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Get token balance error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar saldo de tokens',
        code: error.response?.data?.code || 'GET_TOKEN_BALANCE_ERROR',
      };
    }
  },

  /**
   * Obter detalhes da transação
   * GET /api/blockchain/transactions/:txHash
   *
   * @param txHash - Hash da transação
   * @returns Detalhes da transação
   */
  async getTransactionDetails(txHash: string): Promise<ApiResponse<TransactionDetails>> {
    try {
      const response = await apiClient.get(`/blockchain/transactions/${txHash}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Get transaction details error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar detalhes da transação',
        code: error.response?.data?.code || 'GET_TRANSACTION_ERROR',
      };
    }
  },

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  /**
   * Formatar valor em Wei para ETH
   */
  formatWeiToEth(wei: string | number): string {
    const weiNum = typeof wei === 'string' ? BigInt(wei) : BigInt(wei);
    const eth = Number(weiNum) / 1e18;
    return eth.toFixed(6);
  },

  /**
   * Formatar valor em ETH para Wei
   */
  formatEthToWei(eth: number): string {
    const wei = BigInt(Math.floor(eth * 1e18));
    return wei.toString();
  },

  /**
   * Validar endereço Ethereum
   */
  validateAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  /**
   * Validar hash de transação
   */
  validateTxHash(txHash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(txHash);
  },

  /**
   * Gerar endereço mock (para testes)
   */
  generateMockAddress(): string {
    return `0x${Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;
  },

  /**
   * Obter nome do estado do escrow
   */
  getEscrowStateName(state: number | string): string {
    const states: Record<string, string> = {
      '0': 'Aguardando Fundos',
      '1': 'Aguardando Liberação',
      '2': 'Aguardando Arbitragem',
      '3': 'Concluído',
      AWAITING_FUNDS: 'Aguardando Fundos',
      AWAITING_RELEASE: 'Aguardando Liberação',
      AWAITING_ARBITRATION: 'Aguardando Arbitragem',
      COMPLETED: 'Concluído',
      PENDING: 'Pendente',
      RELEASED: 'Liberado',
      REFUNDED: 'Devolvido',
    };
    return states[state.toString()] || 'Desconhecido';
  },

  /**
   * Obter cor do estado do escrow
   */
  getEscrowStateColor(state: number | string): string {
    const colors: Record<string, string> = {
      '0': 'text-yellow-600',
      '1': 'text-blue-600',
      '2': 'text-orange-600',
      '3': 'text-green-600',
      AWAITING_FUNDS: 'text-yellow-600',
      AWAITING_RELEASE: 'text-blue-600',
      AWAITING_ARBITRATION: 'text-orange-600',
      COMPLETED: 'text-green-600',
      PENDING: 'text-yellow-600',
      RELEASED: 'text-green-600',
      REFUNDED: 'text-gray-600',
    };
    return colors[state.toString()] || 'text-gray-600';
  },

  /**
   * Obter status da transação
   */
  getTransactionStatusName(status: string | number): string {
    const statuses: Record<string, string> = {
      SUCCESS: 'Sucesso',
      FAILED: 'Falhou',
      PENDING: 'Pendente',
      '0': 'Falhou',
      '1': 'Sucesso',
    };
    return statuses[status.toString()] || 'Desconhecido';
  },

  /**
   * Obter cor do status da transação
   */
  getTransactionStatusColor(status: string | number): string {
    const colors: Record<string, string> = {
      SUCCESS: 'text-green-600',
      FAILED: 'text-red-600',
      PENDING: 'text-yellow-600',
      '0': 'text-red-600',
      '1': 'text-green-600',
    };
    return colors[status.toString()] || 'text-gray-600';
  },

  /**
   * Encurtar endereço para exibição
   */
  shortenAddress(address: string, startChars = 6, endChars = 4): string {
    if (address.length < startChars + endChars + 3) {
      return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  },

  /**
   * Encurtar hash de transação para exibição
   */
  shortenTxHash(txHash: string, startChars = 10, endChars = 8): string {
    if (txHash.length < startChars + endChars + 3) {
      return txHash;
    }
    return `${txHash.slice(0, startChars)}...${txHash.slice(-endChars)}`;
  },

  /**
   * Formatar valor de gas
   */
  formatGasPrice(gasPrice: string | bigint, unit: 'gwei' | 'eth' = 'gwei'): string {
    const gasPriceBig = typeof gasPrice === 'string' ? BigInt(gasPrice) : gasPrice;

    if (unit === 'gwei') {
      const gwei = Number(gasPriceBig) / 1e9;
      return `${gwei.toFixed(2)} Gwei`;
    } else {
      const eth = Number(gasPriceBig) / 1e18;
      return `${eth.toFixed(8)} ETH`;
    }
  },

  /**
   * Calcular custo total de transação
   */
  calculateTransactionCost(gasUsed: string | bigint, gasPrice: string | bigint): string {
    const gasUsedBig = typeof gasUsed === 'string' ? BigInt(gasUsed) : gasUsed;
    const gasPriceBig = typeof gasPrice === 'string' ? BigInt(gasPrice) : gasPrice;

    const totalCostWei = gasUsedBig * gasPriceBig;
    const totalCostEth = Number(totalCostWei) / 1e18;

    return totalCostEth.toFixed(8);
  },

  /**
   * Obter URL do explorador de blockchain
   */
  getExplorerUrl(type: 'tx' | 'address' | 'block', value: string, network = 'gnosis'): string {
    const explorers: Record<string, string> = {
      gnosis: 'https://gnosisscan.io',
      arbitrum: 'https://arbiscan.io',
      ethereum: 'https://etherscan.io',
    };

    const baseUrl = explorers[network] || explorers.gnosis;

    const paths: Record<string, string> = {
      tx: 'tx',
      address: 'address',
      block: 'block',
    };

    return `${baseUrl}/${paths[type]}/${value}`;
  },
};

export default blockchainService;

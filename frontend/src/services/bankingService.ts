/**
 * Serviço de Banking (BaaS - Banking as a Service)
 *
 * Integração com backend /api/qitech/banking (mockada)
 * APIs da QI Tech para Banking as a Service
 *
 * Rotas backend:
 * - POST /api/qitech/banking/accounts - Criar conta digital
 * - GET /api/qitech/banking/accounts/:accountId - Detalhes da conta
 * - POST /api/qitech/banking/pix - Transação Pix
 * - POST /api/qitech/banking/boletos - Emitir boleto
 * - GET /api/qitech/banking/boletos/:boletoId - Detalhes do boleto
 *
 * NOTA: Estas APIs estão mockadas no backend quando QITECH_MOCK_MODE=true
 */

import { apiClient } from './apiClients';
import type { ApiResponse } from '@/types';

// ============================================================================
// INTERFACES ESPECÍFICAS
// ============================================================================

/**
 * Dados para criar conta digital
 */
export interface CreateDigitalAccountData {
  userId?: string;
  document: string; // CPF ou CNPJ
  name: string;
  email: string;
  phone: string | {
    area_code: string;
    number: string;
  };
}

/**
 * Detalhes da conta digital
 */
export interface DigitalAccount {
  id: string;
  accountId: string;
  agencyNumber: string;
  accountNumber: string;
  accountDigit: string;
  bankCode: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  status: 'active' | 'inactive' | 'blocked';
  balance: {
    available: number;
    locked: number;
    reserved: number;
    currency: string;
  };
  pixKeys: Array<{
    keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
    keyValue: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dados para transação Pix
 */
export interface CreatePixTransactionData {
  accountId?: string;
  amount: number;
  currency?: string; // Default: BRL
  recipientDocument: string;
  recipientPixKey?: string;
  description?: string;
  additionalInformation?: string;
}

/**
 * Transação Pix
 */
export interface PixTransaction {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  recipientDocument: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  paymentMethod: 'pix';
  qrCode?: string;
  emv?: string;
  expirationDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dados para emitir boleto
 */
export interface IssueBoletoData {
  accountId?: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  payerDocument: string;
  description?: string;
  instructions?: string;
  additionalInformation?: string;
}

/**
 * Boleto emitido
 */
export interface Boleto {
  id: string;
  boletoId: string;
  amount: number;
  dueDate: string;
  payerDocument: string;
  description: string;
  status: 'issued' | 'paid' | 'pending' | 'overdue' | 'canceled';
  barcode: string;
  url: string;
  instructions: string;
  fine: number; // Percentual de multa
  interest: number; // Percentual de juros ao mês
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SERVIÇO DE BANKING
// ============================================================================

export const bankingService = {
  /**
   * Criar conta digital
   * POST /api/qitech/banking/accounts
   *
   * @param data - Dados para criar conta
   * @returns Conta digital criada
   */
  async createDigitalAccount(
    data: CreateDigitalAccountData
  ): Promise<ApiResponse<DigitalAccount>> {
    try {
      const response = await apiClient.post('/qitech/banking/accounts', data);

      return {
        success: true,
        data: this.mapAccountResponse(response.data),
        message: 'Conta digital criada com sucesso',
      };
    } catch (error: any) {
      console.error('Create digital account error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar conta digital',
        code: error.response?.data?.code || 'CREATE_ACCOUNT_ERROR',
      };
    }
  },

  /**
   * Obter detalhes da conta digital
   * GET /api/qitech/banking/accounts/:accountId
   *
   * @param accountId - ID da conta
   * @returns Detalhes da conta
   */
  async getAccountDetails(accountId: string): Promise<ApiResponse<DigitalAccount>> {
    try {
      const response = await apiClient.get(`/qitech/banking/accounts/${accountId}`);

      return {
        success: true,
        data: this.mapAccountResponse(response.data.account || response.data),
      };
    } catch (error: any) {
      console.error('Get account details error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar detalhes da conta',
        code: error.response?.data?.code || 'GET_ACCOUNT_ERROR',
      };
    }
  },

  /**
   * Criar transação Pix
   * POST /api/qitech/banking/pix
   *
   * @param data - Dados da transação Pix
   * @returns Transação Pix criada
   */
  async createPixTransaction(
    data: CreatePixTransactionData
  ): Promise<ApiResponse<PixTransaction>> {
    try {
      const payload = {
        amount: data.amount,
        currency: data.currency || 'BRL',
        recipient_document: data.recipientDocument,
        recipient_pix_key: data.recipientPixKey,
        description: data.description || 'Transação Pix',
        additional_information: data.additionalInformation,
      };

      const response = await apiClient.post('/qitech/banking/pix', payload);

      return {
        success: true,
        data: this.mapPixResponse(response.data.transaction || response.data),
        message: 'Transação Pix criada com sucesso',
      };
    } catch (error: any) {
      console.error('Create Pix transaction error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar transação Pix',
        code: error.response?.data?.code || 'CREATE_PIX_ERROR',
      };
    }
  },

  /**
   * Emitir boleto
   * POST /api/qitech/banking/boletos
   *
   * @param data - Dados do boleto
   * @returns Boleto emitido
   */
  async issueBoleto(data: IssueBoletoData): Promise<ApiResponse<Boleto>> {
    try {
      const payload = {
        amount: data.amount,
        due_date: data.dueDate,
        payer_document: data.payerDocument,
        description: data.description || 'Pagamento via QI Credit',
        additional_information: data.additionalInformation || data.instructions,
      };

      const response = await apiClient.post('/qitech/banking/boletos', payload);

      return {
        success: true,
        data: this.mapBoletoResponse(response.data.boleto || response.data),
        message: 'Boleto emitido com sucesso',
      };
    } catch (error: any) {
      console.error('Issue boleto error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao emitir boleto',
        code: error.response?.data?.code || 'ISSUE_BOLETO_ERROR',
      };
    }
  },

  /**
   * Obter detalhes do boleto
   * GET /api/qitech/banking/boletos/:boletoId
   *
   * @param boletoId - ID do boleto
   * @returns Detalhes do boleto
   */
  async getBoletoDetails(boletoId: string): Promise<ApiResponse<Boleto>> {
    try {
      const response = await apiClient.get(`/qitech/banking/boletos/${boletoId}`);

      return {
        success: true,
        data: this.mapBoletoResponse(response.data.boleto || response.data),
      };
    } catch (error: any) {
      console.error('Get boleto details error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar detalhes do boleto',
        code: error.response?.data?.code || 'GET_BOLETO_ERROR',
      };
    }
  },

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  /**
   * Mapear resposta de conta do backend para frontend
   */
  mapAccountResponse(data: any): DigitalAccount {
    return {
      id: data.id || data.accountId,
      accountId: data.account_id || data.accountId || data.id,
      agencyNumber: data.agency_number || data.agencyNumber || '',
      accountNumber: data.account_number || data.accountNumber || '',
      accountDigit: data.account_digit || data.accountDigit || '',
      bankCode: data.bank_code || data.bankCode || '',
      bankName: data.bank_name || data.bankName || '',
      accountType: data.account_type || data.accountType || 'checking',
      status: data.status || 'active',
      balance: {
        available: data.balance?.available || 0,
        locked: data.balance?.locked || 0,
        reserved: data.balance?.reserved || 0,
        currency: data.balance?.currency || 'BRL',
      },
      pixKeys: (data.pix_keys || data.pixKeys || []).map((key: any) => ({
        keyType: key.key_type || key.keyType,
        keyValue: key.key_value || key.keyValue,
        createdAt: key.created_at || key.createdAt,
      })),
      createdAt: data.created_at || data.createdAt || new Date().toISOString(),
      updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
    };
  },

  /**
   * Mapear resposta de Pix do backend para frontend
   */
  mapPixResponse(data: any): PixTransaction {
    return {
      id: data.id || data.transactionId,
      transactionId: data.transaction_id || data.transactionId || data.id,
      amount: data.amount,
      currency: data.currency || 'BRL',
      recipientDocument: data.recipient_document || data.recipientDocument || '',
      description: data.description || '',
      status: data.status || 'pending',
      paymentMethod: 'pix',
      qrCode: data.qr_code || data.qrCode,
      emv: data.emv,
      expirationDate: data.expiration_date || data.expirationDate,
      createdAt: data.created_at || data.createdAt || new Date().toISOString(),
      updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
    };
  },

  /**
   * Mapear resposta de boleto do backend para frontend
   */
  mapBoletoResponse(data: any): Boleto {
    return {
      id: data.id || data.boletoId,
      boletoId: data.boleto_id || data.boletoId || data.id,
      amount: data.amount,
      dueDate: data.due_date || data.dueDate || '',
      payerDocument: data.payer_document || data.payerDocument || '',
      description: data.description || '',
      status: data.status || 'issued',
      barcode: data.barcode || '',
      url: data.url || '',
      instructions: data.instructions || data.additional_information || '',
      fine: data.fine || 0,
      interest: data.interest || 0,
      createdAt: data.created_at || data.createdAt || new Date().toISOString(),
      updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
    };
  },

  /**
   * Formatar valor em centavos para reais
   */
  formatCurrency(valueInCents: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valueInCents / 100);
  },

  /**
   * Validar CPF/CNPJ
   */
  validateDocument(document: string): boolean {
    const cleaned = document.replace(/\D/g, '');
    return cleaned.length === 11 || cleaned.length === 14;
  },

  /**
   * Obter cor do status
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      active: 'text-green-600',
      completed: 'text-green-600',
      paid: 'text-green-600',
      pending: 'text-yellow-600',
      issued: 'text-blue-600',
      overdue: 'text-orange-600',
      failed: 'text-red-600',
      canceled: 'text-gray-600',
      blocked: 'text-red-600',
      inactive: 'text-gray-600',
    };
    return colors[status] || 'text-gray-600';
  },

  /**
   * Obter descrição do status
   */
  getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      active: 'Conta ativa',
      inactive: 'Conta inativa',
      blocked: 'Conta bloqueada',
      pending: 'Aguardando processamento',
      completed: 'Concluído',
      paid: 'Pago',
      issued: 'Emitido',
      overdue: 'Vencido',
      failed: 'Falhou',
      canceled: 'Cancelado',
    };
    return descriptions[status] || 'Status desconhecido';
  },
};

export default bankingService;

/**
 * Serviço de Lending (LaaS - Lending as a Service)
 *
 * Integração com backend /api/qitech/lending (mockada)
 * APIs da QI Tech para Lending as a Service
 *
 * Rotas backend:
 * - POST /api/qitech/lending/contracts - Criar contrato
 * - POST /api/qitech/lending/contracts/:contractId/sign - Assinar contrato
 * - GET /api/qitech/lending/contracts/:contractId/payments - Pagamentos
 * - POST /api/qitech/lending/contracts/:contractId/payments - Notificar pagamento
 * - POST /api/qitech/lending/contracts/:contractId/assign - Atribuir a fundos
 * - POST /api/qitech/lending/calculate-schedule - Calcular cronograma
 *
 * NOTA: Estas APIs estão mockadas no backend quando QITECH_MOCK_MODE=true
 */

import { apiClient } from './apiClients';
import type { ApiResponse } from '@/types';

// ============================================================================
// INTERFACES ESPECÍFICAS
// ============================================================================

/**
 * Dados para criar contrato de crédito
 */
export interface CreateCreditContractData {
  userId?: string;
  borrowerId?: string;
  borrowerDocument: string; // CPF ou CNPJ
  amount: number;
  interestRate: number; // Taxa de juros anual (%)
  installments: number; // Número de parcelas
  contractType?: 'CCB' | 'CCI' | 'CCE'; // Default: CCB
  description?: string;
  loanId?: string;
  offerId?: string;
}

/**
 * Contrato de crédito
 */
export interface CreditContract {
  id: string;
  contractId: string;
  borrowerDocument: string;
  amount: number;
  interestRate: number;
  installments: number;
  contractType: 'CCB' | 'CCI' | 'CCE';
  status: 'awaiting_signature' | 'signed' | 'active' | 'completed' | 'canceled';
  createdAt: string;
  updatedAt: string;
  signedAt?: string;
  dueDate?: string;
  totalAmount: number;
  repaymentSchedule: PaymentScheduleItem[];
}

/**
 * Item do cronograma de pagamento
 */
export interface PaymentScheduleItem {
  installment: number;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
  balance: number;
  status: 'pending' | 'paid' | 'overdue';
}

/**
 * Fluxo de assinatura
 */
export interface SignatureFlow {
  contractId: string;
  signatureId: string;
  status: 'awaiting_signature' | 'signed' | 'expired' | 'canceled';
  signerEmail: string;
  signatureUrl: string;
  expirationDate: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Detalhes de pagamentos do contrato
 */
export interface ContractPayments {
  contractId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installments: number;
  paidInstallments: number;
  remainingInstallments: number;
  payments: Payment[];
  status: 'ongoing' | 'completed' | 'defaulted';
}

/**
 * Pagamento de parcela
 */
export interface Payment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  paymentDate?: string;
  paymentMethod?: 'bank_transfer' | 'pix' | 'boleto' | 'credit_card';
}

/**
 * Dados para notificar pagamento
 */
export interface NotifyPaymentData {
  contractId: string;
  installmentNumber?: number;
  loanId?: string;
  amount: number;
  paymentDate?: string;
  paymentMethod?: 'bank_transfer' | 'pix' | 'boleto' | 'credit_card';
  status?: 'paid' | 'partially_paid';
  reference?: string;
}

/**
 * Dados para atribuir contrato a fundos
 */
export interface AssignContractData {
  contractId: string;
  fundId: string;
  assignmentPercentage?: number; // Default: 100
  effectiveDate?: string; // Default: hoje
  metadata?: Record<string, any>;
}

/**
 * Atribuição de contrato
 */
export interface ContractAssignment {
  contractId: string;
  assignmentId: string;
  fundId: string;
  assignmentPercentage: number;
  effectiveDate: string;
  status: 'pending' | 'completed' | 'failed';
  amountAssigned: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cronograma de empréstimo calculado
 */
export interface LoanSchedule {
  loanAmount: number;
  interestRate: number;
  term: number;
  totalAmount: number;
  totalInterest: number;
  paymentAmount: number;
  schedule: PaymentScheduleItem[];
}

// ============================================================================
// SERVIÇO DE LENDING
// ============================================================================

export const lendingService = {
  /**
   * Criar contrato de crédito
   * POST /api/qitech/lending/contracts
   *
   * @param data - Dados do contrato
   * @returns Contrato criado
   */
  async createCreditContract(
    data: CreateCreditContractData
  ): Promise<ApiResponse<CreditContract>> {
    try {
      const payload = {
        borrower_document: data.borrowerDocument,
        borrower_id: data.borrowerId,
        userId: data.userId,
        amount: data.amount,
        interest_rate: data.interestRate,
        interestRate: data.interestRate,
        installments: data.installments,
        contract_type: data.contractType || 'CCB',
        description: data.description,
        loanId: data.loanId,
        marketplace_offer_id: data.offerId,
      };

      const response = await apiClient.post('/qitech/lending/contracts', payload);

      return {
        success: true,
        data: this.mapContractResponse(response.data.contract || response.data),
        message: 'Contrato de crédito criado com sucesso',
      };
    } catch (error: any) {
      console.error('Create credit contract error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar contrato de crédito',
        code: error.response?.data?.code || 'CREATE_CONTRACT_ERROR',
      };
    }
  },

  /**
   * Assinar contrato (iniciar fluxo de assinatura eletrônica)
   * POST /api/qitech/lending/contracts/:contractId/sign
   *
   * @param contractId - ID do contrato
   * @param signerEmail - Email do assinante (opcional)
   * @returns Fluxo de assinatura
   */
  async signContract(
    contractId: string,
    signerEmail?: string
  ): Promise<ApiResponse<SignatureFlow>> {
    try {
      const payload = signerEmail ? { signer_email: signerEmail } : {};
      const response = await apiClient.post(
        `/qitech/lending/contracts/${contractId}/sign`,
        payload
      );

      return {
        success: true,
        data: this.mapSignatureResponse(response.data.signatureFlow || response.data),
        message: 'Fluxo de assinatura iniciado com sucesso',
      };
    } catch (error: any) {
      console.error('Sign contract error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao iniciar assinatura do contrato',
        code: error.response?.data?.code || 'SIGN_CONTRACT_ERROR',
      };
    }
  },

  /**
   * Obter pagamentos do contrato
   * GET /api/qitech/lending/contracts/:contractId/payments
   *
   * @param contractId - ID do contrato
   * @returns Pagamentos do contrato
   */
  async getContractPayments(contractId: string): Promise<ApiResponse<ContractPayments>> {
    try {
      const response = await apiClient.get(
        `/qitech/lending/contracts/${contractId}/payments`
      );

      return {
        success: true,
        data: this.mapPaymentsResponse(response.data.payments || response.data),
      };
    } catch (error: any) {
      console.error('Get contract payments error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar pagamentos do contrato',
        code: error.response?.data?.code || 'GET_PAYMENTS_ERROR',
      };
    }
  },

  /**
   * Notificar pagamento de parcela
   * POST /api/qitech/lending/contracts/:contractId/payments
   *
   * @param data - Dados do pagamento
   * @returns Confirmação do pagamento
   */
  async notifyPayment(data: NotifyPaymentData): Promise<ApiResponse<any>> {
    try {
      const payload = {
        installment_number: data.installmentNumber,
        loan_id: data.loanId,
        amount: data.amount,
        payment_date: data.paymentDate || new Date().toISOString().split('T')[0],
        payment_method: data.paymentMethod || 'bank_transfer',
        status: data.status || 'paid',
        reference: data.reference,
      };

      const response = await apiClient.post(
        `/qitech/lending/contracts/${data.contractId}/payments`,
        payload
      );

      return {
        success: true,
        data: response.data,
        message: 'Pagamento notificado com sucesso',
      };
    } catch (error: any) {
      console.error('Notify payment error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao notificar pagamento',
        code: error.response?.data?.code || 'NOTIFY_PAYMENT_ERROR',
      };
    }
  },

  /**
   * Atribuir contrato a fundos
   * POST /api/qitech/lending/contracts/:contractId/assign
   *
   * @param data - Dados da atribuição
   * @returns Atribuição criada
   */
  async assignContractToFunds(
    data: AssignContractData
  ): Promise<ApiResponse<ContractAssignment>> {
    try {
      const payload = {
        fund_id: data.fundId,
        fundId: data.fundId,
        assignment_percentage: data.assignmentPercentage || 100,
        percentage: data.assignmentPercentage || 100,
        effective_date: data.effectiveDate || new Date().toISOString().split('T')[0],
        effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
        additional_data: data.metadata,
        metadata: data.metadata,
      };

      const response = await apiClient.post(
        `/qitech/lending/contracts/${data.contractId}/assign`,
        payload
      );

      return {
        success: true,
        data: this.mapAssignmentResponse(response.data.assignment || response.data),
        message: 'Contrato atribuído com sucesso',
      };
    } catch (error: any) {
      console.error('Assign contract error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atribuir contrato',
        code: error.response?.data?.code || 'ASSIGN_CONTRACT_ERROR',
      };
    }
  },

  /**
   * Calcular cronograma de empréstimo
   * POST /api/qitech/lending/calculate-schedule
   *
   * @param loanAmount - Valor do empréstimo
   * @param interestRate - Taxa de juros anual (%)
   * @param term - Número de parcelas
   * @returns Cronograma calculado
   */
  async calculateLoanSchedule(
    loanAmount: number,
    interestRate: number,
    term: number
  ): Promise<ApiResponse<LoanSchedule>> {
    try {
      const response = await apiClient.post('/qitech/lending/calculate-schedule', {
        loanAmount,
        interestRate,
        term,
      });

      return {
        success: true,
        data: {
          loanAmount,
          interestRate,
          term,
          ...response.data,
        },
      };
    } catch (error: any) {
      console.error('Calculate loan schedule error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao calcular cronograma',
        code: error.response?.data?.code || 'CALCULATE_SCHEDULE_ERROR',
      };
    }
  },

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  /**
   * Mapear resposta de contrato do backend para frontend
   */
  mapContractResponse(data: any): CreditContract {
    return {
      id: data.id || data.contractId,
      contractId: data.contract_id || data.contractId || data.id,
      borrowerDocument: data.borrower_document || data.borrowerDocument || '',
      amount: data.amount,
      interestRate: data.interest_rate || data.interestRate || 0,
      installments: data.installments || 0,
      contractType: data.contract_type || data.contractType || 'CCB',
      status: data.status || 'awaiting_signature',
      createdAt: data.created_at || data.createdAt || new Date().toISOString(),
      updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
      signedAt: data.signed_at || data.signedAt,
      dueDate: data.due_date || data.dueDate,
      totalAmount: data.total_amount || data.totalAmount || 0,
      repaymentSchedule: (data.repayment_schedule || data.repaymentSchedule || []).map(
        (item: any) => ({
          installment: item.installment,
          dueDate: item.dueDate || item.due_date,
          amount: item.amount,
          principal: item.principal,
          interest: item.interest,
          balance: item.balance,
          status: item.status || 'pending',
        })
      ),
    };
  },

  /**
   * Mapear resposta de assinatura do backend para frontend
   */
  mapSignatureResponse(data: any): SignatureFlow {
    return {
      contractId: data.contract_id || data.contractId || '',
      signatureId: data.signature_id || data.signatureId || '',
      status: data.status || 'awaiting_signature',
      signerEmail: data.signer_email || data.signerEmail || '',
      signatureUrl: data.signature_url || data.signatureUrl || '',
      expirationDate: data.expiration_date || data.expirationDate || '',
      createdAt: data.created_at || data.createdAt || new Date().toISOString(),
      updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
    };
  },

  /**
   * Mapear resposta de pagamentos do backend para frontend
   */
  mapPaymentsResponse(data: any): ContractPayments {
    return {
      contractId: data.contract_id || data.contractId || '',
      totalAmount: data.total_amount || data.totalAmount || 0,
      paidAmount: data.paid_amount || data.paidAmount || 0,
      remainingAmount: data.remaining_amount || data.remainingAmount || 0,
      installments: data.installments || 0,
      paidInstallments: data.paid_installments || data.paidInstallments || 0,
      remainingInstallments: data.remaining_installments || data.remainingInstallments || 0,
      status: data.status || 'ongoing',
      payments: (data.payments || []).map((payment: any) => ({
        installmentNumber: payment.installment_number || payment.installmentNumber,
        dueDate: payment.due_date || payment.dueDate,
        amount: payment.amount,
        paidAmount: payment.paid_amount || payment.paidAmount || 0,
        status: payment.status || 'pending',
        paymentDate: payment.payment_date || payment.paymentDate,
        paymentMethod: payment.payment_method || payment.paymentMethod,
      })),
    };
  },

  /**
   * Mapear resposta de atribuição do backend para frontend
   */
  mapAssignmentResponse(data: any): ContractAssignment {
    return {
      contractId: data.contract_id || data.contractId || '',
      assignmentId: data.assignment_id || data.assignmentId || '',
      fundId: data.fund_id || data.fundId || '',
      assignmentPercentage: data.assignment_percentage || data.assignmentPercentage || 100,
      effectiveDate: data.effective_date || data.effectiveDate || '',
      status: data.status || 'completed',
      amountAssigned: data.amount_assigned || data.amountAssigned || 0,
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
   * Calcular total de juros
   */
  calculateTotalInterest(schedule: PaymentScheduleItem[]): number {
    return schedule.reduce((sum, item) => sum + item.interest, 0);
  },

  /**
   * Calcular próxima parcela vencendo
   */
  getNextDuePayment(payments: Payment[]): Payment | null {
    const pending = payments.filter((p) => p.status === 'pending' || p.status === 'overdue');
    if (pending.length === 0) return null;
    return pending.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )[0];
  },

  /**
   * Obter cor do status
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      awaiting_signature: 'text-yellow-600',
      signed: 'text-blue-600',
      active: 'text-green-600',
      completed: 'text-green-600',
      canceled: 'text-red-600',
      expired: 'text-gray-600',
      pending: 'text-yellow-600',
      paid: 'text-green-600',
      overdue: 'text-red-600',
      partially_paid: 'text-orange-600',
      ongoing: 'text-blue-600',
      defaulted: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  },

  /**
   * Obter descrição do status
   */
  getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      awaiting_signature: 'Aguardando assinatura',
      signed: 'Assinado',
      active: 'Ativo',
      completed: 'Concluído',
      canceled: 'Cancelado',
      expired: 'Expirado',
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Vencido',
      partially_paid: 'Parcialmente pago',
      ongoing: 'Em andamento',
      defaulted: 'Inadimplente',
    };
    return descriptions[status] || 'Status desconhecido';
  },

  /**
   * Validar dados do contrato
   */
  validateContractData(data: CreateCreditContractData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.borrowerDocument) errors.push('Documento do tomador é obrigatório');
    if (!data.amount || data.amount <= 0) errors.push('Valor do empréstimo inválido');
    if (!data.interestRate || data.interestRate < 0)
      errors.push('Taxa de juros inválida');
    if (!data.installments || data.installments <= 0)
      errors.push('Número de parcelas inválido');

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

export default lendingService;

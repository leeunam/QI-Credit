/**
 * Serviço de Análise de Crédito
 *
 * Integração com backend /api/qitech/credit (mockada)
 * APIs da QI Tech para análise de crédito e scoring
 *
 * Rotas backend:
 * - POST /api/qitech/credit/individual - Análise PF
 * - POST /api/qitech/credit/business - Análise PJ
 * - GET /api/qitech/credit/score/:userId - Score do usuário
 * - PUT /api/qitech/credit/status/:analysisId - Atualizar status
 *
 * NOTA: Estas APIs estão mockadas no backend quando QITECH_MOCK_MODE=true
 */

import { apiClient } from './apiClients';
import type {
  ApiResponse,
  IndividualCreditAnalysisData,
  CreditScore,
  CreditAnalysisResult,
  CreditAnalysisStatus,
} from '@/types';

// ============================================================================
// INTERFACES ESPECÍFICAS
// ============================================================================

/**
 * Dados para análise de crédito empresarial (PJ)
 */
export interface BusinessCreditAnalysisData {
  userId: string;
  document: string; // CNPJ
  companyName: string;
  foundedDate: string; // YYYY-MM-DD
  monthlyRevenue: number;
  requestedAmount: number;
  loanPurpose: string;
  numberOfEmployees?: number;
  businessType?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

/**
 * Histórico de análise de crédito
 */
export interface CreditAnalysisHistory {
  id: string;
  userId: string;
  analysisType: 'individual' | 'business';
  requestedAmount: number;
  approvedAmount: number;
  status: CreditAnalysisStatus;
  score: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Filtros para histórico
 */
export interface CreditHistoryFilters {
  userId: string;
  analysisType?: 'individual' | 'business';
  status?: CreditAnalysisStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// SERVIÇO DE ANÁLISE DE CRÉDITO
// ============================================================================

export const creditAnalysisService = {
  /**
   * Submeter análise de crédito individual (Pessoa Física)
   * POST /api/qitech/credit/individual
   *
   * @param data - Dados da análise PF
   * @returns Resultado da análise com score, valor aprovado, etc.
   */
  async submitIndividual(
    data: IndividualCreditAnalysisData
  ): Promise<ApiResponse<CreditAnalysisResult>> {
    try {
      const response = await apiClient.post('/qitech/credit/individual', data);

      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Análise de crédito enviada com sucesso',
      };
    } catch (error: any) {
      console.error('Submit individual credit analysis error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao enviar análise de crédito',
        code: error.response?.data?.code || 'SUBMIT_INDIVIDUAL_ERROR',
      };
    }
  },

  /**
   * Submeter análise de crédito empresarial (Pessoa Jurídica)
   * POST /api/qitech/credit/business
   *
   * @param data - Dados da análise PJ
   * @returns Resultado da análise com score, valor aprovado, etc.
   */
  async submitBusiness(
    data: BusinessCreditAnalysisData
  ): Promise<ApiResponse<CreditAnalysisResult>> {
    try {
      const response = await apiClient.post('/qitech/credit/business', data);

      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Análise de crédito empresarial enviada com sucesso',
      };
    } catch (error: any) {
      console.error('Submit business credit analysis error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao enviar análise empresarial',
        code: error.response?.data?.code || 'SUBMIT_BUSINESS_ERROR',
      };
    }
  },

  /**
   * Obter score de crédito do usuário
   * GET /api/qitech/credit/score/:userId
   *
   * @param userId - ID do usuário
   * @param entityType - Tipo de entidade (natural_person ou legal_entity)
   * @returns Score de crédito com análise detalhada
   */
  async getCreditScore(
    userId: string,
    entityType: 'natural_person' | 'legal_entity' = 'natural_person'
  ): Promise<ApiResponse<CreditScore>> {
    try {
      const response = await apiClient.get(`/qitech/credit/score/${userId}`, {
        params: { entityType },
      });

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error: any) {
      console.error('Get credit score error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar score de crédito',
        code: error.response?.data?.code || 'GET_SCORE_ERROR',
      };
    }
  },

  /**
   * Atualizar status de análise de crédito
   * PUT /api/qitech/credit/status/:analysisId
   *
   * @param analysisId - ID da análise
   * @param status - Novo status
   * @param entityType - Tipo de entidade
   * @returns Análise atualizada
   */
  async updateStatus(
    analysisId: string,
    status: CreditAnalysisStatus,
    entityType: 'natural_person' | 'legal_entity' = 'natural_person'
  ): Promise<ApiResponse<CreditAnalysisResult>> {
    try {
      const response = await apiClient.put(`/qitech/credit/status/${analysisId}`, {
        status,
        entityType,
      });

      return {
        success: true,
        data: response.data,
        message: 'Status atualizado com sucesso',
      };
    } catch (error: any) {
      console.error('Update credit analysis status error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar status',
        code: error.response?.data?.code || 'UPDATE_STATUS_ERROR',
      };
    }
  },

  /**
   * Obter histórico de análises de crédito (usando API legada)
   * GET /api/credit-analysis/history/:userId
   *
   * @param filters - Filtros para histórico
   * @returns Lista de análises realizadas
   */
  async getHistory(
    filters: CreditHistoryFilters
  ): Promise<ApiResponse<CreditAnalysisHistory[]>> {
    try {
      const params = new URLSearchParams();

      if (filters.analysisType) params.append('analysisType', filters.analysisType);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await apiClient.get(
        `/credit-analysis/history/${filters.userId}?${params.toString()}`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Get credit history error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar histórico',
        code: error.response?.data?.code || 'GET_HISTORY_ERROR',
      };
    }
  },

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  /**
   * Calcular score aproximado baseado em dados básicos
   * (cliente-side, para preview antes de enviar)
   */
  calculateEstimatedScore(data: {
    monthlyIncome: number;
    requestedAmount: number;
    employmentStatus?: string;
  }): { score: number; riskLevel: 'low' | 'medium' | 'high' } {
    let score = 500; // Base

    // Renda vs valor solicitado
    const incomeRatio = data.requestedAmount / data.monthlyIncome;
    if (incomeRatio < 3) {
      score += 150;
    } else if (incomeRatio < 5) {
      score += 100;
    } else if (incomeRatio < 8) {
      score += 50;
    }

    // Emprego
    if (data.employmentStatus === 'employed') {
      score += 100;
    } else if (data.employmentStatus === 'self_employed') {
      score += 50;
    }

    // Limitar entre 300 e 900
    score = Math.max(300, Math.min(900, score));

    // Determinar risco
    let riskLevel: 'low' | 'medium' | 'high';
    if (score >= 700) {
      riskLevel = 'low';
    } else if (score >= 500) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    return { score, riskLevel };
  },

  /**
   * Formatar score para exibição
   */
  formatScore(score: number): string {
    return score.toFixed(0);
  },

  /**
   * Obter cor baseada no score
   */
  getScoreColor(score: number): string {
    if (score >= 700) return 'text-green-600';
    if (score >= 500) return 'text-yellow-600';
    return 'text-red-600';
  },

  /**
   * Obter descrição do nível de risco
   */
  getRiskDescription(riskLevel: string): string {
    const descriptions: Record<string, string> = {
      low: 'Baixo risco - Excelente histórico de crédito',
      medium: 'Risco médio - Histórico de crédito regular',
      high: 'Alto risco - Histórico de crédito limitado ou problemas',
      very_high: 'Risco muito alto - Histórico com inadimplências',
    };

    return descriptions[riskLevel] || 'Risco não definido';
  },

  /**
   * Validar dados antes de enviar análise
   */
  validateIndividualData(
    data: IndividualCreditAnalysisData
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.userId) errors.push('ID do usuário é obrigatório');
    if (!data.document || data.document.length !== 11) {
      errors.push('CPF inválido');
    }
    if (!data.fullName || data.fullName.length < 3) {
      errors.push('Nome completo inválido');
    }
    if (!data.birthDate) errors.push('Data de nascimento é obrigatória');
    if (!data.monthlyIncome || data.monthlyIncome <= 0) {
      errors.push('Renda mensal inválida');
    }
    if (!data.requestedAmount || data.requestedAmount <= 0) {
      errors.push('Valor solicitado inválido');
    }
    if (!data.loanPurpose) errors.push('Finalidade do empréstimo é obrigatória');

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validar dados empresariais antes de enviar
   */
  validateBusinessData(
    data: BusinessCreditAnalysisData
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.userId) errors.push('ID do usuário é obrigatório');
    if (!data.document || data.document.length !== 14) {
      errors.push('CNPJ inválido');
    }
    if (!data.companyName || data.companyName.length < 3) {
      errors.push('Razão social inválida');
    }
    if (!data.foundedDate) errors.push('Data de fundação é obrigatória');
    if (!data.monthlyRevenue || data.monthlyRevenue <= 0) {
      errors.push('Faturamento mensal inválido');
    }
    if (!data.requestedAmount || data.requestedAmount <= 0) {
      errors.push('Valor solicitado inválido');
    }
    if (!data.loanPurpose) errors.push('Finalidade do empréstimo é obrigatória');

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

export default creditAnalysisService;

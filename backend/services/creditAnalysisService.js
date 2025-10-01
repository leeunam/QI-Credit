const axios = require('axios');
const config = require('../config/config');

// Determine if we're running in mock mode
const isMockMode = config.QITECH_MOCK_MODE === 'true';

class QitechCreditAnalysisAPI {
  constructor(baseURL, apiKey) {
    this.apiKey = apiKey || config.QITECH_API_KEY;
    this.baseURL = baseURL || config.QITECH_CREDIT_ANALYSIS_URL;
    
    // Only initialize axios client if not in mock mode
    if (!isMockMode) {
      this.client = axios.create({
        baseURL: this.baseURL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey, // QITech uses API key directly
          'X-Request-ID': this.generateRequestId()
        }
      });
    }
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Submit credit analysis for natural person (individual)
  async submitNaturalPerson(data) {
    if (isMockMode) {
      // Simulate different responses based on loan amount
      const mockResponse = {
        id: `mock_${Date.now()}`,
        analysis_status: this.determineMockStatus(data.financial.amount),
        credit_proposal_natural_person_id: `mock_${Date.now()}`,
        analysis_date: new Date().toISOString(),
        score: this.generateMockScore(data),
        approved_amount: this.calculateApprovedAmount(data),
        interest_rate: data.financial.annual_interest_rate,
        number_of_installments: data.financial.number_of_installments,
        cdi_percentage: data.financial.cdi_percentage,
        decision_details: this.generateMockDecision(data),
        event_date: new Date().toISOString()
      };
      console.log('Mock Credit Analysis API: Natural Person', data);
      return mockResponse;
    } else {
      try {
        const response = await this.client.post('/natural_person', data);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Submit credit analysis for legal person (business)
  async submitLegalPerson(data) {
    if (isMockMode) {
      // Simulate different responses based on loan amount
      const mockResponse = {
        id: `mock_${Date.now()}`,
        analysis_status: this.determineMockStatus(data.financial.amount),
        credit_proposal_legal_person_id: `mock_${Date.now()}`,
        analysis_date: new Date().toISOString(),
        score: this.generateMockScore(data),
        approved_amount: this.calculateApprovedAmount(data),
        interest_rate: data.financial.annual_interest_rate,
        number_of_installments: data.financial.number_of_installments,
        cdi_percentage: data.financial.cdi_percentage,
        decision_details: this.generateMockDecision(data),
        event_date: new Date().toISOString()
      };
      console.log('Mock Credit Analysis API: Legal Person', data);
      return mockResponse;
    } else {
      try {
        const response = await this.client.post('/legal_person', data);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Update status for natural person
  async updateNaturalPerson(id, data) {
    if (isMockMode) {
      const mockResponse = {
        id: id,
        credit_proposal_natural_person_id: id,
        credit_proposal_status: data.credit_proposal_status,
        analysis_status: data.credit_proposal_status,
        event_date: data.event_date || new Date().toISOString()
      };
      console.log('Mock Credit Analysis API: Update Natural Person', {id, data});
      return mockResponse;
    } else {
      try {
        const response = await this.client.put(`/natural_person/${id}`, data);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Update status for legal person
  async updateLegalPerson(id, data) {
    if (isMockMode) {
      const mockResponse = {
        id: id,
        credit_proposal_legal_person_id: id,
        credit_proposal_status: data.credit_proposal_status,
        analysis_status: data.credit_proposal_status,
        event_date: data.event_date || new Date().toISOString()
      };
      console.log('Mock Credit Analysis API: Update Legal Person', {id, data});
      return mockResponse;
    } else {
      try {
        const response = await this.client.put(`/legal_person/${id}`, data);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Helper method to determine mock status based on loan amount (simulating QITech sandbox rules)
  determineMockStatus(amount) {
    // Convert amount to integer for comparison (assuming cents)
    const loanAmount = parseInt(amount) || 0;
    
    // Using QITech sandbox test rules from documentation:
    // 0-2000: Aprovado
    // 2001-4000: Pendente
    // 4001-6000: Aguardando Dados
    // 6001-8000: Análise Manual (Aprovação)
    // 8001-10000: Análise Manual (Reprovação)
    // 10001+: Reprovado
    if (loanAmount <= 200000) return 'automatically_approved'; // 2000 in cents
    if (loanAmount <= 400000) return 'pending'; // 4000 in cents
    if (loanAmount <= 600000) return 'waiting_for_data'; // 6000 in cents
    if (loanAmount <= 800000) return 'in_manual_analysis'; // 8000 in cents
    if (loanAmount <= 1000000) return 'manually_reproved'; // 10000 in cents
    return 'automatically_reproved';
  }

  // Helper method to generate a mock score
  generateMockScore(data) {
    // Generate score based on profile
    const baseScore = Math.floor(Math.random() * (850 - 300 + 1)) + 300;
    
    // Factor in income, employment, etc. for more realistic scoring
    const income = parseInt(data.monthly_income) || 0;
    if (income > 1000000) return Math.min(850, baseScore + 50); // Very high income
    if (income > 500000) return Math.min(800, baseScore + 30); // High income
    if (income > 200000) return Math.min(750, baseScore); // Medium income
    return Math.max(300, baseScore - 50); // Lower income
  }

  // Helper method to calculate approved amount
  calculateApprovedAmount(data) {
    const requestedAmount = parseInt(data.financial.amount) || 0;
    const status = this.determineMockStatus(requestedAmount);
    
    // If approved, approve requested amount or up to 90% of requested
    // If rejected, approve 0
    if (status === 'automatically_approved') {
      return Math.floor(requestedAmount * (0.8 + Math.random() * 0.2)); // 80-100% of requested
    } else if (status === 'manually_approved' || status === 'in_manual_analysis') {
      return Math.floor(requestedAmount * (0.5 + Math.random() * 0.4)); // 50-90% of requested
    } else {
      return 0; // Amount not approved
    }
  }

  // Helper method to generate decision details
  generateMockDecision(data) {
    return {
      decision: 'APPROVED',
      reason: 'Credit profile meets minimum requirements',
      risk_level: 'LOW',
      recommended_amount: data.financial.amount,
      credit_limit: data.financial.amount,
      approval_date: new Date().toISOString()
    };
  }

  handleError(error) {
    if (isMockMode) {
      console.error('Mock mode - would have made API request but skipped due to mock mode');
      return {
        id: `mock_error_${Date.now()}`,
        analysis_status: 'error',
        error: error.message || 'Mock API error'
      };
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('QITech Credit Analysis API Error:', error.response.status, error.response.data);
      throw new Error(`${error.response.status}: ${error.response.data.message || 'API request failed'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('QITech Credit Analysis API Request Error:', error.request);
      throw new Error('No response received from QITech Credit Analysis API');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('QITech Credit Analysis API Setup Error:', error.message);
      throw new Error(`QITech Credit Analysis API setup error: ${error.message}`);
    }
  }
}

// Credit Analysis Service
class CreditAnalysisService {
  constructor() {
    this.qitechAPI = new QitechCreditAnalysisAPI(
      config.QITECH_CREDIT_ANALYSIS_URL,
      config.QITECH_API_KEY
    );
  }

  // Submit credit analysis for individual
  async submitIndividualCreditAnalysis(userData) {
    // Create the correct payload structure according to QITech documentation
    const payload = {
      id: userData.id || this.generateRequestId().split('_')[1],
      registration_id: userData.registration_id || this.generateRequestId().split('_')[1],
      credit_request_date: userData.credit_request_date || new Date().toISOString(),
      credit_type: userData.credit_type || 'credit_card',
      name: userData.name,
      document_number: userData.document, // Changed to match QITech API
      birthdate: userData.birthDate || userData.birthdate,
      email: userData.email,
      nationality: userData.nationality || 'BRA',
      gender: userData.gender || 'male',
      mother_name: userData.mother_name || userData.motherName || 'Not provided',
      father_name: userData.father_name || userData.fatherName || 'Not provided',
      monthly_income: userData.monthly_income || userData.monthlyIncome,
      declared_assets: userData.declared_assets || userData.declaredAssets || 0,
      occupation: userData.occupation || 'Not specified',
      address: userData.address || {
        country: 'BRA',
        street: 'Not specified',
        number: 'S/N',
        neighborhood: 'Not specified',
        city: 'Not specified',
        uf: 'SP',
        postal_code: '00000-000'
      },
      phones: userData.phones || [{
        international_dial_code: '55',
        area_code: userData.phone?.area_code || userData.phone?.substring(0, 2) || '11',
        number: userData.phone?.number || userData.phone?.substring(2) || '999999999',
        type: 'mobile'
      }],
      financial: {
        amount: userData.financial?.amount || userData.loanAmount || 100000,
        currency: 'BRL',
        interest_type: userData.financial?.interest_type || 'cdi_plus',
        annual_interest_rate: userData.financial?.annual_interest_rate || userData.interest_rate || 2.32,
        cdi_percentage: userData.financial?.cdi_percentage || 100,
        number_of_installments: userData.financial?.number_of_installments || userData.term || 4
      },
      source: {
        channel: userData.source?.channel || 'website',
        ip: userData.source?.ip || '127.0.0.1',
        session_id: userData.source?.session_id || this.generateRequestId()
      }
    };

    try {
      const result = await this.qitechAPI.submitNaturalPerson(payload);
      return {
        success: true,
        analysisId: result.id,
        status: result.analysis_status,
        analysis: result
      };
    } catch (error) {
      console.error('Error in individual credit analysis:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Submit credit analysis for business
  async submitBusinessCreditAnalysis(businessData) {
    // Create the correct payload structure according to QITech documentation
    const payload = {
      id: businessData.id || this.generateRequestId().split('_')[1],
      credit_request_date: businessData.credit_request_date || new Date().toISOString(),
      credit_type: businessData.credit_type || 'credit_card',
      legal_name: businessData.legal_name || businessData.corporate_name || businessData.corporateName,
      trading_name: businessData.trading_name || businessData.tradingName || businessData.legal_name || businessData.corporate_name || businessData.corporateName,
      document_number: businessData.document, // Changed to match QITech API
      constitution_date: businessData.constitution_date || businessData.constitutionDate || new Date().toISOString().split('T')[0],
      constitution_type: businessData.constitution_type || businessData.constitutionType || 'llc',
      email: businessData.email,
      monthly_revenue: businessData.monthly_revenue || businessData.monthlyRevenue,
      address: businessData.address || {
        country: 'BRA',
        street: 'Not specified',
        number: 'S/N',
        neighborhood: 'Not specified',
        city: 'Not specified',
        uf: 'SP',
        postal_code: '00000-000'
      },
      shareholders: businessData.shareholders || [],
      financial: {
        amount: businessData.financial?.amount || businessData.loanAmount || 100000,
        currency: 'BRL',
        interest_type: businessData.financial?.interest_type || 'cdi_plus',
        annual_interest_rate: businessData.financial?.annual_interest_rate || businessData.interest_rate || 2.32,
        cdi_percentage: businessData.financial?.cdi_percentage || 100,
        number_of_installments: businessData.financial?.number_of_installments || businessData.term || 4
      }
    };

    try {
      const result = await this.qitechAPI.submitLegalPerson(payload);
      return {
        success: true,
        analysisId: result.id,
        status: result.analysis_status,
        analysis: result
      };
    } catch (error) {
      console.error('Error in business credit analysis:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update credit analysis status
  async updateCreditAnalysisStatus(analysisId, status, entityType = 'natural_person') {
    const payload = {
      credit_proposal_status: status,
      event_date: new Date().toISOString()
    };

    try {
      let result;
      if (entityType === 'natural_person') {
        result = await this.qitechAPI.updateNaturalPerson(analysisId, payload);
      } else {
        result = await this.qitechAPI.updateLegalPerson(analysisId, payload);
      }

      return {
        success: true,
        analysisId: result.id,
        status: result.credit_proposal_status,
        analysis: result
      };
    } catch (error) {
      console.error('Error updating credit analysis status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get credit score for a user (placeholder - QITech returns status in the response)
  async getCreditScore(userId, entityType = 'natural_person') {
    // This would typically fetch from the database or from QITech API
    // For now, returning a mock implementation
    return {
      userId,
      creditScore: this.generateMockCreditScore(),
      riskLevel: this.determineRiskLevel(this.generateMockCreditScore()),
      lastUpdated: new Date().toISOString()
    };
  }

  // Helper function to generate mock credit score (for demonstration)
  generateMockCreditScore() {
    // Generate a random credit score between 300 and 850
    return Math.floor(Math.random() * (850 - 300 + 1)) + 300;
  }

  // Helper function to determine risk level based on credit score
  determineRiskLevel(creditScore) {
    if (creditScore >= 750) return 'LOW';
    if (creditScore >= 650) return 'MEDIUM';
    return 'HIGH';
  }
  
  // Generate unique request ID
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new CreditAnalysisService();
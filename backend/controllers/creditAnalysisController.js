const creditAnalysisService = require('../services/creditAnalysisService');
const { User, CreditAnalysis } = require('../../database/models/indexModel');
const bankingAsAService = require('../services/bankingAsAService');
const lendingAsAService = require('../services/lendingAsAService');
const blockchainService = require('../services/blockchainService');

const submitIndividualCreditAnalysis = async (req, res) => {
  try {
    const {
      id, registration_id, credit_request_date, credit_type, name, document, 
      birthdate, email, nationality, gender, mother_name, father_name, 
      monthly_income, declared_assets, occupation, address, phones, financial, 
      source, userId
    } = req.body;
    
    // Validações básicas
    if (!document || !name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Document, name, and email are required' 
      });
    }

    // Tentar validação com model se possível
    try {
      const user = new User({ 
        document, 
        name, 
        email, 
        monthly_income: monthly_income || 0 
      });
      
      const userValidation = user.validate();
      if (!userValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'User validation failed',
          details: userValidation.errors
        });
      }

      if (!user.canBorrow()) {
        return res.status(400).json({
          success: false,
          error: 'User is not eligible for credit'
        });
      }
    } catch (modelError) {
      // Se o model não funcionar, continuar com validação básica
      console.log('Model validation skipped:', modelError.message);
    }
    
    const userData = {
      id: id || creditAnalysisService.generateRequestId().split('_')[1],
      registration_id: registration_id || creditAnalysisService.generateRequestId().split('_')[1],
      credit_request_date: credit_request_date || new Date().toISOString(),
      credit_type: credit_type || 'credit_card',
      name,
      document: document, 
      birthdate: birthdate || new Date().toISOString().split('T')[0],
      email,
      nationality: nationality || 'BRA',
      gender: gender || 'male',
      mother_name: mother_name || 'Not provided',
      father_name: father_name || 'Not provided',
      monthly_income: monthly_income || 0,
      declared_assets: declared_assets || 0,
      occupation: occupation || 'Not specified',
      address: address || {
        country: 'BRA',
        street: 'Not specified',
        number: 'S/N',
        neighborhood: 'Not specified',
        city: 'Not specified',
        uf: 'SP',
        postal_code: '00000-000'
      },
      phones: phones || [{
        international_dial_code: '55',
        area_code: phones?.[0]?.area_code || '11',
        number: phones?.[0]?.number || '999999999',
        type: 'mobile'
      }],
      financial: financial || {
        amount: financial?.amount || 100000,
        currency: 'BRL',
        interest_type: financial?.interest_type || 'cdi_plus',
        annual_interest_rate: financial?.annual_interest_rate || 2.32,
        cdi_percentage: financial?.cdi_percentage || 100,
        number_of_installments: financial?.number_of_installments || 4
      },
      source: source || {
        channel: source?.channel || 'website',
        ip: source?.ip || '127.0.0.1',
        session_id: source?.session_id || creditAnalysisService.generateRequestId()
      },
      userId: userId || null
    };
    
    const result = await creditAnalysisService.submitIndividualCreditAnalysis(userData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in individual credit analysis controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const submitBusinessCreditAnalysis = async (req, res) => {
  try {
    const {
      id, credit_request_date, credit_type, legal_name, trading_name, 
      document, constitution_date, constitution_type, email, monthly_revenue, 
      address, shareholders, financial, userId
    } = req.body;
    
    if (!document || (!legal_name && !trading_name) || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Document, company name, and email are required' 
      });
    }
    
    const businessData = {
      id: id || creditAnalysisService.generateRequestId().split('_')[1],
      credit_request_date: credit_request_date || new Date().toISOString(),
      credit_type: credit_type || 'credit_card',
      legal_name: legal_name,
      trading_name: trading_name || legal_name,
      document: document,
      constitution_date: constitution_date || new Date().toISOString().split('T')[0],
      constitution_type: constitution_type || 'llc',
      email,
      monthly_revenue: monthly_revenue || 0,
      address: address || {
        country: 'BRA',
        street: 'Not specified',
        number: 'S/N',
        neighborhood: 'Not specified',
        city: 'Not specified',
        uf: 'SP',
        postal_code: '00000-000'
      },
      shareholders: shareholders || [],
      financial: financial || {
        amount: financial?.amount || 100000,
        currency: 'BRL',
        interest_type: financial?.interest_type || 'cdi_plus',
        annual_interest_rate: financial?.annual_interest_rate || 2.32,
        cdi_percentage: financial?.cdi_percentage || 100,
        number_of_installments: financial?.number_of_installments || 4
      },
      userId: userId || null
    };
    
    const result = await creditAnalysisService.submitBusinessCreditAnalysis(businessData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in submitBusinessCreditAnalysis controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getCreditScore = async (req, res) => {
  try {
    const { userId } = req.params;
    const { entityType = 'natural_person' } = req.query;
    
    const result = await creditAnalysisService.getCreditScore(userId, entityType);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getCreditScore controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateCreditAnalysisStatus = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { status, event_date, entityType = 'natural_person' } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status is required' 
      });
    }
    
    const result = await creditAnalysisService.updateCreditAnalysisStatus(
      analysisId, 
      status, 
      entityType
    );
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in updateCreditAnalysisStatus controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const applyForLoan = async (req, res) => {
  try {
    const {
      userId, document, name, email, phone, birthDate,
      monthlyIncome, loanAmount, loanTerm, purpose, address
    } = req.body;
    
    const creditData = {
      document,
      name,
      email,
      birthdate: birthDate,
      monthly_income: monthlyIncome,
      address,
      userId,
      financial: {
        amount: loanAmount,
        number_of_installments: loanTerm
      }
    };
    
    const creditResult = await creditAnalysisService.submitIndividualCreditAnalysis(creditData);
    
    if (!creditResult.success) {
      return res.status(400).json(creditResult);
    }
    
    const accountResult = await bankingAsAService.createDigitalAccount({
      document,
      name,
      email,
      phone: {
        area_code: phone?.area_code || phone?.substring(0, 2) || '11',
        number: phone?.number || phone?.substring(2) || '999999999'
      },
      userId,
      type: 'individual'
    });
    
    if (!accountResult.success) {
      return res.status(400).json(accountResult);
    }
    
    const contractData = {
      borrower_document: document,
      amount: loanAmount,
      interest_rate: 12.5,
      installments: loanTerm,
      contract_type: 'CCB',
      description: `Loan for ${purpose}`,
      loanId: creditResult.analysisId,
      userId
    };
    
    const contractResult = await lendingAsAService.createCreditContract(contractData);
    
    if (!contractResult.success) {
      return res.status(400).json(contractResult);
    }
    
    const paymentSchedule = lendingAsAService.calculateLoanSchedule(
      loanAmount, 
      12.5,
      loanTerm
    );
    
    const escrowResult = await blockchainService.depositToEscrow(
      contractResult.contractId,
      'borrower_address_placeholder', 
      'lender_address_placeholder',
      'arbitrator_address_placeholder',
      loanAmount
    );
    
    res.status(200).json({
      success: true,
      applicationId: contractResult.contractId,
      creditAnalysis: creditResult,
      account: accountResult,
      contract: contractResult,
      paymentSchedule,
      escrow: escrowResult,
      message: 'Loan application submitted successfully'
    });
  } catch (error) {
    console.error('Error in applyForLoan controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  submitIndividualCreditAnalysis,
  submitBusinessCreditAnalysis,
  getCreditScore,
  updateCreditAnalysisStatus,
  applyForLoan
};
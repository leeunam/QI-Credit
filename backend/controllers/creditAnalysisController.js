const creditAnalysisService = require('../services/creditAnalysisService');
const bankingAsAService = require('../services/bankingAsAService');
const lendingAsAService = require('../services/lendingAsAService');
const blockchainService = require('../services/blockchainService');

// Credit Analysis Controller (using QITech API)
const submitIndividualCreditAnalysis = async (req, res) => {
  try {
    const {
      id, registration_id, credit_request_date, credit_type, name, document, 
      birthdate, email, nationality, gender, mother_name, father_name, 
      monthly_income, declared_assets, occupation, address, phones, financial, 
      source, userId
    } = req.body;
    
    // Validate required fields according to QITech API
    if (!document || !name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Document, name, and email are required' 
      });
    }
    
    // Prepare data for QITech API using correct field names
    const userData = {
      id: id || creditAnalysisService.generateRequestId().split('_')[1],
      registration_id: registration_id || creditAnalysisService.generateRequestId().split('_')[1],
      credit_request_date: credit_request_date || new Date().toISOString(),
      credit_type: credit_type || 'credit_card',
      name,
      document: document, // Changed to match QITech API
      birthdate: birthdate || birthdate || new Date().toISOString().split('T')[0],
      email,
      nationality: nationality || 'BRA',
      gender: gender || 'male',
      mother_name: mother_name || 'Not provided',
      father_name: father_name || 'Not provided',
      monthly_income: monthly_income || monthlyIncome,
      declared_assets: declared_assets || declaredAssets || 0,
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
    
    // Submit to QITech API
    const result = await creditAnalysisService.submitIndividualCreditAnalysis(userData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in submitIndividualCreditAnalysis controller:', error);
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
    
    // Validate required fields according to QITech API
    if (!document || (!legal_name && !trading_name) || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Document, company name, and email are required' 
      });
    }
    
    // Prepare data for QITech API using correct field names
    const businessData = {
      id: id || creditAnalysisService.generateRequestId().split('_')[1],
      credit_request_date: credit_request_date || new Date().toISOString(),
      credit_type: credit_type || 'credit_card',
      legal_name: legal_name || legal_name,
      trading_name: trading_name || tradingName || legal_name || legal_name,
      document: document, // Changed to match QITech API
      constitution_date: constitution_date || constitutionDate || new Date().toISOString().split('T')[0],
      constitution_type: constitution_type || constitutionType || 'llc',
      email,
      monthly_revenue: monthly_revenue || monthlyRevenue,
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
    
    // Submit to QITech API
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
    
    // Get credit score from service
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
    
    // Validate input
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status is required' 
      });
    }
    
    // Update status in QITech API
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

// Full loan application process controller
const applyForLoan = async (req, res) => {
  try {
    const {
      userId,
      document,
      name,
      email,
      phone,
      birthDate,
      monthlyIncome,
      loanAmount,
      loanTerm,
      purpose,
      address
    } = req.body;
    
    // Step 1: Submit credit analysis
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
    
    // Step 2: If credit analysis is successful, proceed to banking
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
    
    // Step 3: Create lending contract
    const contractData = {
      borrower_document: document,
      amount: loanAmount,
      interest_rate: 12.5, // This would typically come from credit analysis result
      installments: loanTerm,
      contract_type: 'CCB',
      description: `Loan for ${purpose}`,
      loanId: creditResult.analysisId, // Link to credit analysis
      userId
    };
    
    const contractResult = await lendingAsAService.createCreditContract(contractData);
    
    if (!contractResult.success) {
      return res.status(400).json(contractResult);
    }
    
    // Step 4: Calculate payment schedule
    const paymentSchedule = lendingAsAService.calculateLoanSchedule(
      loanAmount, 
      12.5, // interest rate
      loanTerm
    );
    
    // Step 5: Set up blockchain escrow
    // This is a simplified version - in reality, you'd need more details
    const escrowResult = await blockchainService.depositToEscrow(
      contractResult.contractId,
      'borrower_address_placeholder', // Would come from user's wallet
      'lender_address_placeholder',   // Would come from lender's wallet
      'arbitrator_address_placeholder', // Would come from system
      loanAmount
    );
    
    // Return comprehensive result
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
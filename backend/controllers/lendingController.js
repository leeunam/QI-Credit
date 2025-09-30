const lendingAsAService = require('../services/lendingAsAService');

// Lending as a Service Controller
const createCreditContract = async (req, res) => {
  try {
    const {
      borrower_document,
      amount,
      interest_rate,
      installments,
      contract_type,
      additional_data,
      userId,
      loanId
    } = req.body;
    
    // Validate required fields according to QITech API
    if (!borrower_document || !amount || !interest_rate || !installments) {
      return res.status(400).json({ 
        success: false, 
        error: 'Borrower document, amount, interest rate, and installments are required' 
      });
    }
    
    // Prepare contract data using correct field structure
    const contractData = {
      borrower_document,
      amount,
      interest_rate,
      installments,
      contract_type: contract_type || 'CCB',
      additional_data: additional_data || {
        description: `Loan contract via QI Credit platform`,
        metadata: {
          loanId: loanId || lendingAsAService.generateRequestId(),
          userId: userId
        }
      }
    };
    
    // Create credit contract with QITech LaaS
    const result = await lendingAsAService.createCreditContract(contractData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in createCreditContract controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const triggerContractSignature = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { signer_email, notification_method } = req.body;
    
    // Validate input
    if (!contractId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contract ID is required' 
      });
    }
    
    // Prepare signature data using correct field structure
    const signatureData = {
      signer_email: signer_email || 'borrower@example.com',
      notification_method: notification_method || 'email'
    };
    
    // Trigger contract signature with QITech LaaS
    const result = await lendingAsAService.triggerContractSignature({
      ...signatureData,
      contractId
    });
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in triggerContractSignature controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getContractPayments = async (req, res) => {
  try {
    const { contractId } = req.params;
    
    // Validate input
    if (!contractId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contract ID is required' 
      });
    }
    
    // Get contract payments from QITech LaaS
    const result = await lendingAsAService.getContractPayments(contractId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in getContractPayments controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const notifyContractPayment = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { payment_date, amount, status, payment_method, reference } = req.body;
    
    // Validate required fields according to QITech API
    if (!payment_date || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Payment date and amount are required' 
      });
    }
    
    // Prepare payment data using correct field structure
    const paymentData = {
      payment_date: payment_date || new Date().toISOString().split('T')[0],
      amount,
      status: status || 'paid',
      payment_method: payment_method || 'bank_transfer',
      reference: reference || `Payment for contract ${contractId}`
    };
    
    // Notify contract payment to QITech LaaS
    const result = await lendingAsAService.notifyContractPayment(contractId, paymentData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in notifyContractPayment controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const assignContractToFunds = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { fund_id, assignment_percentage, effective_date, additional_data } = req.body;
    
    // Validate required fields according to QITech API
    if (!fund_id || !assignment_percentage || !effective_date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Fund ID, assignment percentage, and effective date are required' 
      });
    }
    
    // Prepare assignment data using correct field structure
    const assignmentData = {
      fund_id,
      assignment_percentage,
      effective_date,
      additional_data: additional_data || {}
    };
    
    // Assign contract to funds with QITech LaaS
    const result = await lendingAsAService.assignContractToFunds(contractId, assignmentData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in assignContractToFunds controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Calculate loan payment schedule
const calculateLoanSchedule = async (req, res) => {
  try {
    const { loanAmount, interestRate, term } = req.body;
    
    // Validate required fields
    if (!loanAmount || !interestRate || !term) {
      return res.status(400).json({ 
        success: false, 
        error: 'Loan amount, interest rate, and term are required' 
      });
    }
    
    // Calculate payment schedule
    const schedule = lendingAsAService.calculateLoanSchedule(loanAmount, interestRate, term);
    
    res.status(200).json({
      success: true,
      loanAmount,
      interestRate,
      term,
      schedule
    });
  } catch (error) {
    console.error('Error in calculateLoanSchedule controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Process contract webhook
const processContractWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Process contract webhook with the service
    const result = await lendingAsAService.processContractWebhook(webhookData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in processContractWebhook controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createCreditContract,
  triggerContractSignature,
  getContractPayments,
  notifyContractPayment,
  assignContractToFunds,
  calculateLoanSchedule,
  processContractWebhook
};
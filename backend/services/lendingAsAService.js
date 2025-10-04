const axios = require('axios');
const config = require('../config/config');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const Loan = require('../../database/models/loanModel');

// Determine if we're running in mock mode
const isMockMode = config.QITECH_MOCK_MODE === 'true';

class QitechLaaSAPI {
  constructor(baseURL, apiKey) {
    this.apiKey = apiKey || config.QITECH_API_KEY;
    this.baseURL = baseURL || config.QITECH_LAAS_URL;
    
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

  // Create credit contract
  async createContract(contractData) {
    if (isMockMode) {
      // Simulate creating a credit contract with mock data
      const mockContract = {
        id: `mock_contract_${Date.now()}`,
        contract_id: `contract_${Date.now()}`,
        borrower_document: contractData.borrower_document,
        amount: contractData.amount,
        interest_rate: contractData.interest_rate || 2.5,
        installments: contractData.installments || 12,
        contract_type: contractData.contract_type || 'CCB',
        status: 'awaiting_signature',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        signed_at: null,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        repayment_schedule: this.generateMockPaymentSchedule(
          contractData.amount,
          contractData.interest_rate || 2.5,
          contractData.installments || 12
        ),
        total_amount: this.calculateTotalAmount(
          contractData.amount,
          contractData.interest_rate || 2.5,
          contractData.installments || 12
        ),
        additional_data: contractData.additional_data || {}
      };
      console.log('Mock LaaS API: Create Contract', contractData);
      return mockContract;
    } else {
      try {
        const response = await this.client.post('/contracts', contractData);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Trigger electronic signature flow
  async triggerSignature(contractId, signatureData) {
    if (isMockMode) {
      // Simulate triggering electronic signature with mock data
      const mockSignature = {
        contract_id: contractId,
        signature_id: `mock_signature_${Date.now()}`,
        status: 'awaiting_signature',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        signer_email: signatureData?.signer_email || 'borrower@example.com',
        notification_method: signatureData?.notification_method || 'email',
        signature_url: `https://mock-signature-platform.com/sign/${contractId}`,
        expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        documents: [
          {
            document_id: `doc_${Date.now()}`,
            document_type: 'credit_contract',
            status: 'pending_signature'
          }
        ]
      };
      console.log('Mock LaaS API: Trigger Signature', {contractId, signatureData});
      return mockSignature;
    } else {
      try {
        const response = await this.client.post(`/contracts/${contractId}/sign`, signatureData);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Get contract payments
  async getContractPayments(contractId) {
    if (isMockMode) {
      // Simulate getting contract payments with mock data
      const mockPayments = {
        contract_id: contractId,
        total_amount: 500000, // in cents
        paid_amount: 200000, // in cents
        remaining_amount: 300000, // in cents
        installments: 12,
        paid_installments: 4,
        remaining_installments: 8,
        payments: [
          {
            installment_number: 1,
            due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: 50000,
            paid_amount: 50000,
            status: 'paid',
            payment_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            payment_method: 'bank_transfer'
          },
          {
            installment_number: 2,
            due_date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: 50000,
            paid_amount: 50000,
            status: 'paid',
            payment_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            payment_method: 'bank_transfer'
          },
          {
            installment_number: 3,
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: 50000,
            paid_amount: 0,
            status: 'pending',
            payment_date: null,
            payment_method: null
          },
          {
            installment_number: 4,
            due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: 50000,
            paid_amount: 0,
            status: 'pending',
            payment_date: null,
            payment_method: null
          }
        ],
        status: 'ongoing'
      };
      console.log('Mock LaaS API: Get Contract Payments', contractId);
      return mockPayments;
    } else {
      try {
        const response = await this.client.get(`/contracts/${contractId}/payments`);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Notify payment
  async notifyPayment(contractId, paymentData) {
    if (isMockMode) {
      // Simulate notifying payment with mock data
      const mockNotification = {
        contract_id: contractId,
        payment_id: `mock_payment_${Date.now()}`,
        payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
        amount: paymentData.amount,
        status: paymentData.status || 'paid',
        payment_method: paymentData.payment_method || 'bank_transfer',
        reference: paymentData.reference || `Payment for contract ${contractId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log('Mock LaaS API: Notify Payment', {contractId, paymentData});
      return mockNotification;
    } else {
      try {
        const response = await this.client.post(`/contracts/${contractId}/payments/event`, paymentData);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Assign contract to funds
  async assignContract(contractId, assignmentData) {
    if (isMockMode) {
      // Simulate assigning contract to funds with mock data
      const mockAssignment = {
        contract_id: contractId,
        assignment_id: `mock_assignment_${Date.now()}`,
        fund_id: assignmentData.fund_id,
        assignment_percentage: assignmentData.assignment_percentage || 100,
        effective_date: assignmentData.effective_date || new Date().toISOString().split('T')[0],
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        amount_assigned: Math.floor((assignmentData.assignment_percentage || 100) / 100 * 500000), // calculate based on percentage
        additional_data: assignmentData.additional_data || {}
      };
      console.log('Mock LaaS API: Assign Contract', {contractId, assignmentData});
      return mockAssignment;
    } else {
      try {
        const response = await this.client.post(`/contracts/${contractId}/assign`, assignmentData);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Helper method to generate mock payment schedule
  generateMockPaymentSchedule(loanAmount, interestRate, term) {
    const monthlyRate = interestRate / 12 / 100;
    const paymentAmount = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    
    const schedule = [];
    let balance = loanAmount;
    
    for (let i = 1; i <= term; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = paymentAmount - interestPayment;
      balance -= principalPayment;
      
      schedule.push({
        installment: i,
        dueDate: new Date(Date.now() + (i * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // Approximate due date
        amount: Math.round(paymentAmount),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.round(balance > 0 ? balance : 0),
        status: i <= 4 ? 'paid' : 'pending' // First 4 payments are paid, rest are pending
      });
    }
    
    return schedule;
  }

  // Helper method to calculate total amount
  calculateTotalAmount(loanAmount, interestRate, term) {
    const monthlyRate = interestRate / 12 / 100;
    const paymentAmount = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    return Math.round(paymentAmount * term);
  }

  handleError(error) {
    if (isMockMode) {
      console.error('Mock mode - would have made LaaS API request but skipped due to mock mode');
      return {
        id: `mock_error_${Date.now()}`,
        error: error.message || 'Mock API error',
        status: 'error'
      };
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('QITech LaaS API Error:', error.response.status, error.response.data);
      throw new Error(`${error.response.status}: ${error.response.data.message || 'API request failed'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('QITech LaaS API Request Error:', error.request);
      throw new Error('No response received from QITech LaaS API');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('QITech LaaS API Setup Error:', error.message);
      throw new Error(`QITech LaaS API setup error: ${error.message}`);
    }
  }
}

// Lending as a Service Service
class LendingAsAService {
  constructor() {
    this.qitechAPI = new QitechLaaSAPI(
      config.QITECH_LAAS_URL,
      config.QITECH_API_KEY
    );
  }

  // Create a credit contract (CCB, CCI, CCE)
  async createCreditContract(contractData) {
    // Create the correct payload structure according to QITech documentation
    const contractPayload = {
      borrower_document: contractData.borrower_document || contractData.borrower?.document || contractData.borrower?.document_number,
      amount: contractData.amount || contractData.loan_amount,
      interest_rate: contractData.interest_rate || contractData.interestRate || 2.5,
      installments: contractData.installments || contractData.term || contractData.numberOfInstallments,
      contract_type: contractData.contract_type || contractData.type || 'CCB',
      additional_data: {
        description: contractData.description || 'Credit contract via QI Credit platform',
        metadata: {
          loanId: contractData.loanId || this.generateRequestId(),
          userId: contractData.userId || contractData.borrower?.userId
        }
      }
    };

    const trx = await db.transaction();

    try {
      // Call QITech API to create contract
      const result = await this.qitechAPI.createContract(contractPayload);

      // Persist contract to database
      const loanContractData = {
        id: uuidv4(),
        borrower_id: contractData.borrower_id || contractData.userId,
        marketplace_offer_id: contractData.marketplace_offer_id || contractData.offerId,
        external_contract_id: result.id || result.contract_id,
        amount: contractPayload.amount,
        rate: contractPayload.interest_rate,
        term_days: (contractPayload.installments || 12) * 30, // Approximate conversion
        status: 'PENDING',
        contract_type: contractPayload.contract_type,
        metadata: JSON.stringify({
          qitech_response: result,
          repayment_schedule: result.repayment_schedule,
          total_amount: result.total_amount,
          installments: contractPayload.installments
        }),
        created_at: new Date(),
        updated_at: new Date()
      };

      const [dbContract] = await trx('loan_contracts')
        .insert(loanContractData)
        .returning('*');

      // Persist repayment schedule if available
      if (result.repayment_schedule && Array.isArray(result.repayment_schedule)) {
        const repayments = result.repayment_schedule.map((schedule) => ({
          id: uuidv4(),
          loan_id: dbContract.id,
          installment_number: schedule.installment,
          due_date: schedule.dueDate,
          amount: schedule.amount,
          principal_amount: schedule.principal,
          interest_amount: schedule.interest,
          status: schedule.status?.toUpperCase() || 'PENDING',
          created_at: new Date(),
          updated_at: new Date()
        }));

        await trx('repayments').insert(repayments);
      }

      await trx.commit();

      return {
        success: true,
        contractId: result.id,
        status: result.status,
        contract: result,
        dbRecord: dbContract
      };
    } catch (error) {
      await trx.rollback();
      console.error('Error creating credit contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Trigger electronic signature for contract
  async triggerContractSignature(contractId) {
    // Create the correct payload structure according to QITech documentation
    const signaturePayload = {
      signer_email: contractId.signer_email || 'borrower@example.com', // This would come from borrower details
      notification_method: contractId.notification_method || 'email'
    };

    try {
      const result = await this.qitechAPI.triggerSignature(contractId, signaturePayload);
      return {
        success: true,
        contractId,
        signatureFlow: result
      };
    } catch (error) {
      console.error('Error triggering contract signature:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get contract payment details
  async getContractPayments(contractId) {
    try {
      const result = await this.qitechAPI.getContractPayments(contractId);
      return {
        success: true,
        contractId,
        payments: result.payments
      };
    } catch (error) {
      console.error('Error getting contract payments:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Notify payment to contract
  async notifyContractPayment(contractId, paymentData) {
    // Create the correct payload structure according to QITech documentation
    const paymentPayload = {
      payment_date: paymentData.payment_date || paymentData.date || new Date().toISOString().split('T')[0],
      amount: paymentData.amount,
      status: paymentData.status || 'paid',
      payment_method: paymentData.payment_method || paymentData.method || 'bank_transfer',
      reference: paymentData.reference || `Payment for contract ${contractId}`
    };

    const trx = await db.transaction();

    try {
      // Call QITech API to notify payment
      const result = await this.qitechAPI.notifyPayment(contractId, paymentPayload);

      // Update repayment in database if installment number provided
      if (paymentData.installment_number) {
        await trx('repayments')
          .where({
            loan_id: paymentData.loan_id,
            installment_number: paymentData.installment_number
          })
          .update({
            status: 'PAID',
            paid_amount: paymentData.amount,
            payment_date: paymentPayload.payment_date,
            payment_method: paymentPayload.payment_method,
            updated_at: new Date()
          });
      }

      await trx.commit();

      return {
        success: true,
        contractId,
        paymentNotification: result
      };
    } catch (error) {
      await trx.rollback();
      console.error('Error notifying contract payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Assign contract to funds
  async assignContractToFunds(contractId, assignmentData) {
    // Create the correct payload structure according to QITech documentation
    const assignmentPayload = {
      fund_id: assignmentData.fund_id || assignmentData.fundId,
      assignment_percentage: assignmentData.assignment_percentage || assignmentData.percentage || 100,
      effective_date: assignmentData.effective_date || assignmentData.effectiveDate || new Date().toISOString().split('T')[0],
      additional_data: assignmentData.additional_data || assignmentData.metadata || {}
    };

    try {
      const result = await this.qitechAPI.assignContract(contractId, assignmentPayload);
      return {
        success: true,
        contractId,
        assignment: result
      };
    } catch (error) {
      console.error('Error assigning contract to funds:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process contract event webhook
  async processContractWebhook(webhookData) {
    // Process incoming contract event webhook from QITech
    try {
      // Update local database with contract status
      // This would typically update contract records in your database
      console.log('Processing contract webhook:', webhookData);
      
      // Example: update contract status in database
      // await database.updateContractStatus(webhookData.contract_id, webhookData.status);
      
      return {
        success: true,
        message: 'Contract webhook processed successfully'
      };
    } catch (error) {
      console.error('Error processing contract webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Calculate loan payments schedule
  calculateLoanSchedule(loanAmount, interestRate, term) {
    const monthlyRate = interestRate / 12 / 100;
    const paymentAmount = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    
    const schedule = [];
    let balance = loanAmount;
    
    for (let i = 1; i <= term; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = paymentAmount - interestPayment;
      balance -= principalPayment;
      
      schedule.push({
        installment: i,
        dueDate: new Date(Date.now() + (i * 30 * 24 * 60 * 60 * 1000)), // Approximate due date
        amount: parseFloat(paymentAmount.toFixed(2)),
        principal: parseFloat(principalPayment.toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        balance: parseFloat(balance > 0 ? balance.toFixed(2) : 0)
      });
    }
    
    return {
      totalAmount: parseFloat((paymentAmount * term).toFixed(2)),
      totalInterest: parseFloat(((paymentAmount * term) - loanAmount).toFixed(2)),
      paymentAmount: parseFloat(paymentAmount.toFixed(2)),
      schedule
    };
  }
  
  // Generate unique request ID
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = new LendingAsAService();
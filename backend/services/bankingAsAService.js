const axios = require('axios');
const config = require('../config/config');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const DigitalAccount = require('../../database/models/digitalaccountModel');

// Determine if we're running in mock mode
const isMockMode = config.QITECH_MOCK_MODE === 'true';

class QitechBaaSAPI {
  constructor(baseURL, apiKey) {
    this.apiKey = apiKey || config.QITECH_API_KEY;
    this.baseURL = baseURL || config.QITECH_BANKING_URL;
    
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

  // Create a digital account
  async createAccount(accountData) {
    if (isMockMode) {
      // Simulate creating a digital account with mock data
      const mockAccount = {
        id: `mock_acc_${Date.now()}`,
        account_id: `acc_${Date.now()}`,
        agency_number: Math.floor(1000 + Math.random() * 9000).toString(),
        account_number: Math.floor(10000000 + Math.random() * 90000000).toString(),
        account_digit: Math.floor(Math.random() * 9).toString(),
        bank_code: '000',
        bank_name: 'QI Tech Bank',
        account_type: 'checking',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        document: accountData.document,
        name: accountData.name,
        email: accountData.email,
        phone: accountData.phone,
        pix_keys: [
          {
            key_type: 'cpf',
            key_value: accountData.document,
            created_at: new Date().toISOString()
          },
          {
            key_type: 'email',
            key_value: accountData.email,
            created_at: new Date().toISOString()
          }
        ],
        balance: {
          available: 0,
          locked: 0,
          reserved: 0,
          currency: 'BRL'
        }
      };
      console.log('Mock BaaS API: Create Account', accountData);
      return mockAccount;
    } else {
      try {
        const response = await this.client.post('/accounts', accountData);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Get account details
  async getAccount(accountId) {
    if (isMockMode) {
      // Simulate getting account details
      const mockAccount = {
        id: accountId,
        account_id: accountId,
        agency_number: Math.floor(1000 + Math.random() * 9000).toString(),
        account_number: Math.floor(10000000 + Math.random() * 90000000).toString(),
        account_digit: Math.floor(Math.random() * 9).toString(),
        bank_code: '000',
        bank_name: 'QI Tech Bank',
        account_type: 'checking',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pix_keys: [
          {
            key_type: 'cpf',
            key_value: '12345678900',
            created_at: new Date().toISOString()
          }
        ],
        balance: {
          available: Math.floor(Math.random() * 1000000), // Random balance in cents
          locked: 0,
          reserved: 0,
          currency: 'BRL'
        }
      };
      console.log('Mock BaaS API: Get Account', accountId);
      return mockAccount;
    } else {
      try {
        const response = await this.client.get(`/accounts/${accountId}`);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Create Pix transaction
  async createPixTransaction(transactionData) {
    if (isMockMode) {
      // Simulate creating a Pix transaction with mock data
      const mockTransaction = {
        id: `mock_pix_${Date.now()}`,
        transaction_id: `pix_${Date.now()}`,
        amount: transactionData.amount,
        currency: transactionData.currency || 'BRL',
        recipient_document: transactionData.recipient_document,
        description: transactionData.description || 'Pix transaction',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        payment_method: 'pix',
        qr_code: `mock_qr_${Date.now()}`,
        emv: `mock_emv_${Date.now()}`,
        expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };
      console.log('Mock BaaS API: Create Pix Transaction', transactionData);
      return mockTransaction;
    } else {
      try {
        const response = await this.client.post('/pix/transactions', transactionData);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Issue a boleto
  async issueBoleto(boletoData) {
    if (isMockMode) {
      // Simulate issuing a boleto with mock data
      const mockBoleto = {
        id: `mock_boleto_${Date.now()}`,
        boleto_id: `boleto_${Date.now()}`,
        amount: boletoData.amount,
        due_date: boletoData.due_date || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payer_document: boletoData.payer_document,
        description: boletoData.description || 'Boleto payment',
        status: 'issued',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        barcode: `mock_barcode_${Date.now()}`,
        url: `https://mock-boleto-url.com/${Date.now()}`,
        instructions: boletoData.additional_information || 'Payment via QI Credit platform',
        fine: 2.0, // 2% fine after due date
        interest: 1.0 // 1% interest per month after due date
      };
      console.log('Mock BaaS API: Issue Boleto', boletoData);
      return mockBoleto;
    } else {
      try {
        const response = await this.client.post('/boletos', boletoData);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Get boleto details
  async getBoleto(boletoId) {
    if (isMockMode) {
      // Simulate getting boleto details
      const mockBoleto = {
        id: boletoId,
        boleto_id: boletoId,
        amount: Math.floor(Math.random() * 100000), // Random amount in cents
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        payer_document: '12345678900',
        description: 'Mock boleto description',
        status: ['paid', 'pending', 'overdue', 'canceled'][Math.floor(Math.random() * 4)],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        barcode: `mock_barcode_${Date.now()}`,
        url: `https://mock-boleto-url.com/${boletoId}`,
        instructions: 'Mock boleto instructions',
        fine: 2.0,
        interest: 1.0
      };
      console.log('Mock BaaS API: Get Boleto', boletoId);
      return mockBoleto;
    } else {
      try {
        const response = await this.client.get(`/boletos/${boletoId}`);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  handleError(error) {
    if (isMockMode) {
      console.error('Mock mode - would have made BaaS API request but skipped due to mock mode');
      return {
        id: `mock_error_${Date.now()}`,
        error: error.message || 'Mock API error',
        status: 'error'
      };
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('QITech BaaS API Error:', error.response.status, error.response.data);
      throw new Error(`${error.response.status}: ${error.response.data.message || 'API request failed'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('QITech BaaS API Request Error:', error.request);
      throw new Error('No response received from QITech BaaS API');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('QITech BaaS API Setup Error:', error.message);
      throw new Error(`QITech BaaS API setup error: ${error.message}`);
    }
  }
}

// Banking as a Service Service
class BankingAsAService {
  constructor() {
    this.qitechAPI = new QitechBaaSAPI(
      config.QITECH_BANKING_URL,
      config.QITECH_API_KEY
    );
  }

  // Create digital account for user
  async createDigitalAccount(userData) {
    // Create the correct payload structure according to QITech documentation
    const accountData = {
      document: userData.document,
      name: userData.name,
      email: userData.email,
      phone: {
        area_code: userData.phone?.area_code || userData.phone?.substring(0, 2) || '11',
        number: userData.phone?.number || userData.phone?.substring(2) || '999999999'
      }
    };

    const trx = await db.transaction();

    try {
      // Call QITech API to create account
      const result = await this.qitechAPI.createAccount(accountData);

      // Persist to database
      const digitalAccountData = {
        id: uuidv4(),
        user_id: userData.user_id || userData.id,
        external_account_id: result.id || result.account_id,
        account_number: result.account_number,
        agency_number: result.agency_number,
        account_digit: result.account_digit || '0',
        bank_code: result.bank_code,
        bank_name: result.bank_name || 'QI Tech Bank',
        account_type: result.account_type?.toUpperCase() || 'CHECKING',
        status: result.status?.toUpperCase() || 'ACTIVE',
        balance: result.balance?.available || 0,
        pix_keys: JSON.stringify(result.pix_keys || []),
        metadata: JSON.stringify({
          qitech_response: result,
          created_from_service: true
        }),
        created_at: new Date(),
        updated_at: new Date()
      };

      const [dbAccount] = await trx('digital_accounts')
        .insert(digitalAccountData)
        .returning('*');

      await trx.commit();

      return {
        success: true,
        accountId: result.id,
        accountNumber: result.account_number,
        agencyNumber: result.agency_number,
        bankCode: result.bank_code,
        pixKey: result.pix_key,
        accountDetails: result,
        dbRecord: dbAccount
      };
    } catch (error) {
      await trx.rollback();
      console.error('Error creating digital account:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get account details
  async getAccountDetails(accountId) {
    try {
      const result = await this.qitechAPI.getAccount(accountId);
      return {
        success: true,
        account: result
      };
    } catch (error) {
      console.error('Error getting account details:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create Pix transaction
  async createPixTransaction(pixData) {
    // Create the correct payload structure according to QITech documentation
    const transactionData = {
      amount: pixData.amount,
      currency: pixData.currency || 'BRL',
      recipient_document: pixData.recipient_document || pixData.payer?.document || pixData.payer?.document_number,
      description: pixData.description || 'Pix transaction',
      additional_information: pixData.additional_information || 'Payment via QI Credit platform'
    };

    try {
      const result = await this.qitechAPI.createPixTransaction(transactionData);
      return {
        success: true,
        transactionId: result.id,
        status: result.status,
        transaction: result
      };
    } catch (error) {
      console.error('Error creating Pix transaction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Issue boleto
  async issueBoleto(boletoData) {
    // Create the correct payload structure according to QITech documentation
    const boletoPayload = {
      amount: boletoData.amount,
      due_date: boletoData.due_date || boletoData.dueDate,
      payer_document: boletoData.payer_document || boletoData.payer?.document_number || boletoData.payer?.document,
      description: boletoData.description || 'Boleto payment',
      additional_information: boletoData.additional_information || boletoData.instructions || 'Payment via QI Credit platform'
    };

    try {
      const result = await this.qitechAPI.issueBoleto(boletoPayload);
      return {
        success: true,
        boletoId: result.id,
        barcode: result.barcode,
        url: result.url,
        boleto: result
      };
    } catch (error) {
      console.error('Error issuing boleto:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get boleto details
  async getBoletoDetails(boletoId) {
    try {
      const result = await this.qitechAPI.getBoleto(boletoId);
      return {
        success: true,
        boleto: result
      };
    } catch (error) {
      console.error('Error getting boleto details:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process Pix payment webhook
  async processPixWebhook(webhookData) {
    // Process incoming Pix payment webhook from QITech
    try {
      // Update local database with payment status
      // This would typically update payment records in your database
      console.log('Processing Pix webhook:', webhookData);
      
      // Example: update payment status in database
      // await database.updatePaymentStatus(webhookData.payment_id, webhookData.status);
      
      return {
        success: true,
        message: 'Pix webhook processed successfully'
      };
    } catch (error) {
      console.error('Error processing Pix webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new BankingAsAService();

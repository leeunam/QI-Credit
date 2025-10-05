const bankingAsAService = require('../services/bankingAsAService');

// Banking as a Service Controller
const createDigitalAccount = async (req, res) => {
  try {
    const { document, name, email, phone, userId, type = 'individual' } = req.body;
    
    // Validate required fields according to QITech API
    if (!document || !name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Document, name, and email are required' 
      });
    }
    
    // Prepare account data using correct field structure
    const accountData = {
      document,
      name,
      email,
      phone: phone || {
        area_code: phone?.area_code || '11',
        number: phone?.number || '999999999'
      },
      userId: userId || req.user?.id, // Use o userId do body ou do token de autenticação
      user_id: userId || req.user?.id, // Also set user_id for compatibility
      type
    };
    
    // Validate that we have a userId
    if (!accountData.userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }
    
    // Validate that user exists
    try {
      const userExists = await db('users').where('id', accountData.userId).first();
      if (!userExists) {
        return res.status(400).json({ 
          success: false, 
          error: 'User not found' 
        });
      }
    } catch (dbError) {
      console.error('Error checking user existence:', dbError);
      return res.status(500).json({ 
        success: false, 
        error: 'Error checking user existence' 
      });
    }
    
    // Create account with QITech BaaS
    const result = await bankingAsAService.createDigitalAccount(accountData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in createDigitalAccount controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAccountDetails = async (req, res) => {
  try {
    const { accountId } = req.params;
    
    // Validate input
    if (!accountId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Account ID is required' 
      });
    }
    
    // Get account details from QITech BaaS
    const result = await bankingAsAService.getAccountDetails(accountId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in getAccountDetails controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const createPixTransaction = async (req, res) => {
  try {
    const { amount, currency, recipient_document, description, additional_information } = req.body;
    
    // Validate required fields according to QITech API
    if (!amount || !recipient_document) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount and recipient document are required' 
      });
    }
    
    // Prepare transaction data using correct field structure
    const pixData = {
      amount,
      currency: currency || 'BRL',
      recipient_document,
      description: description || 'Pix transaction',
      additional_information: additional_information || 'Pix transaction via QI Credit platform'
    };
    
    // Create Pix transaction with QITech BaaS
    const result = await bankingAsAService.createPixTransaction(pixData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in createPixTransaction controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const issueBoleto = async (req, res) => {
  try {
    const { amount, due_date, payer_document, description, additional_information } = req.body;
    
    // Validate required fields according to QITech API
    if (!amount || !due_date || !payer_document) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount, due date, and payer document are required' 
      });
    }
    
    // Prepare boleto data using correct field structure
    const boletoData = {
      amount,
      due_date: due_date || dueDate,
      payer_document: payer_document || payer?.document_number,
      description: description || 'Boleto payment',
      additional_information: additional_information || 'Boleto via QI Credit platform'
    };
    
    // Issue boleto with QITech BaaS
    const result = await bankingAsAService.issueBoleto(boletoData);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in issueBoleto controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const getBoletoDetails = async (req, res) => {
  try {
    const { boletoId } = req.params;
    
    // Validate input
    if (!boletoId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Boleto ID is required' 
      });
    }
    
    // Get boleto details from QITech BaaS
    const result = await bankingAsAService.getBoletoDetails(boletoId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in getBoletoDetails controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Process Pix webhook
const processPixWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Process Pix webhook with the service
    const result = await bankingAsAService.processPixWebhook(webhookData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in processPixWebhook controller:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createDigitalAccount,
  getAccountDetails,
  createPixTransaction,
  issueBoleto,
  getBoletoDetails,
  processPixWebhook
};
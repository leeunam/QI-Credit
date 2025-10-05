const escrowService = require('../services/escrowService');
const { EscrowTransaction, Loan } = require('../../database/models/indexModel');

async function createEscrow(req, res) {
  try {
    const {
      escrowId,
      borrowerAddress,
      lenderAddress,
      arbitratorAddress,
      amount,
    } = req.body;

    // Validações básicas
    if (!escrowId || !borrowerAddress || !lenderAddress || !arbitratorAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: 'escrowId, borrowerAddress, lenderAddress, arbitratorAddress, amount are required',
      });
    }

    // Tentar usar model para validação se possível
    try {
      const transaction = new EscrowTransaction({
        loan_id: escrowId, // Usar escrowId como loan_id temporariamente
        from_user_id: lenderAddress,
        to_user_id: borrowerAddress,
        amount,
        transaction_type: 'DEPOSIT'
      });

      const validation = transaction.validate();
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Transaction validation failed',
          details: validation.errors
        });
      }
    } catch (modelError) {
      // Se o model não funcionar, continuar com validação básica
      console.log('Model validation skipped:', modelError.message);
    }

    // Usar service existente
    const result = await escrowService.createEscrow({
      escrowId,
      borrowerAddress,
      lenderAddress,
      arbitratorAddress,
      amount,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error creating escrow:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function releaseEscrow(req, res) {
  try {
    const { escrowId } = req.params;
    const result = await escrowService.releaseEscrow(escrowId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (err) {
    console.error('releaseEscrow error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function refundEscrow(req, res) {
  try {
    const { escrowId } = req.params;
    const result = await escrowService.refundEscrow(escrowId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (err) {
    console.error('refundEscrow error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getEscrowStatus(req, res) {
  try {
    const { escrowId } = req.params;
    const result = await escrowService.getEscrowStatus(escrowId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (err) {
    console.error('getEscrowStatus error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function listEscrowEvents(req, res) {
  try {
    const { escrowId } = req.params;
    const result = await escrowService.listEscrowEvents(escrowId);
    res.json(result);
  } catch (err) {
    console.error('listEscrowEvents error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  createEscrow,
  releaseEscrow,
  refundEscrow,
  getEscrowStatus,
  listEscrowEvents,
};
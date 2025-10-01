// Escrow Controller
const escrowService = require('../services/escrowService');

const createEscrow = async (req, res) => {
  try {
    const { borrowerId, lenderId, loanId, amount, terms } = req.body;
    
    // Validate input
    if (!borrowerId || !lenderId || !loanId || !amount) {
      return res.status(400).json({ 
        error: 'All fields are required: borrowerId, lenderId, loanId, amount' 
      });
    }
    
    // Create escrow
    const escrow = await escrowService.createEscrow({
      borrowerId,
      lenderId,
      loanId,
      amount,
      terms
    });
    
    res.status(201).json({
      message: 'Escrow created successfully',
      escrowId: escrow.id,
      status: escrow.status,
      amount: escrow.amount
    });
  } catch (error) {
    console.error('Error creating escrow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const releaseFunds = async (req, res) => {
  try {
    const { escrowId, authorizedBy } = req.body;
    
    // Validate input
    if (!escrowId || !authorizedBy) {
      return res.status(400).json({ 
        error: 'Escrow ID and authorizedBy are required' 
      });
    }
    
    // Release funds
    const result = await escrowService.releaseFunds(escrowId, authorizedBy);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error releasing funds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refundFunds = async (req, res) => {
  try {
    const { escrowId, reason } = req.body;
    
    // Validate input
    if (!escrowId) {
      return res.status(400).json({ 
        error: 'Escrow ID is required' 
      });
    }
    
    // Refund funds
    const result = await escrowService.refundFunds(escrowId, reason);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error refunding funds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getEscrowDetails = async (req, res) => {
  try {
    const { escrowId } = req.params;
    
    // Validate input
    if (!escrowId) {
      return res.status(400).json({ error: 'Escrow ID is required' });
    }
    
    // Get escrow details
    const escrow = await escrowService.getEscrowDetails(escrowId);
    
    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }
    
    res.status(200).json(escrow);
  } catch (error) {
    console.error('Error getting escrow details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getEscrowStatus = async (req, res) => {
  try {
    const { escrowId } = req.params;
    
    // Validate input
    if (!escrowId) {
      return res.status(400).json({ error: 'Escrow ID is required' });
    }
    
    // Get escrow status
    const status = await escrowService.getEscrowStatus(escrowId);
    
    res.status(200).json({ escrowId, status });
  } catch (error) {
    console.error('Error getting escrow status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createEscrow,
  releaseFunds,
  refundFunds,
  getEscrowDetails,
  getEscrowStatus
};
// Wallet Controller
const walletService = require('../services/walletService');

const getWalletDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get wallet details
    const wallet = await walletService.getWalletDetails(userId);
    
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    
    res.status(200).json(wallet);
  } catch (error) {
    console.error('Error getting wallet details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get balance
    const balance = await walletService.getBalance(userId);
    
    res.status(200).json({ userId, balance });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const transferFunds = async (req, res) => {
  try {
    const { fromUserId, toUserId, amount, description } = req.body;
    
    // Validate input
    if (!fromUserId || !toUserId || !amount) {
      return res.status(400).json({ 
        error: 'From user ID, to user ID, and amount are required' 
      });
    }
    
    // Perform transfer
    const result = await walletService.transferFunds({
      fromUserId,
      toUserId,
      amount,
      description
    });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error transferring funds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const depositFunds = async (req, res) => {
  try {
    const { userId, amount, source } = req.body;
    
    // Validate input
    if (!userId || !amount) {
      return res.status(400).json({ 
        error: 'User ID and amount are required' 
      });
    }
    
    // Perform deposit
    const result = await walletService.depositFunds({
      userId,
      amount,
      source
    });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error depositing funds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const withdrawFunds = async (req, res) => {
  try {
    const { userId, amount, destination } = req.body;
    
    // Validate input
    if (!userId || !amount) {
      return res.status(400).json({ 
        error: 'User ID and amount are required' 
      });
    }
    
    // Perform withdrawal
    const result = await walletService.withdrawFunds({
      userId,
      amount,
      destination
    });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get transaction history
    const history = await walletService.getTransactionHistory(userId);
    
    res.status(200).json({ userId, history });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getWalletDetails,
  getBalance,
  transferFunds,
  depositFunds,
  withdrawFunds,
  getTransactionHistory
};
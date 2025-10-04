const walletService = require('../services/walletService');
const { User, DigitalAccount } = require('../../../database/models');
const db = require('../../../backend/config/database'); // Adicionar import do db

const getWalletDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    let wallet;
    
    try {
      const accountData = await db('digital_accounts').where('user_id', userId).first();
      
      if (accountData) {
        const account = new DigitalAccount(accountData);
        wallet = {
          ...account.toJSON(),
          isActive: account.isActive(),
          canTransact: account.canTransact(),
          isBlocked: account.isBlocked()
        };
      } else {
        wallet = await walletService.getWalletDetails(userId);
      }
    } catch (modelError) {
      console.log('Using fallback wallet service:', modelError.message);
      wallet = await walletService.getWalletDetails(userId);
    }
    
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
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
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
    
    if (!fromUserId || !toUserId || !amount) {
      return res.status(400).json({ 
        error: 'From user ID, to user ID, and amount are required' 
      });
    }
    
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
    
    if (!userId || !amount) {
      return res.status(400).json({ 
        error: 'User ID and amount are required' 
      });
    }
    
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
    
    if (!userId || !amount) {
      return res.status(400).json({ 
        error: 'User ID and amount are required' 
      });
    }
    
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
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
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
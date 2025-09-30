// Wallet Service
// This service handles the business logic for wallet operations

// Mock data store for demonstration
let wallets = {};
let transactions = [];

const getWalletDetails = async (userId) => {
  // In a real application, this would fetch from the database
  // and potentially sync with the blockchain
  
  if (!wallets[userId]) {
    // Create wallet if it doesn't exist
    wallets[userId] = {
      userId,
      address: generateWalletAddress(userId),
      balance: 0,
      createdAt: new Date(),
      blockchainSynced: true
    };
  }
  
  return wallets[userId];
};

const getBalance = async (userId) => {
  const wallet = await getWalletDetails(userId);
  return wallet.balance;
};

const transferFunds = async (transferData) => {
  const { fromUserId, toUserId, amount, description } = transferData;
  
  // Validate amounts
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
  // Get wallets
  const fromWallet = await getWalletDetails(fromUserId);
  const toWallet = await getWalletDetails(toUserId);
  
  // Check balance
  if (fromWallet.balance < amount) {
    throw new Error('Insufficient funds');
  }
  
  // Perform transfer
  fromWallet.balance -= amount;
  toWallet.balance += amount;
  
  // Create transaction record
  const transaction = {
    id: `tx_${Date.now()}`,
    type: 'TRANSFER',
    from: fromUserId,
    to: toUserId,
    amount,
    description,
    timestamp: new Date(),
    status: 'COMPLETED'
  };
  
  transactions.push(transaction);
  
  return {
    transactionId: transaction.id,
    status: transaction.status,
    message: 'Transfer completed successfully',
    fromBalance: fromWallet.balance,
    toBalance: toWallet.balance
  };
};

const depositFunds = async (depositData) => {
  const { userId, amount, source } = depositData;
  
  // Validate amounts
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
  // Get wallet
  const wallet = await getWalletDetails(userId);
  
  // Perform deposit
  wallet.balance += amount;
  
  // Create transaction record
  const transaction = {
    id: `tx_${Date.now()}`,
    type: 'DEPOSIT',
    userId,
    amount,
    source,
    timestamp: new Date(),
    status: 'COMPLETED'
  };
  
  transactions.push(transaction);
  
  return {
    transactionId: transaction.id,
    status: transaction.status,
    message: 'Deposit completed successfully',
    newBalance: wallet.balance
  };
};

const withdrawFunds = async (withdrawalData) => {
  const { userId, amount, destination } = withdrawalData;
  
  // Validate amounts
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
  // Get wallet
  const wallet = await getWalletDetails(userId);
  
  // Check balance
  if (wallet.balance < amount) {
    throw new Error('Insufficient funds');
  }
  
  // Perform withdrawal
  wallet.balance -= amount;
  
  // Create transaction record
  const transaction = {
    id: `tx_${Date.now()}`,
    type: 'WITHDRAWAL',
    userId,
    amount,
    destination,
    timestamp: new Date(),
    status: 'COMPLETED'
  };
  
  transactions.push(transaction);
  
  return {
    transactionId: transaction.id,
    status: transaction.status,
    message: 'Withdrawal completed successfully',
    newBalance: wallet.balance
  };
};

const getTransactionHistory = async (userId) => {
  // Filter transactions for the user
  const userTransactions = transactions.filter(tx => 
    tx.from === userId || tx.to === userId || tx.userId === userId
  );
  
  // Sort by timestamp (newest first)
  userTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return userTransactions;
};

// Helper function to generate wallet address
const generateWalletAddress = (userId) => {
  // In a real application, this would generate a proper blockchain wallet address
  return `wallet_${userId}_${Date.now()}`;
};

module.exports = {
  getWalletDetails,
  getBalance,
  transferFunds,
  depositFunds,
  withdrawFunds,
  getTransactionHistory
};
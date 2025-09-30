// Wallet API routes
const express = require('express');
const router = express.Router();
const walletController = require('./controllers/walletController');

// Get wallet details
router.get('/:userId', walletController.getWalletDetails);

// Get wallet balance
router.get('/balance/:userId', walletController.getBalance);

// Transfer funds
router.post('/transfer', walletController.transferFunds);

// Deposit funds
router.post('/deposit', walletController.depositFunds);

// Withdraw funds
router.post('/withdraw', walletController.withdrawFunds);

// Get transaction history
router.get('/history/:userId', walletController.getTransactionHistory);

module.exports = router;
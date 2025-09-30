const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');

// Get wallet balance
router.get('/wallet/balance', async (req, res) => {
  try {
    const result = await blockchainService.getWalletBalance();
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in get wallet balance route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deposit to escrow
router.post('/escrow/deposit', async (req, res) => {
  try {
    const { escrowId, borrowerAddress, lenderAddress, arbitratorAddress, amount } = req.body;
    const result = await blockchainService.depositToEscrow(
      escrowId, 
      borrowerAddress, 
      lenderAddress, 
      arbitratorAddress, 
      amount
    );
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in deposit to escrow route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Release funds from escrow
router.post('/escrow/:address/release', async (req, res) => {
  try {
    const { address } = req.params;
    const result = await blockchainService.releaseFundsFromEscrow(address);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in release funds from escrow route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Refund funds from escrow
router.post('/escrow/:address/refund', async (req, res) => {
  try {
    const { address } = req.params;
    const result = await blockchainService.refundFundsFromEscrow(address);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in refund funds from escrow route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get escrow status
router.get('/escrow/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const result = await blockchainService.getEscrowStatus(address);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in get escrow status route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mint tokens
router.post('/tokens/mint', async (req, res) => {
  try {
    const { toAddress, amount } = req.body;
    const result = await blockchainService.mintTokens(toAddress, amount);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in mint tokens route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transfer tokens
router.post('/tokens/transfer', async (req, res) => {
  try {
    const { toAddress, amount } = req.body;
    const result = await blockchainService.transferTokens(toAddress, amount);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in transfer tokens route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get token balance
router.get('/tokens/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const result = await blockchainService.getTokenBalance(address);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in get token balance route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction details
router.get('/transactions/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const result = await blockchainService.getTransactionDetails(txHash);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Error in get transaction details route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
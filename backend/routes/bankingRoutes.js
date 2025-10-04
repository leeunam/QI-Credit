const express = require('express');
const router = express.Router();
const bankingAsAService = require('../services/bankingAsAService');

// Create digital account
router.post('/accounts', async (req, res) => {
  try {
    const result = await bankingAsAService.createDigitalAccount(req.body);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in create digital account route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get account details
router.get('/accounts/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const result = await bankingAsAService.getAccountDetails(accountId);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in get account details route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create Pix transaction
router.post('/pix', async (req, res) => {
  try {
    const result = await bankingAsAService.createPixTransaction(req.body);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in create Pix transaction route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Issue boleto
router.post('/boletos', async (req, res) => {
  try {
    const result = await bankingAsAService.issueBoleto(req.body);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in issue boleto route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get boleto details
router.get('/boletos/:boletoId', async (req, res) => {
  try {
    const { boletoId } = req.params;
    const result = await bankingAsAService.getBoletoDetails(boletoId);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in get boleto details route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
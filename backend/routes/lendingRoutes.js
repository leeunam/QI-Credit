const express = require('express');
const router = express.Router();
const lendingAsAService = require('../services/lendingAsAService');

// Create credit contract
router.post('/contracts', async (req, res) => {
  try {
    const result = await lendingAsAService.createCreditContract(req.body);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in create credit contract route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger contract signature
router.post('/contracts/:contractId/sign', async (req, res) => {
  try {
    const { contractId } = req.params;
    const result = await lendingAsAService.triggerContractSignature(contractId);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in trigger contract signature route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get contract payments
router.get('/contracts/:contractId/payments', async (req, res) => {
  try {
    const { contractId } = req.params;
    const result = await lendingAsAService.getContractPayments(contractId);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error in get contract payments route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Notify contract payment
router.post('/contracts/:contractId/payments', async (req, res) => {
  try {
    const { contractId } = req.params;
    const result = await lendingAsAService.notifyContractPayment(contractId, req.body);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in notify contract payment route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Assign contract to funds
router.post('/contracts/:contractId/assign', async (req, res) => {
  try {
    const { contractId } = req.params;
    const result = await lendingAsAService.assignContractToFunds(contractId, req.body);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in assign contract to funds route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Calculate loan schedule
router.post('/calculate-schedule', (req, res) => {
  try {
    const { loanAmount, interestRate, term } = req.body;
    const result = lendingAsAService.calculateLoanSchedule(loanAmount, interestRate, term);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in calculate loan schedule route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
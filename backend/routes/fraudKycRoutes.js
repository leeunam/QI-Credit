const express = require('express');
const router = express.Router();
const fraudKycService = require('../services/fraudKycService');
const { authenticateToken } = require('../middlewares/auth');

// Device scan for fraud prevention
router.post('/device-scan', authenticateToken, async (req, res) => {
  try {
    const deviceData = req.body;
    
    const result = await fraudKycService.performDeviceScan(deviceData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in device scan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Face verification for KYC
router.post('/face-verify', async (req, res) => {
  try {
    const verificationData = req.body;
    
    const result = await fraudKycService.performFaceVerification(verificationData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in face verification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Antifraud score check
router.post('/score', async (req, res) => {
  try {
    const userData = req.body;
    
    const result = await fraudKycService.getAntifraudScore(userData);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in antifraud scoring:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Open Finance data retrieval
router.get('/open-finance/:userId/:dataType?', async (req, res) => {
  try {
    const { userId, dataType = 'accounts' } = req.params;
    
    const result = await fraudKycService.getOpenFinanceData(userId, dataType);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in Open Finance data retrieval:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Full KYC verification
router.post('/kyc/verify', authenticateToken, async (req, res) => {
  try {
    const userData = {
      ...req.body,
      userId: req.user.id, // Extract user ID from auth token
      id: req.user.id,      // Some services might use 'id' instead
    };

    const result = await fraudKycService.performFullKYC(userData);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in full KYC verification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const creditAnalysisService = require('../services/creditAnalysisService');

// Submit credit analysis for individual
router.post('/individual', async (req, res) => {
  try {
    const result = await creditAnalysisService.submitIndividualCreditAnalysis(req.body);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in individual credit analysis route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit credit analysis for business
router.post('/business', async (req, res) => {
  try {
    const result = await creditAnalysisService.submitBusinessCreditAnalysis(req.body);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in business credit analysis route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get credit score for user
router.get('/score/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { entityType = 'natural_person' } = req.query;
    
    const result = await creditAnalysisService.getCreditScore(userId, entityType);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in get credit score route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update credit analysis status
router.put('/status/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    const { status, entityType = 'natural_person' } = req.body;
    
    const result = await creditAnalysisService.updateCreditAnalysisStatus(analysisId, status, entityType);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error in update credit analysis status route:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
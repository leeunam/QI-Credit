// Credit Analysis API routes
const express = require('express');
const router = express.Router();
const creditAnalysisController = require('./controllers/creditAnalysisController');

// Get credit score for a user
router.get('/score/:userId', creditAnalysisController.getCreditScore);

// Analyze creditworthiness for a loan application
router.post('/analyze', creditAnalysisController.analyzeCreditworthiness);

// Get credit history for a user
router.get('/history/:userId', creditAnalysisController.getCreditHistory);

module.exports = router;
// Credit Analysis Controller
const creditAnalysisService = require('../../../backend/services/creditAnalysisService'); // Use main service with mock capability

const getCreditScore = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get credit score from service (using the main service method)
    const result = await creditAnalysisService.getCreditScore(userId);
    
    if (result.success !== false) { // If it's not a failure result from the service
      res.status(200).json({
        userId,
        creditScore: result.creditScore,
        riskLevel: result.riskLevel,
        lastUpdated: result.lastUpdated
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error getting credit score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const analyzeCreditworthiness = async (req, res) => {
  try {
    const { userId, loanAmount, loanTerm } = req.body;
    
    // Validate input
    if (!userId || !loanAmount || !loanTerm) {
      return res.status(400).json({ error: 'User ID, loan amount, and loan term are required' });
    }
    
    // For our QI Tech integration, we'll submit an individual credit analysis request
    const userData = {
      id: userId,
      document: userId, // Using userId as document for mock
      name: `User ${userId}`, // Mock name
      email: `${userId}@example.com`, // Mock email
      monthly_income: loanAmount * 3, // Mock income as 3x loan amount
      loanAmount,
      term: loanTerm,
      financial: {
        amount: loanAmount,
        number_of_installments: loanTerm
      }
    };
    
    // Perform credit analysis through the main service
    const result = await creditAnalysisService.submitIndividualCreditAnalysis(userData);
    
    if (result.success) {
      res.status(200).json({
        userId,
        loanAmount,
        loanTerm,
        approved: result.status === 'automatically_approved' || result.status === 'manually_approved',
        status: result.status,
        riskAssessment: result.status,
        analysisId: result.analysisId,
        analysisDetails: result.analysis
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error analyzing creditworthiness:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCreditHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // For now, we'll return a mock credit history
    // In a real implementation, this would come from a database or credit bureau
    const creditHistory = [
      { 
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), 
        type: 'loan', 
        amount: 100000, 
        status: 'repaid',
        description: 'Previous personal loan'
      },
      { 
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), 
        type: 'credit_card', 
        amount: 50000, 
        status: 'closed',
        description: 'Credit card account'
      }
    ];
    
    res.status(200).json({
      userId,
      creditHistory
    });
  } catch (error) {
    console.error('Error getting credit history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCreditScore,
  analyzeCreditworthiness,
  getCreditHistory
};
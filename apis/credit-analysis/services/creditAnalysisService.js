// Credit Analysis Service
// This service handles the business logic for credit analysis

// Mock data for demonstration
const mockCreditScores = {
  'user1': 780,
  'user2': 650,
  'user3': 580,
};

const mockCreditHistory = {
  'user1': [
    { date: '2023-01-15', type: 'loan', amount: 10000, status: 'repaid' },
    { date: '2023-06-20', type: 'loan', amount: 5000, status: 'repaid' }
  ],
  'user2': [
    { date: '2023-02-10', type: 'loan', amount: 8000, status: 'repaid' },
    { date: '2023-08-05', type: 'loan', amount: 3000, status: 'current' }
  ],
  'user3': [
    { date: '2023-03-01', type: 'loan', amount: 2000, status: 'overdue' }
  ]
};

const calculateCreditScore = async (userId) => {
  // In a real application, this would connect to a credit scoring API
  // or analyze financial data from various sources
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return mock score or default to 600
      resolve(mockCreditScores[userId] || 600);
    }, 100);
  });
};

const analyzeCreditworthiness = async (userId, loanAmount, loanTerm) => {
  // In a real application, this would perform complex analysis
  // considering credit score, financial history, debt-to-income ratio, etc.
  
  const creditScore = await calculateCreditScore(userId);
  const creditHistory = await getCreditHistory(userId);
  
  // Determine approval based on mock criteria
  let approved = creditScore >= 650;
  let interestRate = 0.15; // Default interest rate
  
  if (creditScore >= 750) {
    interestRate = 0.08;
  } else if (creditScore >= 650) {
    interestRate = 0.12;
  } else if (creditScore >= 550) {
    interestRate = 0.18;
  } else {
    approved = false;
  }
  
  // Adjust for loan amount and term
  if (loanAmount > 100000) approved = false;  // Large loans not approved for low scores
  if (loanTerm > 60) approved = false;  // Long terms not approved for low scores
  
  return {
    userId,
    loanAmount,
    loanTerm,
    approved,
    creditScore,
    interestRate: approved ? interestRate : null,
    riskAssessment: approved ? 'APPROVED' : 'REJECTED',
    repaymentCapacity: calculateRepaymentCapacity(loanAmount, loanTerm, interestRate)
  };
};

const getCreditHistory = async (userId) => {
  // In a real application, this would fetch from a database or credit bureau API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return mock history or empty array
      resolve(mockCreditHistory[userId] || []);
    }, 100);
  });
};

const calculateRepaymentCapacity = (loanAmount, loanTerm, interestRate) => {
  // Simple calculation for monthly payment
  const monthlyPayment = (loanAmount * interestRate / 12) / (1 - Math.pow(1 + interestRate / 12, -loanTerm));
  return {
    monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
    totalRepayment: parseFloat((monthlyPayment * loanTerm).toFixed(2)),
    totalInterest: parseFloat(((monthlyPayment * loanTerm) - loanAmount).toFixed(2))
  };
};

module.exports = {
  calculateCreditScore,
  analyzeCreditworthiness,
  getCreditHistory
};
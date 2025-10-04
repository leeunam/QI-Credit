// tests/unit/creditAnalysisService.test.js
const creditAnalysisService = require('../../apis/credit-analysis/services/creditAnalysisService');

describe('Credit Analysis Service', () => {
  test('should calculate a credit score for a valid user', async () => {
    const userId = 'user1';
    const score = await creditAnalysisService.calculateCreditScore(userId);
    
    expect(score).toBeGreaterThanOrEqual(300);
    expect(score).toBeLessThanOrEqual(850);
  });

  test('should analyze creditworthiness and return appropriate results', async () => {
    const result = await creditAnalysisService.analyzeCreditworthiness(
      'user1', // userId
      10000,   // loanAmount
      24       // loanTerm
    );
    
    expect(result).toHaveProperty('userId');
    expect(result).toHaveProperty('approved');
    expect(result).toHaveProperty('interestRate');
  });

  test('should return credit history for a user', async () => {
    const history = await creditAnalysisService.getCreditHistory('user1');
    
    expect(Array.isArray(history)).toBe(true);
    if (history.length > 0) {
      expect(history[0]).toHaveProperty('date');
      expect(history[0]).toHaveProperty('type');
      expect(history[0]).toHaveProperty('amount');
      expect(history[0]).toHaveProperty('status');
    }
  });
});
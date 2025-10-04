const axios = require('axios');
const config = require('../config/config');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const KycVerification = require('../../database/models/kycverificationModel');

// Determine if we're running in mock mode
const isMockMode = config.QITECH_MOCK_MODE === 'true';

class QitechFraudKycAPI {
  constructor(baseURL, apiKey) {
    this.apiKey = apiKey || config.QITECH_API_KEY;
    this.baseURL = baseURL || config.QITECH_FRAUD_URL;
    
    // Only initialize axios client if not in mock mode
    if (!isMockMode) {
      this.client = axios.create({
        baseURL: this.baseURL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey, // QITech uses API key directly
          'X-Request-ID': this.generateRequestId()
        }
      });
    }
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Device scan for fraud prevention
  async deviceScan(deviceData) {
    if (isMockMode) {
      // Simulate device scan with mock data
      const mockResponse = {
        id: `mock_device_scan_${Date.now()}`,
        scan_id: `scan_${Date.now()}`,
        status: 'completed',
        risk_level: this.determineDeviceRisk(deviceData),
        score: Math.floor(Math.random() * (100 - 1 + 1)) + 1, // Random score between 1-100
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        device_info: deviceData,
        recommendations: this.generateDeviceRecommendations(deviceData),
        ip_address: deviceData.ip_address || '192.168.1.1',
        fingerprint: deviceData.fingerprint || `mock_fingerprint_${Date.now()}`
      };
      console.log('Mock Fraud/KYC API: Device Scan', deviceData);
      return mockResponse;
    } else {
      try {
        // In real implementation, this would be a FormData post
        const response = await this.client.post('/device-scan', deviceData);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Face verification for KYC
  async faceVerify(verificationData) {
    if (isMockMode) {
      // Simulate face verification with mock data
      const mockResponse = {
        id: `mock_face_verify_${Date.now()}`,
        verification_id: `verify_${Date.now()}`,
        status: 'completed',
        result: this.determineFaceVerificationResult(verificationData),
        confidence_score: Math.floor(Math.random() * (99 - 60 + 1)) + 60, // Random score between 60-99
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        document_number: verificationData.document_number || verificationData.document,
        verification_method: 'facial_recognition',
        recommendations: this.generateFaceVerificationRecommendations(verificationData),
        image_metadata: {
          front_image_id: `img_front_${Date.now()}`,
          verification_image_id: `img_verify_${Date.now()}`,
          comparison_result: 'match'
        }
      };
      console.log('Mock Fraud/KYC API: Face Verify', verificationData);
      return mockResponse;
    } else {
      try {
        // In real implementation, this would be a FormData post with images
        const response = await this.client.post('/face-verify', verificationData);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Antifraud score check
  async antifraudScore(userData) {
    if (isMockMode) {
      // Simulate antifraud score with mock data
      const mockResponse = {
        id: `mock_antifraud_${Date.now()}`,
        score_id: `score_${Date.now()}`,
        score: this.calculateAntifraudScore(userData),
        risk_level: this.determineRiskLevel(userData),
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        document: userData.document || userData.document_number,
        ip_address: userData.ip || '192.168.1.1',
        transaction_data: userData.transaction_data || {},
        recommendations: this.generateAntifraudRecommendations(userData),
        score_breakdown: {
          document_risk: Math.floor(Math.random() * 30),
          location_risk: Math.floor(Math.random() * 30),
          behavior_risk: Math.floor(Math.random() * 40),
          device_risk: Math.floor(Math.random() * 30)
        },
        policy: {
          approved: this.shouldApproveBasedOnScore(userData),
          max_amount: this.calculateMaxAmountForUser(userData),
          additional_verification_required: Math.random() > 0.7 // 30% chance of additional verification
        }
      };
      console.log('Mock Fraud/KYC API: Antifraud Score', userData);
      return mockResponse;
    } else {
      try {
        const response = await this.client.post('/score', userData);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Open Finance data retrieval
  async getOpenFinanceData(userId, dataType = 'accounts') {
    if (isMockMode) {
      // Simulate Open Finance data retrieval with mock data
      let mockResponse;
      
      if (dataType === 'accounts') {
        mockResponse = {
          id: `mock_openfinance_${Date.now()}`,
          user_id: userId,
          accounts: [
            {
              account_id: `acc_${Date.now()}_1`,
              bank_name: 'Banco Mock',
              bank_code: '000',
              account_number: '12345678',
              account_digit: '9',
              account_type: 'checking',
              balance: Math.floor(Math.random() * 5000000), // Random balance in cents
              currency: 'BRL',
              status: 'active',
              created_at: new Date().toISOString()
            },
            {
              account_id: `acc_${Date.now()}_2`,
              bank_name: 'Banco Teste',
              bank_code: '001',
              account_number: '87654321',
              account_digit: '5',
              account_type: 'savings',
              balance: Math.floor(Math.random() * 3000000), // Random balance in cents
              currency: 'BRL',
              status: 'active',
              created_at: new Date().toISOString()
            }
          ],
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } else if (dataType === 'transactions') {
        mockResponse = {
          id: `mock_openfinance_${Date.now()}`,
          user_id: userId,
          transactions: [
            {
              transaction_id: `trans_${Date.now()}_1`,
              account_id: `acc_${Date.now()}_1`,
              description: 'Supermercado Exemplo',
              amount: -25000, // in cents, negative for expense
              currency: 'BRL',
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              type: 'debit',
              category: 'food'
            },
            {
              transaction_id: `trans_${Date.now()}_2`,
              account_id: `acc_${Date.now()}_1`,
              description: 'Salário',
              amount: 500000, // in cents, positive for income
              currency: 'BRL',
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              type: 'credit',
              category: 'income'
            },
            {
              transaction_id: `trans_${Date.now()}_3`,
              account_id: `acc_${Date.now()}_1`,
              description: 'Farmácia',
              amount: -8500, // in cents
              currency: 'BRL',
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              type: 'debit',
              category: 'health'
            }
          ],
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      console.log(`Mock Fraud/KYC API: Open Finance ${dataType}`, {userId, dataType});
      return mockResponse;
    } else {
      try {
        const response = await this.client.get(`/customers/${userId}/${dataType}`);
        return response.data;
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  // Helper method to determine device risk
  determineDeviceRisk(deviceData) {
    // Simulate risk based on various factors
    const userAgent = deviceData?.user_agent || '';
    const ipAddress = deviceData?.ip_address || '';
    
    // Higher risk if using mobile app (simplified logic)
    if (userAgent.toLowerCase().includes('mobile')) return 'MEDIUM';
    if (ipAddress.includes('proxy') || ipAddress.includes('vpn')) return 'HIGH';
    
    // Randomly assign risk for demonstration
    const risks = ['LOW', 'MEDIUM', 'HIGH'];
    return risks[Math.floor(Math.random() * risks.length)];
  }

  // Helper method to generate device recommendations
  generateDeviceRecommendations(deviceData) {
    const recommendations = [];
    
    if (this.determineDeviceRisk(deviceData) === 'HIGH') {
      recommendations.push('Request additional verification');
      recommendations.push('Monitor account activity');
    } else {
      recommendations.push('Standard verification process');
    }
    
    return recommendations;
  }

  // Helper method to determine face verification result
  determineFaceVerificationResult(verificationData) {
    // For demo purposes, 80% success rate
    return Math.random() > 0.2 ? 'approved' : 'rejected';
  }

  // Helper method to generate face verification recommendations
  generateFaceVerificationRecommendations(verificationData) {
    const recommendations = [];
    
    if (this.determineFaceVerificationResult(verificationData) === 'approved') {
      recommendations.push('Document verified successfully');
      recommendations.push('Biometric verification passed');
    } else {
      recommendations.push('Document verification failed');
      recommendations.push('Request new photos');
    }
    
    return recommendations;
  }

  // Helper method to calculate antifraud score
  calculateAntifraudScore(userData) {
    // Base score between 0-1000
    let score = 500;
    
    // Adjust based on various factors
    const document = userData.document || userData.document_number;
    if (document && document.length > 10) { // Assume valid document format
      score += Math.floor(Math.random() * 100);
    }
    
    const income = parseInt(userData.monthly_income) || 0;
    if (income > 1000000) { // More than 10k BRL monthly
      score += 100;
    } else if (income > 500000) { // More than 5k BRL monthly
      score += 50;
    }
    
    // Cap at 1000
    return Math.min(1000, score);
  }

  // Helper method to determine risk level based on score
  determineRiskLevel(userData) {
    const score = this.calculateAntifraudScore(userData);
    
    if (score >= 800) return 'LOW';
    if (score >= 600) return 'MEDIUM';
    return 'HIGH';
  }

  // Helper method to generate antifraud recommendations
  generateAntifraudRecommendations(userData) {
    const recommendations = [];
    const riskLevel = this.determineRiskLevel(userData);
    
    if (riskLevel === 'HIGH') {
      recommendations.push('Manual review required');
      recommendations.push('Additional documentation needed');
      recommendations.push('Limit transaction amount');
    } else if (riskLevel === 'MEDIUM') {
      recommendations.push('Monitor account activity');
      recommendations.push('Request additional verification');
    } else {
      recommendations.push('Standard processing');
    }
    
    return recommendations;
  }

  // Helper method to determine if user should be approved
  shouldApproveBasedOnScore(userData) {
    const score = this.calculateAntifraudScore(userData);
    return score >= 600; // Approve if score is 600 or above
  }

  // Helper method to calculate max amount for user based on profile
  calculateMaxAmountForUser(userData) {
    const income = parseInt(userData.monthly_income) || 0;
    
    // Max amount is typically 10x monthly income for good profiles
    if (this.determineRiskLevel(userData) === 'LOW') {
      return income * 10;
    } else if (this.determineRiskLevel(userData) === 'MEDIUM') {
      return income * 5;
    } else {
      return income * 2; // Conservative for high risk
    }
  }

  handleError(error) {
    if (isMockMode) {
      console.error('Mock mode - would have made Fraud/KYC API request but skipped due to mock mode');
      return {
        id: `mock_error_${Date.now()}`,
        error: error.message || 'Mock API error',
        status: 'error'
      };
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('QITech Fraud/KYC API Error:', error.response.status, error.response.data);
      throw new Error(`${error.response.status}: ${error.response.data.message || 'API request failed'}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('QITech Fraud/KYC API Request Error:', error.request);
      throw new Error('No response received from QITech Fraud/KYC API');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('QITech Fraud/KYC API Setup Error:', error.message);
      throw new Error(`QITech Fraud/KYC API setup error: ${error.message}`);
    }
  }
}

// Fraud and KYC Service
class FraudKycService {
  constructor() {
    this.qitechAPI = new QitechFraudKycAPI(
      config.QITECH_FRAUD_URL,
      config.QITECH_API_KEY
    );
  }

  // Perform device scan for fraud prevention
  async performDeviceScan(deviceData) {
    try {
      const result = await this.qitechAPI.deviceScan(deviceData);
      return {
        success: true,
        scanId: result.id,
        status: result.status,
        riskLevel: result.risk_level,
        recommendations: result.recommendations,
        scanResult: result
      };
    } catch (error) {
      console.error('Error in device scan:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Perform face verification for KYC
  async performFaceVerification(verificationData) {
    try {
      const result = await this.qitechAPI.faceVerify(verificationData);
      return {
        success: true,
        verificationId: result.id,
        status: result.status,
        result: result.result,
        confidenceScore: result.confidence_score,
        verificationResult: result
      };
    } catch (error) {
      console.error('Error in face verification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get antifraud score for user
  async getAntifraudScore(userData) {
    try {
      const result = await this.qitechAPI.antifraudScore(userData);
      return {
        success: true,
        scoreId: result.id,
        score: result.score,
        riskLevel: result.risk_level,
        status: result.status,
        recommendations: result.recommendations,
        scoreDetails: result
      };
    } catch (error) {
      console.error('Error in antifraud scoring:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get Open Finance data
  async getOpenFinanceData(userId, dataType = 'accounts') {
    try {
      const result = await this.qitechAPI.getOpenFinanceData(userId, dataType);
      return {
        success: true,
        userId,
        dataType,
        data: result,
        status: result.status
      };
    } catch (error) {
      console.error('Error in Open Finance data retrieval:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Perform full KYC verification
  async performFullKYC(userData) {
    const trx = await db.transaction();

    try {
      // Perform all required KYC checks
      const deviceScan = await this.performDeviceScan({
        document: userData.document,
        ip_address: userData.ip || '192.168.1.1',
        user_agent: userData.user_agent || 'Mock User Agent'
      });

      const fraudScore = await this.getAntifraudScore(userData);

      let faceVerification = null;
      if (userData.faceImage && userData.documentImage) {
        faceVerification = await this.performFaceVerification({
          document_number: userData.document,
          front_image: userData.documentImage,
          verification_image: userData.faceImage
        });
      }

      const overallStatus = this.determineOverallKycStatus(deviceScan, fraudScore, faceVerification);

      // Persist KYC verification to database
      const kycVerificationData = {
        id: uuidv4(),
        user_id: userData.id || userData.userId,
        status: overallStatus,
        document_type: userData.document_type || 'CPF',
        document_number: userData.document,
        verification_method: 'FULL_KYC',
        device_scan_result: JSON.stringify(deviceScan),
        fraud_score_result: JSON.stringify(fraudScore),
        face_verification_result: JSON.stringify(faceVerification),
        ip_address: userData.ip || '192.168.1.1',
        user_agent: userData.user_agent,
        verified_at: overallStatus === 'APPROVED' ? new Date() : null,
        created_at: new Date(),
        updated_at: new Date()
      };

      const [dbVerification] = await trx('kyc_verifications')
        .insert(kycVerificationData)
        .returning('*');

      await trx.commit();

      return {
        success: true,
        userId: userData.id || userData.userId,
        deviceScan,
        fraudScore,
        faceVerification,
        overallStatus,
        verificationDate: new Date().toISOString(),
        dbRecord: dbVerification
      };
    } catch (error) {
      await trx.rollback();
      console.error('Error in full KYC verification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper method to determine overall KYC status
  determineOverallKycStatus(deviceScan, fraudScore, faceVerification) {
    if (!deviceScan.success || deviceScan.scanResult?.risk_level === 'HIGH') return 'REJECTED';
    if (!fraudScore.success || fraudScore.scoreDetails?.risk_level === 'HIGH') return 'REJECTED';
    if (faceVerification && (!faceVerification.success || faceVerification.result !== 'approved')) return 'REJECTED';
    
    return 'APPROVED';
  }
}

module.exports = new FraudKycService();
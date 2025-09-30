// Onboarding Controller
const onboardingService = require('../services/onboardingService');
const fraudKycService = require('../../../backend/services/fraudKycService'); // Use main fraud/kyc service with mock capability

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      return res.status(400).json({ error: 'All fields are required: firstName, lastName, email, password, phoneNumber' });
    }
    
    // Register user
    const user = await onboardingService.registerUser({
      firstName,
      lastName,
      email,
      password,
      phoneNumber
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      userId: user.id,
      email: user.email
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyIdentity = async (req, res) => {
  try {
    const { userId, documentType, documentNumber, documentImage, faceImage, phoneNumber, email, firstName, lastName, birthDate } = req.body;
    
    // Validate input
    if (!userId || !documentType || !documentNumber || !documentImage) {
      return res.status(400).json({ 
        error: 'All fields are required: userId, documentType, documentNumber, documentImage' 
      });
    }
    
    // Prepare user data for full KYC verification
    const userData = {
      id: userId,
      document: documentNumber,
      document_type: documentType,
      faceImage,
      documentImage,
      phone: phoneNumber,
      email,
      firstName,
      lastName,
      birthDate,
      ip: req.ip || '127.0.0.1'
    };
    
    // Perform full KYC verification using the fraud/kyc service
    const verificationResult = await fraudKycService.performFullKYC(userData);
    
    if (verificationResult.success) {
      // Update local onboarding status based on KYC result
      const localVerificationResult = await onboardingService.verifyIdentity({
        userId,
        documentType,
        documentNumber,
        documentImage
      });
      
      res.status(200).json({
        ...localVerificationResult,
        kycResult: verificationResult,
        overallStatus: verificationResult.overallStatus
      });
    } else {
      res.status(400).json(verificationResult);
    }
  } catch (error) {
    console.error('Error verifying identity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const completeOnboarding = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Complete onboarding
    const result = await onboardingService.completeOnboarding(userId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getOnboardingStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate input
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get onboarding status
    const status = await onboardingService.getOnboardingStatus(userId);
    
    res.status(200).json({ userId, status });
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  registerUser,
  verifyIdentity,
  completeOnboarding,
  getOnboardingStatus
};
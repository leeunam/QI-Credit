// Onboarding Service
// This service handles the business logic for user onboarding

const db = require('../../../backend/config/database');
const bcrypt = require('bcrypt');

const registerUser = async (userData) => {
  // In a real application, this would hash the password, validate email, etc.
  // and store the user in a database
  
  // Check if user already exists
  const existingUser = await db('users').where('email', userData.email).first();
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
  
  // Hash password
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
  
  // Create user in database
  const [userId] = await db('users').insert({
    name: `${userData.firstName} ${userData.lastName}`,
    email: userData.email,
    phone: userData.phoneNumber,
    password: hashedPassword,
    created_at: new Date(),
    updated_at: new Date(),
    kyc_status: 'PENDING'  // Initial status
  });
  
  // Get the created user
  const user = await db('users').where('id', userId).first();
  
  return {
    id: user.id,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: user.email,
    phoneNumber: user.phone,
    createdAt: user.created_at,
    onboardingStatus: 'REGISTERED' // Initial status
  };
};

const verifyIdentity = async (verificationData) => {
  // In a real application, this would connect to an identity verification service
  // or perform OCR on the document image
  
  const { userId, documentType, documentNumber } = verificationData;
  
  // Check if user exists
  const user = await db('users').where('id', userId).first();
  if (!user) {
    throw new Error('User not found');
  }
  
  // Mock verification logic
  const isValid = validateDocument(documentNumber); // Simplified validation
  
  // In a real system, we'd also update kyc_verifications table
  const [verificationId] = await db('kyc_verifications').insert({
    user_id: userId,
    document_type: documentType,
    document_number: documentNumber,
    verification_status: isValid ? 'APPROVED' : 'REJECTED',
    created_at: new Date(),
    updated_at: new Date()
  });
  
  // Update user's KYC status based on verification result
  if (isValid) {
    await db('users').where('id', userId).update({
      kyc_status: 'IN_REVIEW',  // or 'APPROVED' if automatic
      updated_at: new Date()
    });
  }
  
  return {
    userId,
    verificationId,
    status: isValid ? 'VERIFIED' : 'FAILED',
    message: isValid ? 'Identity verified successfully' : 'Identity verification failed'
  };
};

const completeOnboarding = async (userId) => {
  // In a real application, this would perform final checks and 
  // complete the onboarding process
  
  // Check if user exists
  const user = await db('users').where('id', userId).first();
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update user status to completed
  await db('users').where('id', userId).update({
    kyc_status: 'APPROVED',
    updated_at: new Date()
  });
  
  return {
    userId,
    status: 'COMPLETED',
    message: 'Onboarding completed successfully',
    walletAddress: generateWalletAddress(userId) // Generate wallet for user
  };
};

const getOnboardingStatus = async (userId) => {
  // Check if user exists
  const user = await db('users').where('id', userId).first();
  if (!user) {
    throw new Error('User not found');
  }
  
  // Get KYC verification status
  const kycVerifications = await db('kyc_verifications')
    .where('user_id', userId)
    .select('*');
  
  const identityVerified = user.kyc_status === 'APPROVED';
  const documentsSubmitted = kycVerifications.length > 0;
  const onboardingComplete = user.kyc_status === 'APPROVED';
  
  return {
    userId,
    completed: onboardingComplete,
    status: user.kyc_status,
    identityVerified,
    documentsSubmitted,
    steps: [
      { step: 'registration', completed: true },
      { step: 'identity_verification', completed: identityVerified },
      { step: 'onboarding_completion', completed: onboardingComplete }
    ]
  };
};

// Helper function to validate documents (simplified for demo)
const validateDocument = (documentNumber) => {
  // In a real application, this would perform proper validation
  return documentNumber.length >= 6; // Simple check
};

// Helper function to generate wallet address
const generateWalletAddress = (userId) => {
  // In a real application, this would generate a proper blockchain wallet
  return `wallet_${userId.replace('user_', '')}_${Date.now()}`;
};

module.exports = {
  registerUser,
  verifyIdentity,
  completeOnboarding,
  getOnboardingStatus
};
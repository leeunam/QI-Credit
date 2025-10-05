// Onboarding Controller
// Atualizado para incluir mais funcionalidades de onboarding

const onboardingService = require('../services/onboardingService');
const fraudKycService = require('../../../backend/services/fraudKycService'); // Use main fraud/kyc service with mock capability
const db = require('../../../backend/config/database');

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
        success: false,
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
      res.status(200).json({
        success: true,
        data: {
          userId,
          verificationId: verificationResult.verificationId,
          status: verificationResult.status,
          verified: verificationResult.verified || true,
          overallStatus: verificationResult.overallStatus
        }
      });
    } else {
      res.status(400).json(verificationResult);
    }
  } catch (error) {
    console.error('Error verifying identity:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const completeOnboarding = async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // Update user KYC status in database
    await db('users').where('id', userId).update({
      kyc_status: 'APPROVED',
      updated_at: new Date()
    });

    res.status(200).json({
      success: true,
      data: {
        userId,
        status: 'COMPLETED',
        message: 'Onboarding completed successfully'
      }
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const getOnboardingStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate input
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // Log para debugging
    console.log('🔍 Buscando status para userId:', userId);

    const user = await db('users').where('id', userId).first();

    if (!user) {
      console.log('❌ Usuário não encontrado para userId:', userId);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    console.log('✅ Usuário encontrado:', user.email);

    // Check KYC verifications
    const kycVerifications = await db('kyc_verifications')
      .where('user_id', userId)
      .select('*');

    const isComplete = user.kyc_status === 'APPROVED';

    res.status(200).json({
      success: true,
      data: {
        userId,
        status: {
          isComplete,
          kycStatus: user.kyc_status || 'PENDING',
          hasDocuments: kycVerifications.length > 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Nova rota para atualizar o status de KYC
const updateKycStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    // Validate input
    if (!userId || !status) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and status are required' 
      });
    }

    // Valid status values
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'IN_REVIEW'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Status must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Update user KYC status in database
    const updatedUser = await db('users')
      .where('id', userId)
      .update({
        kyc_status: status,
        updated_at: new Date()
      })
      .returning('*');  // Knex special method to return updated row

    if (updatedUser.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userId,
        status,
        reason,
        message: `KYC status updated to ${status}`
      }
    });
  } catch (error) {
    console.error('Error updating KYC status:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Nova rota para obter detalhes do perfil
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate input
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const user = await db('users')
      .where('id', userId)
      .select('id', 'name', 'email', 'phone', 'birth_date', 'monthly_income', 'credit_score', 'kyc_status', 'created_at', 'updated_at')
      .first();

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        ...user
      }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Nova rota para atualizar o perfil do usuário
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, birthDate, monthlyIncome } = req.body;

    // Validate input
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (birthDate !== undefined) updateData.birth_date = birthDate;
    if (monthlyIncome !== undefined) updateData.monthly_income = monthlyIncome;
    
    updateData.updated_at = new Date();

    const updatedUser = await db('users')
      .where('id', userId)
      .update(updateData)
      .returning('*');

    if (updatedUser.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...updatedUser[0],
        message: 'Profile updated successfully'
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = {
  registerUser,
  verifyIdentity,
  completeOnboarding,
  getOnboardingStatus,
  updateKycStatus,
  getUserProfile,
  updateUserProfile
};
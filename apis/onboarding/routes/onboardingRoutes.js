const express = require('express');
const { body, param } = require('express-validator');
const onboardingController = require('../controllers/onboardingController');
const { authenticateToken } = require('../../backend/middlewares/auth');

const router = express.Router();

// Rota de registro de usuário
router.post('/register', [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required')
], onboardingController.registerUser);

// Rota para verificar identidade
router.post('/verify', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('documentType').notEmpty().withMessage('Document type is required'),
  body('documentNumber').notEmpty().withMessage('Document number is required'),
  body('documentImage').notEmpty().withMessage('Document image is required')
], onboardingController.verifyIdentity);

// Rota para completar onboarding
router.post('/complete', [
  body('userId').notEmpty().withMessage('User ID is required')
], onboardingController.completeOnboarding);

// Rota para obter status do onboarding
router.get('/status/:userId', [
  param('userId').notEmpty().withMessage('User ID is required')
], onboardingController.getOnboardingStatus);

// Rota para atualizar o status de KYC (admin only)
router.put('/kyc-status/:userId', [
  param('userId').notEmpty().withMessage('User ID is required'),
  body('status').notEmpty().withMessage('KYC status is required'),
  authenticateToken  // Requer autenticação
], (req, res, next) => {
  // Verificar se o usuário é admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Admin access required' 
    });
  }
  next();
}, onboardingController.updateKycStatus);

// Rota para obter perfil do usuário
router.get('/profile/:userId', [
  param('userId').notEmpty().withMessage('User ID is required')
], onboardingController.getUserProfile);

// Rota para atualizar perfil do usuário
router.put('/profile/:userId', [
  param('userId').notEmpty().withMessage('User ID is required')
], authenticateToken, (req, res, next) => {
  // Verificar se é o próprio usuário ou admin
  if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied' 
    });
  }
  next();
}, onboardingController.updateUserProfile);

// Rota para obter documentos do usuário
router.get('/documents/:userId', [
  param('userId').notEmpty().withMessage('User ID is required')
], authenticateToken, (req, res, next) => {
  // Verificar se é o próprio usuário ou admin
  if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied' 
    });
  }
  next();
}, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real implementation, this would fetch document metadata from the database
    const db = require('../../backend/config/database');
    const documents = await db('file_uploads')
      .where('user_id', userId)
      .andWhere('category', 'kyc')
      .select('id', 'filename', 'category', 'upload_date', 'status');
    
    res.status(200).json({
      success: true,
      data: {
        userId,
        documents
      }
    });
  } catch (error) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Rota para upload de documentos
router.post('/upload-document', authenticateToken, async (req, res) => {
  try {
    // Verify that the user is uploading for themselves or is admin
    const { userId, documentType, documentData } = req.body;
    
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }
    
    if (!userId || !documentType || !documentData) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID, document type, and document data are required' 
      });
    }
    
    // In a real implementation, we would:
    // 1. Save the document to storage (local, cloud, or database)
    // 2. Store document metadata in the database
    // 3. Return document ID and URL
    
    // Simulate document storage
    const documentId = `doc_${Date.now()}`;
    
    const db = require('../../backend/config/database');
    await db('file_uploads').insert({
      id: documentId,
      user_id: userId,
      filename: `${documentType}_${Date.now()}.jpg`,
      original_name: `${documentType}.jpg`,
      category: 'kyc',
      size: documentData.length,
      type: 'image/jpeg',
      status: 'uploaded',
      upload_date: new Date(),
      metadata: JSON.stringify({ documentType }),
      url: `/api/storage/files/${documentId}`  // This would be the actual URL
    });
    
    res.status(201).json({
      success: true,
      data: {
        documentId,
        message: 'Document uploaded successfully',
        url: `/api/storage/files/${documentId}`
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
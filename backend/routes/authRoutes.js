const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken, authenticateAdmin } = require('../middlewares/auth');

// Middleware opcional para auth status
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  // Use o mesmo processo que authenticateToken mas não falhe
  authenticateToken(req, res, (err) => {
    if (err) {
      req.user = null;
    }
    next();
  });
};

const router = express.Router();

// Validações
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email válido é obrigatório'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('full_name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone deve estar em formato válido'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role deve ser user ou admin'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email válido é obrigatório'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

const updateProfileValidation = [
  body('full_name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone deve estar em formato válido'),
];

// Rotas públicas
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/reset-password', authController.resetPassword);

// Status de autenticação (opcional auth)
router.get('/status', optionalAuth, authController.status);

// Rotas protegidas (usuário autenticado)
router.get('/profile', authenticateToken, authController.getProfile);
router.put(
  '/profile',
  authenticateToken,
  updateProfileValidation,
  authController.updateProfile
);

// Rotas administrativas
router.get('/users', authenticateAdmin, authController.listUsers);
router.get('/users/:id', authenticateAdmin, authController.getUserById);
router.put(
  '/users/:id',
  authenticateAdmin,
  updateProfileValidation,
  authController.updateUser
);
router.delete('/users/:id', authenticateAdmin, authController.deleteUser);

module.exports = router;

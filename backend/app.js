const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { RATE_LIMITS } = require('./constants');

// Rotas principais (que já existem)
const creditAnalysisRoutes = require('../apis/credit-analysis/routes');
const onboardingRoutes = require('../apis/onboarding/routes');
const escrowRoutes = require('../apis/escrow/routes');
const walletRoutes = require('../apis/wallet/routes');

const creditAnalysisQITechRoutes = require('./routes/creditAnalysisRoutes');
const bankingRoutes = require('./routes/bankingRoutes');
const lendingRoutes = require('./routes/lendingRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const fraudKycRoutes = require('./routes/fraudKycRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// Novas rotas (storage e auth)
const storageRoutes = require('./routes/storageRoutes');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Rate limiting middleware
const defaultLimiter = rateLimit({
  windowMs: RATE_LIMITS.DEFAULT.windowMs,
  max: RATE_LIMITS.DEFAULT.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: RATE_LIMITS.UPLOAD.windowMs,
  max: RATE_LIMITS.UPLOAD.max,
  message: 'Too many upload requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: RATE_LIMITS.AUTH.max,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Apply default rate limiter to all routes
app.use(defaultLimiter);

app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: true }));

// Rotas de Storage e Auth (novas) with specific rate limits
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/storage', uploadLimiter, storageRoutes);
app.use('/api/health', healthRoutes);

// Rotas existentes
app.use('/api/credit-analysis', creditAnalysisRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/wallet', walletRoutes);

app.use('/api/qitech/credit', creditAnalysisQITechRoutes);
app.use('/api/qitech/banking', bankingRoutes);
app.use('/api/qitech/lending', lendingRoutes);
app.use('/api/qitech/fraud', fraudKycRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/webhooks', webhookRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;

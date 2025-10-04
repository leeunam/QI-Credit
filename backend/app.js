const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: true }));

// Rotas de Storage e Auth (novas)
app.use('/api/auth', authRoutes);
app.use('/api/storage', storageRoutes);
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

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// API routes
const creditAnalysisRoutes = require('../apis/credit-analysis/routes');
const onboardingRoutes = require('../apis/onboarding/routes');
const escrowRoutes = require('../apis/escrow/routes');
const walletRoutes = require('../apis/wallet/routes');

// QI Tech service routes
const creditAnalysisQITechRoutes = require('./routes/creditAnalysisRoutes');
const bankingRoutes = require('./routes/bankingRoutes');
const lendingRoutes = require('./routes/lendingRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');
const fraudKycRoutes = require('./routes/fraudKycRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable cross-origin requests
app.use(morgan('combined')); // Logging

// Middleware to parse JSON and get raw body for webhook signature verification
app.use(express.json({ limit: '10mb', verify: (req, res, buf) => {
  req.rawBody = buf;
}})); // Parse JSON bodies and store raw body

app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API routes (original)
app.use('/api/credit-analysis', creditAnalysisRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/wallet', walletRoutes);

// QI Tech service routes (new)
app.use('/api/qitech/credit', creditAnalysisQITechRoutes);
app.use('/api/qitech/banking', bankingRoutes);
app.use('/api/qitech/lending', lendingRoutes);
app.use('/api/qitech/fraud', fraudKycRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
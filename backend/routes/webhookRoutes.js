const express = require('express');
const router = express.Router();
const { processQitechWebhook, processBlockchainWebhook } = require('../controllers/webhookController');

// Middleware to get raw body for signature verification
router.use('/qitech', (req, res, next) => {
  req.rawBody = '';
  req.on('data', chunk => {
    req.rawBody += chunk;
  });
  req.on('end', () => {
    next();
  });
});

// QITech webhook endpoint
router.post('/qitech', processQitechWebhook);

// Blockchain event webhook endpoint
router.post('/blockchain', processBlockchainWebhook);

module.exports = router;
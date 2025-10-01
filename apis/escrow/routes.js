// Escrow API routes
const express = require('express');
const router = express.Router();
const escrowController = require('./controllers/escrowController');

// Create an escrow contract
router.post('/create', escrowController.createEscrow);

// Release funds from escrow
router.post('/release', escrowController.releaseFunds);

// Refund funds from escrow
router.post('/refund', escrowController.refundFunds);

// Get escrow details
router.get('/:escrowId', escrowController.getEscrowDetails);

// Get escrow status
router.get('/status/:escrowId', escrowController.getEscrowStatus);

module.exports = router;
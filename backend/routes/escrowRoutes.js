const express = require('express');
const router = express.Router();
const {
  createEscrow,
  releaseEscrow,
  refundEscrow,
  getEscrowStatus,
  listEscrowEvents,
} = require('../controllers/escrowController');

// POST /api/escrow
router.post('/', createEscrow);
// POST /api/escrow/:escrowId/release
router.post('/:escrowId/release', releaseEscrow);
// POST /api/escrow/:escrowId/refund
router.post('/:escrowId/refund', refundEscrow);
// GET /api/escrow/:escrowId
router.get('/:escrowId', getEscrowStatus);
// GET /api/escrow/:escrowId/events
router.get('/:escrowId/events', listEscrowEvents);

module.exports = router;

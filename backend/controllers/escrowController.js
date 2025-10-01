const escrowService = require('../services/escrowService');

// Create / deposit escrow
async function createEscrow(req, res) {
  try {
    const {
      escrowId,
      borrowerAddress,
      lenderAddress,
      arbitratorAddress,
      amount,
    } = req.body;
    if (
      !escrowId ||
      !borrowerAddress ||
      !lenderAddress ||
      !arbitratorAddress ||
      !amount
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            'escrowId, borrowerAddress, lenderAddress, arbitratorAddress, amount are required',
        });
    }
    const result = await escrowService.createEscrow({
      escrowId,
      borrowerAddress,
      lenderAddress,
      arbitratorAddress,
      amount,
    });
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('createEscrow error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function releaseEscrow(req, res) {
  try {
    const { escrowId } = req.params;
    const result = await escrowService.releaseEscrow(escrowId);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('releaseEscrow error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function refundEscrow(req, res) {
  try {
    const { escrowId } = req.params;
    const result = await escrowService.refundEscrow(escrowId);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    console.error('refundEscrow error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getEscrowStatus(req, res) {
  try {
    const { escrowId } = req.params;
    const result = await escrowService.getEscrowStatus(escrowId);
    if (!result.success) return res.status(404).json(result);
    res.json(result);
  } catch (err) {
    console.error('getEscrowStatus error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

async function listEscrowEvents(req, res) {
  try {
    const { escrowId } = req.params;
    const result = await escrowService.listEscrowEvents(escrowId);
    res.json(result);
  } catch (err) {
    console.error('listEscrowEvents error', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  createEscrow,
  releaseEscrow,
  refundEscrow,
  getEscrowStatus,
  listEscrowEvents,
};

const blockchainService = require('./blockchainService');
const config = require('../config/config');

// NOTE: In a full implementation we'd import a DB layer (e.g., knex instance) to persist
// escrow records & events. For hackathon demonstration we mock persistence in-memory
// while leaving clearly marked extension points.

const isMockMode = config.BLOCKCHAIN_MOCK_MODE === 'true';

class EscrowService {
  constructor() {
    // In-memory stores (hackathon scope). Replace with DB repositories.
    this.escrows = new Map(); // key: escrowId -> escrow object
    this.events = []; // chronological list of events
  }

  // Create an escrow (deploy or simulate deposit)
  async createEscrow({
    escrowId,
    borrowerAddress,
    lenderAddress,
    arbitratorAddress,
    amount,
  }) {
    if (!escrowId) throw new Error('escrowId is required');
    if (!borrowerAddress || !lenderAddress || !arbitratorAddress) {
      throw new Error(
        'borrowerAddress, lenderAddress and arbitratorAddress are required'
      );
    }

    const chainResult = await blockchainService.depositToEscrow(
      escrowId,
      borrowerAddress,
      lenderAddress,
      arbitratorAddress,
      amount
    );

    if (!chainResult.success) {
      return {
        success: false,
        error: chainResult.error || 'Blockchain deposit failed',
      };
    }

    const escrowRecord = {
      id: escrowId,
      contractAddress: chainResult.escrowContractAddress,
      borrower: borrowerAddress,
      lender: lenderAddress,
      arbitrator: arbitratorAddress,
      amount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.escrows.set(escrowId, escrowRecord);
    this._pushEvent(escrowId, 'ESCROW_CREATED', { amount });

    return { success: true, escrow: escrowRecord, chain: chainResult };
  }

  async releaseEscrow(escrowId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) return { success: false, error: 'Escrow not found' };

    const chainResult = await blockchainService.releaseFundsFromEscrow(
      escrow.contractAddress
    );
    if (!chainResult.success)
      return { success: false, error: chainResult.error };

    escrow.status = 'RELEASED';
    escrow.updatedAt = new Date().toISOString();
    this._pushEvent(escrowId, 'ESCROW_RELEASED', {
      tx: chainResult.transactionHash,
    });

    return { success: true, escrow, chain: chainResult };
  }

  async refundEscrow(escrowId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) return { success: false, error: 'Escrow not found' };

    const chainResult = await blockchainService.refundFundsFromEscrow(
      escrow.contractAddress
    );
    if (!chainResult.success)
      return { success: false, error: chainResult.error };

    escrow.status = 'REFUNDED';
    escrow.updatedAt = new Date().toISOString();
    this._pushEvent(escrowId, 'ESCROW_REFUNDED', {
      tx: chainResult.transactionHash,
    });

    return { success: true, escrow, chain: chainResult };
  }

  async getEscrowStatus(escrowId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) return { success: false, error: 'Escrow not found' };

    const chainStatus = await blockchainService.getEscrowStatus(
      escrow.contractAddress
    );
    return { success: true, escrow, chain: chainStatus };
  }

  async listEscrowEvents(escrowId) {
    const filtered = this.events.filter((e) => e.escrowId === escrowId);
    return { success: true, events: filtered };
  }

  // Private helper to register events (would persist to DB table escrow_events in production)
  _pushEvent(escrowId, type, payload) {
    this.events.push({
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      escrowId,
      type,
      payload,
      at: new Date().toISOString(),
    });
  }
}

module.exports = new EscrowService();

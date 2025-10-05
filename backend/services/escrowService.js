const blockchainService = require('./blockchainService');
const config = require('../config/config');
const { EscrowTransaction, Loan } = require('../../database/models/indexModel');
const db = require('../config/database');

// registros e eventos de custódia para a demonstração do hackathon estão mocados para simular no hack

const isMockMode = config.BLOCKCHAIN_MOCK_MODE === 'true';

class EscrowService {
  constructor() {
    this.escrows = new Map();
    this.events = []; 
  }

    async createDeposit(loanId, fromUserId, toUserId, amount) {
    return await db.transaction(async (trx) => {
      const loanData = await trx('loan_contracts').where('id', loanId).first();
      if (!loanData) throw new Error('Loan not found');

      const loan = new Loan(loanData);
      if (!loan.isActive()) {
        throw new Error('Loan is not active');
      }

      const transaction = new EscrowTransaction({
        loan_id: loanId,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount,
        transaction_type: 'DEPOSIT',
        status: 'PENDING'
      });

      const validation = transaction.validate();
      if (!validation.isValid) {
        throw new Error(`Invalid transaction: ${validation.errors.join(', ')}`);
      }

      try {
        const txHash = await blockchainService.deposit(loanId, amount);

        transaction.markAsCompleted(txHash);

        await trx('escrow_events').insert(transaction.toDatabase());

        return transaction;
      } catch (error) {
        transaction.markAsFailed(error.message);
        await trx('escrow_events').insert(transaction.toDatabase());
        throw error;
      }
    });
  }

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

    return await db.transaction(async (trx) => {
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

      // Persist to database
      await trx('escrow_events').insert({
        id: escrowId,
        loan_id: escrowId,
        event_type: 'ESCROW_CREATED',
        amount,
        tx_hash: chainResult.transactionHash,
        event_hash: chainResult.escrowContractAddress,
        metadata: JSON.stringify({
          borrower: borrowerAddress,
          lender: lenderAddress,
          arbitrator: arbitratorAddress,
          contractAddress: chainResult.escrowContractAddress
        }),
        created_at: new Date(),
        updated_at: new Date()
      });

      this.escrows.set(escrowId, escrowRecord);
      this._pushEvent(escrowId, 'ESCROW_CREATED', { amount });

      return { success: true, escrow: escrowRecord, chain: chainResult };
    });
  }

  async releaseEscrow(escrowId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) return { success: false, error: 'Escrow not found' };

    return await db.transaction(async (trx) => {
      const chainResult = await blockchainService.releaseFundsFromEscrow(
        escrow.contractAddress
      );
      if (!chainResult.success)
        return { success: false, error: chainResult.error };

      escrow.status = 'RELEASED';
      escrow.updatedAt = new Date().toISOString();

      // Persist to database
      await trx('escrow_events').insert({
        loan_id: escrowId,
        event_type: 'ESCROW_RELEASED',
        amount: escrow.amount,
        tx_hash: chainResult.transactionHash,
        metadata: JSON.stringify({
          contractAddress: escrow.contractAddress,
          releasedAt: escrow.updatedAt
        }),
        created_at: new Date(),
        updated_at: new Date()
      });

      this._pushEvent(escrowId, 'ESCROW_RELEASED', {
        tx: chainResult.transactionHash,
      });

      return { success: true, escrow, chain: chainResult };
    });
  }

  async refundEscrow(escrowId) {
    const escrow = this.escrows.get(escrowId);
    if (!escrow) return { success: false, error: 'Escrow not found' };

    return await db.transaction(async (trx) => {
      const chainResult = await blockchainService.refundFundsFromEscrow(
        escrow.contractAddress
      );
      if (!chainResult.success)
        return { success: false, error: chainResult.error };

      escrow.status = 'REFUNDED';
      escrow.updatedAt = new Date().toISOString();

      // Persist to database
      await trx('escrow_events').insert({
        loan_id: escrowId,
        event_type: 'ESCROW_REFUNDED',
        amount: escrow.amount,
        tx_hash: chainResult.transactionHash,
        metadata: JSON.stringify({
          contractAddress: escrow.contractAddress,
          refundedAt: escrow.updatedAt
        }),
        created_at: new Date(),
        updated_at: new Date()
      });

      this._pushEvent(escrowId, 'ESCROW_REFUNDED', {
        tx: chainResult.transactionHash,
      });

      return { success: true, escrow, chain: chainResult };
    });
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

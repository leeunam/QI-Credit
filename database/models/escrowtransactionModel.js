const BaseModel = require('./BaseModel');

class EscrowTransaction extends BaseModel {
  constructor(data = {}) {
    super(data);
  }

  static get tableName() {
    return 'escrow_events';
  }

  static get TRANSACTION_TYPES() {
    return ['DEPOSIT', 'RELEASE', 'REFUND', 'HOLD'];
  }

  static get STATUSES() {
    return ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'];
  }

  validate() {
    const errors = [];

    if (!this.loan_id) {
      errors.push('Loan ID is required');
    }

    if (!this.from_user_id) {
      errors.push('From user ID is required');
    }

    if (!this.to_user_id) {
      errors.push('To user ID is required');
    }

    if (!this.amount || this.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!EscrowTransaction.TRANSACTION_TYPES.includes(this.transaction_type)) {
      errors.push(`Transaction type must be one of: ${EscrowTransaction.TRANSACTION_TYPES.join(', ')}`);
    }

    if (!EscrowTransaction.STATUSES.includes(this.status)) {
      errors.push(`Status must be one of: ${EscrowTransaction.STATUSES.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isPending() {
    return this.status === 'PENDING';
  }

  isCompleted() {
    return this.status === 'COMPLETED';
  }

  isFailed() {
    return this.status === 'FAILED';
  }

  markAsCompleted(txHash) {
    this.status = 'COMPLETED';
    this.blockchain_tx_hash = txHash;
    this.completed_at = new Date();
    this.updated_at = new Date();
  }

  markAsFailed(error) {
    this.status = 'FAILED';
    this.error_message = error;
    this.failed_at = new Date();
    this.updated_at = new Date();
  }

  cancel(reason) {
    this.status = 'CANCELLED';
    this.cancellation_reason = reason;
    this.cancelled_at = new Date();
    this.updated_at = new Date();
  }
}

module.exports = EscrowTransaction;
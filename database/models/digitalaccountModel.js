const BaseModel = require('./baseModel');

class DigitalAccount extends BaseModel {
  constructor(data = {}) {
    super(data);
  }

  static get tableName() {
    return 'digital_accounts';
  }

  static get ACCOUNT_TYPES() {
    return ['CHECKING', 'SAVINGS'];
  }

  static get STATUSES() {
    return ['ACTIVE', 'INACTIVE', 'BLOCKED', 'CLOSED'];
  }

  validate() {
    const errors = [];

    if (!this.user_id) {
      errors.push('User ID is required');
    }

    if (!this.account_number) {
      errors.push('Account number is required');
    }

    if (!this.bank_code) {
      errors.push('Bank code is required');
    }

    if (!DigitalAccount.ACCOUNT_TYPES.includes(this.account_type)) {
      errors.push(`Account type must be one of: ${DigitalAccount.ACCOUNT_TYPES.join(', ')}`);
    }

    if (!DigitalAccount.STATUSES.includes(this.status)) {
      errors.push(`Status must be one of: ${DigitalAccount.STATUSES.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isActive() {
    return this.status === 'ACTIVE';
  }

  isBlocked() {
    return this.status === 'BLOCKED';
  }

  canTransact() {
    return this.isActive() && this.balance >= 0;
  }

  updateBalance(amount) {
    this.balance = (this.balance || 0) + amount;
    this.updated_at = new Date();
  }

  block(reason) {
    this.status = 'BLOCKED';
    this.blocked_reason = reason;
    this.blocked_at = new Date();
    this.updated_at = new Date();
  }

  unblock() {
    this.status = 'ACTIVE';
    this.blocked_reason = null;
    this.blocked_at = null;
    this.updated_at = new Date();
  }
}

module.exports = DigitalAccount;
const BaseModel = require('./baseModel');

class Loan extends BaseModel {
  constructor(data = {}) {
    super(data);
  }

  static get tableName() {
    return 'loan_contracts';
  }

  static get STATUSES() {
    return ['PENDING', 'ACTIVE', 'REPAID', 'DEFAULTED', 'CANCELLED'];
  }

  validate() {
    const errors = [];

    if (!this.borrower_id) {
      errors.push('Borrower ID is required');
    }

    if (!this.marketplace_offer_id) {
      errors.push('Marketplace offer ID is required');
    }

    if (!this.amount || this.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!this.rate || this.rate <= 0) {
      errors.push('Rate must be greater than 0');
    }

    if (!this.term_days || this.term_days <= 0) {
      errors.push('Term days must be greater than 0');
    }

    if (!Loan.STATUSES.includes(this.status)) {
      errors.push(`Status must be one of: ${Loan.STATUSES.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isActive() {
    return this.status === 'ACTIVE';
  }

  isOverdue() {
    if (!this.isActive() || !this.due_date) return false;
    return new Date() > new Date(this.due_date);
  }

  getTotalAmount() {
    const dailyRate = this.rate / 365;
    return this.amount * (1 + (dailyRate * this.term_days));
  }

  getTotalInterest() {
    return this.getTotalAmount() - this.amount;
  }

  calculateDueDate() {
    if (!this.disbursed_at) return null;
    const disbursedDate = new Date(this.disbursed_at);
    disbursedDate.setDate(disbursedDate.getDate() + this.term_days);
    return disbursedDate;
  }

  activate() {
    this.status = 'ACTIVE';
    this.disbursed_at = new Date();
    this.due_date = this.calculateDueDate();
    this.updated_at = new Date();
  }

  markAsRepaid() {
    this.status = 'REPAID';
    this.repaid_at = new Date();
    this.updated_at = new Date();
  }

  markAsDefaulted() {
    this.status = 'DEFAULTED';
    this.defaulted_at = new Date();
    this.updated_at = new Date();
  }
}

module.exports = Loan;
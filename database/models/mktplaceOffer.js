const BaseModel = require('./BaseModel');

class MarketplaceOffer extends BaseModel {
  constructor(data = {}) {
    super(data);
  }

  static get tableName() {
    return 'marketplace_offers';
  }

  static get RISK_PROFILES() {
    return ['LOW', 'MEDIUM', 'HIGH'];
  }

  static get STATUSES() {
    return ['OPEN', 'MATCHED', 'CANCELLED', 'EXPIRED'];
  }

  validate() {
    const errors = [];

    if (!this.investor_id) {
      errors.push('Investor ID is required');
    }

    if (!this.amount || this.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!this.rate || this.rate <= 0 || this.rate > 1) {
      errors.push('Rate must be between 0 and 1');
    }

    if (!this.term_days || this.term_days <= 0) {
      errors.push('Term days must be greater than 0');
    }

    if (!MarketplaceOffer.RISK_PROFILES.includes(this.risk_profile)) {
      errors.push(`Risk profile must be one of: ${MarketplaceOffer.RISK_PROFILES.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isActive() {
    return this.status === 'OPEN';
  }

  canMatch(loanRequest) {
    return this.isActive() && 
           this.amount >= loanRequest.amount &&
           this.risk_profile === loanRequest.risk_profile;
  }

  getTotalReturn() {
    const dailyRate = this.rate / 365;
    return this.amount * (1 + (dailyRate * this.term_days));
  }

  getInterestAmount() {
    return this.getTotalReturn() - this.amount;
  }

  markAsMatched() {
    this.status = 'MATCHED';
    this.matched_at = new Date();
    this.updated_at = new Date();
  }

  cancel(reason = null) {
    this.status = 'CANCELLED';
    this.cancelled_at = new Date();
    this.cancellation_reason = reason;
    this.updated_at = new Date();
  }
}

module.exports = MarketplaceOffer;
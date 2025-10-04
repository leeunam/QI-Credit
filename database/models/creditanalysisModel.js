const BaseModel = require('./BaseModel');

class CreditAnalysis extends BaseModel {
  constructor(data = {}) {
    super(data);
  }

  static get tableName() {
    return 'credit_analyses';
  }

  static get STATUSES() {
    return ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'];
  }

  static get RISK_LEVELS() {
    return ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];
  }

  validate() {
    const errors = [];

    if (!this.user_id) {
      errors.push('User ID is required');
    }

    if (!this.requested_amount || this.requested_amount <= 0) {
      errors.push('Requested amount must be greater than 0');
    }

    if (!CreditAnalysis.STATUSES.includes(this.status)) {
      errors.push(`Status must be one of: ${CreditAnalysis.STATUSES.join(', ')}`);
    }

    if (this.risk_level && !CreditAnalysis.RISK_LEVELS.includes(this.risk_level)) {
      errors.push(`Risk level must be one of: ${CreditAnalysis.RISK_LEVELS.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isApproved() {
    return this.status === 'APPROVED';
  }

  isRejected() {
    return this.status === 'REJECTED';
  }

  isPending() {
    return this.status === 'PENDING';
  }

  approve(approvedAmount, riskLevel, observations = null) {
    this.status = 'APPROVED';
    this.approved_amount = approvedAmount;
    this.risk_level = riskLevel;
    this.observations = observations;
    this.approved_at = new Date();
    this.updated_at = new Date();
  }

  reject(reason) {
    this.status = 'REJECTED';
    this.rejection_reason = reason;
    this.rejected_at = new Date();
    this.updated_at = new Date();
  }

  calculateRate() {
    const baseRates = {
      'LOW': 0.12,
      'MEDIUM': 0.18,
      'HIGH': 0.25,
      'VERY_HIGH': 0.35
    };
    return baseRates[this.risk_level] || 0.18;
  }
}

module.exports = CreditAnalysis;
const BaseModel = require('./baseModel');

class KycVerification extends BaseModel {
  constructor(data = {}) {
    super(data);
  }

  static get tableName() {
    return 'kyc_verifications';
  }

  static get STATUSES() {
    return ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'];
  }

  static get DOCUMENT_TYPES() {
    return ['CPF', 'RG', 'CNH', 'PASSPORT'];
  }

  validate() {
    const errors = [];

    if (!this.user_id) {
      errors.push('User ID is required');
    }

    if (!KycVerification.STATUSES.includes(this.status)) {
      errors.push(`Status must be one of: ${KycVerification.STATUSES.join(', ')}`);
    }

    if (this.document_type && !KycVerification.DOCUMENT_TYPES.includes(this.document_type)) {
      errors.push(`Document type must be one of: ${KycVerification.DOCUMENT_TYPES.join(', ')}`);
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

  approve(verifiedBy = null) {
    this.status = 'APPROVED';
    this.verified_by = verifiedBy;
    this.verified_at = new Date();
    this.updated_at = new Date();
  }

  reject(reason, rejectedBy = null) {
    this.status = 'REJECTED';
    this.rejection_reason = reason;
    this.rejected_by = rejectedBy;
    this.rejected_at = new Date();
    this.updated_at = new Date();
  }

  isExpired() {
    if (!this.expires_at) return false;
    return new Date() > new Date(this.expires_at);
  }
}

module.exports = KycVerification;
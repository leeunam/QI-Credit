const BaseModel = require('./BaseModel');

class User extends BaseModel {
  constructor(data = {}) {
    super(data);
  }

  static get tableName() {
    return 'users';
  }

  validate() {
    const errors = [];

    if (!this.document || this.document.length < 11) {
      errors.push('Document must be at least 11 characters');
    }

    if (!this.name || this.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Valid email is required');
    }

    if (!this.phone) {
      errors.push('Phone is required');
    }

    if (!this.birth_date) {
      errors.push('Birth date is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isKycApproved() {
    return this.kyc_status === 'APPROVED';
  }

  canBorrow() {
    return this.isKycApproved() && this.credit_score >= 600;
  }

  canInvest() {
    return this.isKycApproved() && this.monthly_income >= 2000;
  }

  getAge() {
    if (!this.birth_date) return null;
    const today = new Date();
    const birthDate = new Date(this.birth_date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  toLogSafe() {
    return {
      id: this.id,
      name: this.name,
      email: this.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      document: this.document.replace(/(.{3})(.*)(.{2})/, '$1***$3'),
      kyc_status: this.kyc_status,
      credit_score: this.credit_score
    };
  }
}

module.exports = User;
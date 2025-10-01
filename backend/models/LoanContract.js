// Loan Contract model (example)
class LoanContract {
  constructor({
    id,
    contractId,
    borrowerId,
    lenderId,
    loanAmount,
    interestRate,
    term,
    contractType = 'CCB',
    description,
    status = 'draft',
    providerContractId = null,
    blockchainContractAddress = null,
    paymentSchedule = [],
    metadata = {},
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.contractId = contractId;
    this.borrowerId = borrowerId;
    this.lenderId = lenderId;
    this.loanAmount = loanAmount;
    this.interestRate = interestRate;
    this.term = term;
    this.contractType = contractType; // 'CCB', 'CCI', 'CCE'
    this.description = description;
    this.status = status; // 'draft', 'pending_signature', 'signed', 'active', 'completed', 'defaulted'
    this.providerContractId = providerContractId; // Contract ID from QITech API
    this.blockchainContractAddress = blockchainContractAddress;
    this.paymentSchedule = paymentSchedule;
    this.metadata = metadata;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  // Method to validate loan contract
  validate() {
    const errors = [];
    
    if (!this.borrowerId) errors.push('Borrower ID is required');
    if (!this.loanAmount || this.loanAmount <= 0) errors.push('Valid loan amount is required');
    if (!this.interestRate || this.interestRate < 0) errors.push('Valid interest rate is required');
    if (!this.term || this.term <= 0) errors.push('Valid term is required');
    if (!['CCB', 'CCI', 'CCE'].includes(this.contractType)) {
      errors.push('Invalid contract type, must be CCB, CCI, or CCE');
    }
    if (!['draft', 'pending_signature', 'signed', 'active', 'completed', 'defaulted'].includes(this.status)) {
      errors.push('Invalid status');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Method to update loan contract status
  updateStatus(status) {
    this.status = status;
    this.updatedAt = new Date();
  }

  // Method to calculate total repayment amount
  getTotalRepaymentAmount() {
    const monthlyRate = this.interestRate / 12 / 100;
    const paymentAmount = this.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, this.term)) / (Math.pow(1 + monthlyRate, this.term) - 1);
    return parseFloat((paymentAmount * this.term).toFixed(2));
  }

  // Method to calculate total interest paid
  getTotalInterest() {
    return parseFloat((this.getTotalRepaymentAmount() - this.loanAmount).toFixed(2));
  }
}

module.exports = LoanContract;
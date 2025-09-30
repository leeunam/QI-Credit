// Credit Analysis model (example)
class CreditAnalysis {
  constructor({
    id,
    userId,
    document,
    analysisType,
    status = 'pending',
    score = null,
    providerId = null,
    result = null,
    metadata = {},
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.userId = userId;
    this.document = document;
    this.analysisType = analysisType; // 'individual' or 'business'
    this.status = status; // 'pending', 'processing', 'completed', 'failed'
    this.score = score;
    this.providerId = providerId; // ID from QITech API
    this.result = result; // Full result from credit analysis
    this.metadata = metadata;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  // Method to validate credit analysis
  validate() {
    const errors = [];
    
    if (!this.userId) errors.push('User ID is required');
    if (!this.document) errors.push('Document is required');
    if (!this.analysisType) errors.push('Analysis type is required');
    if (!['individual', 'business'].includes(this.analysisType)) {
      errors.push('Invalid analysis type, must be individual or business');
    }
    if (!['pending', 'processing', 'completed', 'failed'].includes(this.status)) {
      errors.push('Invalid status');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Method to update credit analysis status
  updateStatus(status, score = null, result = null) {
    this.status = status;
    if (score !== null) this.score = score;
    if (result !== null) this.result = result;
    this.updatedAt = new Date();
  }

  // Method to get risk level based on score
  getRiskLevel() {
    if (this.score === null) return null;
    if (this.score >= 750) return 'LOW';
    if (this.score >= 650) return 'MEDIUM';
    return 'HIGH';
  }
}

module.exports = CreditAnalysis;
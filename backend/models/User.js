// User model (example)
class User {
  constructor({
    id,
    document,
    name,
    email,
    phone,
    birthDate,
    monthlyIncome,
    address,
    creditScore,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.document = document;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.birthDate = birthDate;
    this.monthlyIncome = monthlyIncome;
    this.address = address;
    this.creditScore = creditScore || null;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  // Method to validate user data
  validate() {
    const errors = [];
    
    if (!this.document) errors.push('Document is required');
    if (!this.name) errors.push('Name is required');
    if (!this.email) errors.push('Email is required');
    if (!this.phone) errors.push('Phone is required');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Method to update user information
  update(data) {
    Object.keys(data).forEach(key => {
      if (this.hasOwnProperty(key) && key !== 'id' && key !== 'createdAt') {
        this[key] = data[key];
      }
    });
    
    this.updatedAt = new Date();
  }
}

module.exports = User;
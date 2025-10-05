const { User } = require('../../database/models/indexModel');
const db = require('../config/database');

class UserService {
  async createUser(userData) {
    const user = new User(userData);
    
    const validation = user.validate();
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    if (!user.canBorrow()) {
      console.log('User cannot borrow - KYC not approved or low credit score');
    }
    
    const [savedUser] = await db('users')
      .insert(user.toDatabase())
      .returning('*');
    
    return new User(savedUser);
  }

  async findByDocument(document) {
    const userData = await db('users')
      .where('document', document)
      .first();
    
    return userData ? new User(userData) : null;
  }

  async updateKycStatus(userId, status) {
    const userData = await db('users')
      .where('id', userId)
      .first();
    
    if (!userData) throw new Error('User not found');
    
    const user = new User(userData);
    user.kyc_status = status;
    user.updated_at = new Date();
    
    await db('users')
      .where('id', userId)
      .update(user.toDatabase());
    
    return user;
  }
}

module.exports = new UserService();
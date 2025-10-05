const BaseRepository = require('../base/BaseRepository');
const { v4: uuidv4 } = require('uuid');

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  // Métodos específicos de usuários
  async findByDocument(document) {
    if (this.isMockMode) {
      return this.getMockData().find(user => user.document === document);
    }
    
    return await this.db(this.tableName)
      .where('document', document)
      .first();
  }

  async findByEmail(email) {
    if (this.isMockMode) {
      return this.getMockData().find(user => user.email === email);
    }
    
    return await this.db(this.tableName)
      .where('email', email)
      .first();
  }

  async updateKycStatus(userId, status) {
    return await this.update(userId, { kyc_status: status });
  }

  // Implementação dos métodos mock
  getMockData() {
    return [
      {
        id: uuidv4(),
        document: '12345678901',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '+5511999999999',
        birth_date: '1990-01-15',
        monthly_income: 5000.00,
        credit_score: 750,
        kyc_status: 'APPROVED',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        document: '98765432109',
        name: 'Maria Santos',
        email: 'maria@example.com',
        phone: '+5511888888888',
        birth_date: '1985-05-20',
        monthly_income: 7500.00,
        credit_score: 800,
        kyc_status: 'APPROVED',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
  }

  createMockData(data) {
    const mockUser = {
      ...data,
      id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date()
    };
    // Em produção, armazenar isso em memória ou cache
    return mockUser;
  }

  updateMockData(id, data) {
    return { ...data, id, updated_at: new Date() };
  }

  deleteMockData(id) {
    return true;
  }
}

module.exports = UserRepository;
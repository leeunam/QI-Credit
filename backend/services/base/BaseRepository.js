const db = require('../../config/database');
const config = require('../../config/config');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = db;
    // Fix: config.mock.database doesn't exist, use MOCK_MODE env var or check config structure
    this.isMockMode = process.env.MOCK_MODE === 'true' || config.MOCK_MODE === 'true';
  }

  async findAll(filters = {}) {
    if (this.isMockMode) {
      return this.getMockData();
    }
    
    let query = this.db(this.tableName);
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined) {
        query = query.where(key, filters[key]);
      }
    });
    
    return await query.select('*');
  }

  async findById(id) {
    if (this.isMockMode) {
      return this.getMockData().find(item => item.id === id);
    }
    
    return await this.db(this.tableName)
      .where('id', id)
      .first();
  }

  async create(data) {
    if (this.isMockMode) {
      return this.createMockData(data);
    }
    
    const [result] = await this.db(this.tableName)
      .insert(data)
      .returning('*');
    
    return result;
  }

  async update(id, data) {
    if (this.isMockMode) {
      return this.updateMockData(id, data);
    }
    
    const [result] = await this.db(this.tableName)
      .where('id', id)
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');
    
    return result;
  }

  async delete(id) {
    if (this.isMockMode) {
      return this.deleteMockData(id);
    }
    
    return await this.db(this.tableName)
      .where('id', id)
      .del();
  }

  // Métodos que devem ser implementados pelas classes filhas para mock
  getMockData() {
    throw new Error('getMockData must be implemented by subclass');
  }

  createMockData(data) {
    throw new Error('createMockData must be implemented by subclass');
  }

  updateMockData(id, data) {
    throw new Error('updateMockData must be implemented by subclass');
  }

  deleteMockData(id) {
    throw new Error('deleteMockData must be implemented by subclass');
  }
}

module.exports = BaseRepository;
const { v4: uuidv4 } = require('uuid');

class BaseModel {
  constructor(data = {}) {
    Object.assign(this, data);
    if (!this.id) {
      this.id = uuidv4();
    }
    if (!this.created_at) {
      this.created_at = new Date();
    }
    this.updated_at = new Date();
  }

  static get tableName() {
    throw new Error('tableName must be defined in subclass');
  }

  validate() {
    return { isValid: true, errors: [] };
  }

  toJSON() {
    return { ...this };
  }

  toDatabase() {
    const data = { ...this };
    delete data._transient;
    return data;
  }
}

module.exports = BaseModel;
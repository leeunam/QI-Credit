/**
 * Audit Service
 * Handles audit logging for all critical operations in the system
 */

const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { AUDIT_ACTION_TYPES } = require('../constants');

class AuditService {
  constructor() {
    this.db = db;
  }

  /**
   * Log an action to the audit trail
   * @param {string} userId - The ID of the user performing the action
   * @param {string} entity - The entity being acted upon (e.g., 'loan', 'user', 'transaction')
   * @param {string} entityId - The ID of the entity
   * @param {string} action - The action being performed (from AUDIT_ACTION_TYPES)
   * @param {object} diff - The changes made (before/after values)
   * @param {object} metadata - Additional metadata about the action
   * @returns {Promise<object>} The created audit log entry
   */
  async logAction(userId, entity, entityId, action, diff = null, metadata = null) {
    try {
      // Validate action type
      if (!Object.values(AUDIT_ACTION_TYPES).includes(action)) {
        console.warn(`Invalid audit action type: ${action}`);
      }

      const auditData = {
        id: uuidv4(),
        user_id: userId,
        entity_type: entity,
        entity_id: entityId,
        action: action,
        changes: diff ? JSON.stringify(diff) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ip_address: metadata?.ip_address || null,
        user_agent: metadata?.user_agent || null,
        created_at: new Date()
      };

      const [auditLog] = await this.db('audit_logs')
        .insert(auditData)
        .returning('*');

      return auditLog;
    } catch (error) {
      console.error('Error logging audit action:', error);
      // Don't throw - audit logging should not break the main operation
      return null;
    }
  }

  /**
   * Log a CREATE action
   */
  async logCreate(userId, entity, entityId, data, metadata = null) {
    return this.logAction(userId, entity, entityId, AUDIT_ACTION_TYPES.CREATE, { after: data }, metadata);
  }

  /**
   * Log an UPDATE action
   */
  async logUpdate(userId, entity, entityId, before, after, metadata = null) {
    return this.logAction(userId, entity, entityId, AUDIT_ACTION_TYPES.UPDATE, { before, after }, metadata);
  }

  /**
   * Log a DELETE action
   */
  async logDelete(userId, entity, entityId, data, metadata = null) {
    return this.logAction(userId, entity, entityId, AUDIT_ACTION_TYPES.DELETE, { before: data }, metadata);
  }

  /**
   * Log a READ action (for sensitive data)
   */
  async logRead(userId, entity, entityId, metadata = null) {
    return this.logAction(userId, entity, entityId, AUDIT_ACTION_TYPES.READ, null, metadata);
  }

  /**
   * Log a LOGIN action
   */
  async logLogin(userId, success, metadata = null) {
    return this.logAction(
      userId,
      'user',
      userId,
      AUDIT_ACTION_TYPES.LOGIN,
      { success },
      metadata
    );
  }

  /**
   * Log a LOGOUT action
   */
  async logLogout(userId, metadata = null) {
    return this.logAction(userId, 'user', userId, AUDIT_ACTION_TYPES.LOGOUT, null, metadata);
  }

  /**
   * Log an APPROVE action
   */
  async logApprove(userId, entity, entityId, metadata = null) {
    return this.logAction(userId, entity, entityId, AUDIT_ACTION_TYPES.APPROVE, null, metadata);
  }

  /**
   * Log a REJECT action
   */
  async logReject(userId, entity, entityId, reason, metadata = null) {
    return this.logAction(
      userId,
      entity,
      entityId,
      AUDIT_ACTION_TYPES.REJECT,
      { reason },
      metadata
    );
  }

  /**
   * Log a CANCEL action
   */
  async logCancel(userId, entity, entityId, reason, metadata = null) {
    return this.logAction(
      userId,
      entity,
      entityId,
      AUDIT_ACTION_TYPES.CANCEL,
      { reason },
      metadata
    );
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityAuditLogs(entity, entityId, limit = 50) {
    try {
      const logs = await this.db('audit_logs')
        .where({
          entity_type: entity,
          entity_id: entityId
        })
        .orderBy('created_at', 'desc')
        .limit(limit);

      return logs;
    } catch (error) {
      console.error('Error fetching entity audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(userId, limit = 50) {
    try {
      const logs = await this.db('audit_logs')
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
        .limit(limit);

      return logs;
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit logs by action type
   */
  async getAuditLogsByAction(action, limit = 50) {
    try {
      const logs = await this.db('audit_logs')
        .where({ action })
        .orderBy('created_at', 'desc')
        .limit(limit);

      return logs;
    } catch (error) {
      console.error('Error fetching audit logs by action:', error);
      return [];
    }
  }

  /**
   * Search audit logs with filters
   */
  async searchAuditLogs(filters = {}, limit = 50, offset = 0) {
    try {
      let query = this.db('audit_logs');

      if (filters.userId) {
        query = query.where('user_id', filters.userId);
      }

      if (filters.entity) {
        query = query.where('entity_type', filters.entity);
      }

      if (filters.entityId) {
        query = query.where('entity_id', filters.entityId);
      }

      if (filters.action) {
        query = query.where('action', filters.action);
      }

      if (filters.startDate) {
        query = query.where('created_at', '>=', filters.startDate);
      }

      if (filters.endDate) {
        query = query.where('created_at', '<=', filters.endDate);
      }

      const logs = await query
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      return logs;
    } catch (error) {
      console.error('Error searching audit logs:', error);
      return [];
    }
  }
}

// Export a singleton instance
module.exports = new AuditService();

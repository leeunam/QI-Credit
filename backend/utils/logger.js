/**
 * Structured Logger Utility
 * Uses console.log/error for now with structured format
 * Can be easily migrated to Winston in the future
 */

const config = require('../config/config');

class Logger {
  constructor() {
    this.env = config.nodeEnv || 'development';
    this.isDevelopment = this.env === 'development';
  }

  /**
   * Format log message with structured data
   */
  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      env: this.env,
      message,
      ...(data && { data })
    };

    return this.isDevelopment
      ? this.formatForConsole(logEntry)
      : JSON.stringify(logEntry);
  }

  /**
   * Format log entry for console output (pretty print for development)
   */
  formatForConsole(logEntry) {
    const { timestamp, level, message, data } = logEntry;
    let output = `[${timestamp}] ${level}: ${message}`;

    if (data) {
      output += '\n' + JSON.stringify(data, null, 2);
    }

    return output;
  }

  /**
   * Info level logging
   */
  info(message, data = null) {
    console.log(this.formatMessage('info', message, data));
  }

  /**
   * Error level logging
   */
  error(message, error = null, data = null) {
    const errorData = {
      ...data,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          ...(error.code && { code: error.code })
        }
      })
    };

    console.error(this.formatMessage('error', message, errorData));
  }

  /**
   * Warning level logging
   */
  warn(message, data = null) {
    console.warn(this.formatMessage('warn', message, data));
  }

  /**
   * Debug level logging (only in development)
   */
  debug(message, data = null) {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  /**
   * HTTP request logging
   */
  http(method, path, statusCode, duration, data = null) {
    const message = `${method} ${path} ${statusCode} - ${duration}ms`;
    const logData = {
      method,
      path,
      statusCode,
      duration,
      ...data
    };

    console.log(this.formatMessage('http', message, logData));
  }

  /**
   * Database query logging (only in development)
   */
  db(query, duration, data = null) {
    if (this.isDevelopment) {
      const message = `DB Query: ${query}`;
      const logData = {
        query,
        duration,
        ...data
      };

      console.log(this.formatMessage('db', message, logData));
    }
  }

  /**
   * Service call logging
   */
  service(serviceName, operation, success, duration, data = null) {
    const message = `${serviceName}.${operation} - ${success ? 'SUCCESS' : 'FAILED'} - ${duration}ms`;
    const logData = {
      service: serviceName,
      operation,
      success,
      duration,
      ...data
    };

    console.log(this.formatMessage('service', message, logData));
  }

  /**
   * Security event logging
   */
  security(event, userId, success, data = null) {
    const message = `Security Event: ${event} - User: ${userId} - ${success ? 'SUCCESS' : 'FAILED'}`;
    const logData = {
      event,
      userId,
      success,
      ...data
    };

    console.log(this.formatMessage('security', message, logData));
  }

  /**
   * Audit logging (delegates to auditService for database persistence)
   */
  audit(userId, entity, entityId, action, changes = null, metadata = null) {
    const message = `Audit: ${action} on ${entity}:${entityId} by User:${userId}`;
    const logData = {
      userId,
      entity,
      entityId,
      action,
      ...(changes && { changes }),
      ...(metadata && { metadata })
    };

    console.log(this.formatMessage('audit', message, logData));

    // TODO: Also persist to database via auditService
    // const auditService = require('../services/auditService');
    // auditService.logAction(userId, entity, entityId, action, changes, metadata);
  }

  /**
   * Performance logging
   */
  perf(operation, duration, threshold = 1000, data = null) {
    const isSlow = duration > threshold;
    const message = `${operation} - ${duration}ms ${isSlow ? '(SLOW)' : ''}`;
    const logData = {
      operation,
      duration,
      threshold,
      isSlow,
      ...data
    };

    if (isSlow) {
      console.warn(this.formatMessage('perf', message, logData));
    } else if (this.isDevelopment) {
      console.log(this.formatMessage('perf', message, logData));
    }
  }
}

// Export singleton instance
module.exports = new Logger();

/**
 * Usage Examples:
 *
 * const logger = require('./utils/logger');
 *
 * logger.info('User logged in', { userId: '123', ip: '192.168.1.1' });
 * logger.error('Database connection failed', error, { host: 'localhost' });
 * logger.warn('API rate limit approaching', { current: 95, limit: 100 });
 * logger.debug('Processing request', { requestId: 'abc123' });
 * logger.http('GET', '/api/users', 200, 45, { userId: '123' });
 * logger.db('SELECT * FROM users WHERE id = ?', 12, { rowCount: 1 });
 * logger.service('QITech', 'createAccount', true, 234, { accountId: 'acc123' });
 * logger.security('LOGIN_ATTEMPT', 'user123', true, { ip: '192.168.1.1' });
 * logger.audit('user123', 'loan', 'loan456', 'CREATE', { amount: 5000 });
 * logger.perf('creditAnalysis', 1500, 1000, { analysisId: 'ca123' });
 */

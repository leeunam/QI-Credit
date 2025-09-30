// Utility functions for logging and error handling
const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'qi-credit-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Log an error with context
const logError = (error, context = 'General') => {
  logger.error({
    message: error.message,
    stack: error.stack,
    context: context,
    timestamp: new Date().toISOString()
  });
};

// Log application events
const logEvent = (level, message, meta = {}) => {
  logger.log(level, message, meta);
};

// API response formatter
const apiResponse = (success, data, message = null, statusCode = 200) => {
  const response = {
    success,
    timestamp: new Date().toISOString(),
    data: success ? data : null,
    error: success ? null : data
  };
  
  if (message) {
    response.message = message;
  }
  
  return {
    response,
    statusCode
  };
};

// Standard error response
const errorResponse = (res, error, message = 'Internal server error', statusCode = 500) => {
  logError(error, message);
  return res.status(statusCode).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    timestamp: new Date().toISOString()
  });
};

// Success response
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Validate if a value is a valid Ethereum address
const isValidEthereumAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Simple regex check for Ethereum address format
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Format currency amounts
const formatCurrency = (amount, currency = 'BRL', locale = 'pt-BR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Generate unique ID
const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Check if value is a valid CPF (Brazilian individual taxpayer registry)
const isValidCPF = (cpf) => {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }
  
  // Remove non-digits
  const cleanCpf = cpf.replace(/\D/g, '');
  
  if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf)) {
    return false;
  }
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;
  
  return true;
};

// Check if value is a valid CNPJ (Brazilian corporate taxpayer registry)
const isValidCNPJ = (cnpj) => {
  if (!cnpj || typeof cnpj !== 'string') {
    return false;
  }
  
  // Remove non-digits
  const cleanCnpj = cnpj.replace(/\D/g, '');
  
  if (cleanCnpj.length !== 14 || /^(\d)\1{13}$/.test(cleanCnpj)) {
    return false;
  }
  
  let length = cleanCnpj.length - 2;
  let numbers = cleanCnpj.substring(0, length);
  const digits = cleanCnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  length = length + 1;
  numbers = cleanCnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

module.exports = {
  logger,
  logError,
  logEvent,
  apiResponse,
  errorResponse,
  successResponse,
  isValidEthereumAddress,
  formatCurrency,
  generateId,
  isValidCPF,
  isValidCNPJ
};
/**
 * Constants and configuration for QI Credit Platform
 */

// File Upload Limits and Validation
const FILE_SIZE_LIMITS = {
  DOCUMENTS: 8 * 1024 * 1024, // 8MB
  CONTRACTS: 10 * 1024 * 1024, // 10MB
  KYC: 5 * 1024 * 1024, // 5MB
  'USER-PROFILES': 2 * 1024 * 1024, // 2MB
  'LOAN-DOCUMENTS': 10 * 1024 * 1024, // 10MB
  'CREDIT-ANALYSIS': 8 * 1024 * 1024, // 8MB
  'AUDIT-FILES': 50 * 1024 * 1024, // 50MB
  'TEMPORARY-FILES': 10 * 1024 * 1024, // 10MB
  DEFAULT: 5 * 1024 * 1024, // 5MB default
};

const ALLOWED_MIME_TYPES = {
  DOCUMENTS: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'text/plain'],
  CONTRACTS: ['application/pdf'],
  KYC: ['image/jpeg', 'image/png', 'image/jpg'],
  'KYC-DOCUMENTS': ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  'USER-PROFILES': ['image/jpeg', 'image/png', 'image/jpg'],
  'LOAN-DOCUMENTS': ['application/pdf', 'image/jpeg', 'image/png'],
  'CREDIT-ANALYSIS': ['application/pdf', 'text/csv', 'application/json'],
  'AUDIT-FILES': ['application/pdf', 'text/csv', 'application/json', 'text/plain'],
  'TEMPORARY-FILES': ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'],
};

const ALLOWED_FILE_EXTENSIONS = {
  DOCUMENTS: ['.pdf', '.jpg', '.jpeg', '.png', '.txt'],
  CONTRACTS: ['.pdf'],
  KYC: ['.jpg', '.jpeg', '.png'],
  'KYC-DOCUMENTS': ['.jpg', '.jpeg', '.png', '.pdf'],
  'USER-PROFILES': ['.jpg', '.jpeg', '.png'],
  'LOAN-DOCUMENTS': ['.pdf', '.jpg', '.jpeg', '.png'],
  'CREDIT-ANALYSIS': ['.pdf', '.csv', '.json'],
  'AUDIT-FILES': ['.pdf', '.csv', '.json', '.txt'],
  'TEMPORARY-FILES': ['.pdf', '.jpg', '.jpeg', '.png', '.txt'],
};

// Loan Status Constants
const LOAN_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  DEFAULTED: 'DEFAULTED',
  CANCELLED: 'CANCELLED',
};

const LOAN_STATUS_TRANSITIONS = {
  DRAFT: ['PENDING', 'CANCELLED'],
  PENDING: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['COMPLETED', 'DEFAULTED'],
  COMPLETED: [],
  DEFAULTED: [],
  CANCELLED: [],
};

// Marketplace Offer Status
const OFFER_STATUS = {
  OPEN: 'OPEN',
  MATCHED: 'MATCHED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};

// Credit Analysis Status
const CREDIT_ANALYSIS_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ERROR: 'ERROR',
};

// KYC Verification Status
const KYC_STATUS = {
  PENDING: 'PENDING',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
};

// Risk Levels
const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY_HIGH',
};

// Transaction Types
const TRANSACTION_TYPES = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  TRANSFER: 'TRANSFER',
  LOAN_DISBURSEMENT: 'LOAN_DISBURSEMENT',
  LOAN_REPAYMENT: 'LOAN_REPAYMENT',
  FEE: 'FEE',
  REFUND: 'REFUND',
};

// Escrow Event Types
const ESCROW_EVENT_TYPES = {
  CREATED: 'ESCROW_CREATED',
  DEPOSIT: 'ESCROW_DEPOSIT',
  RELEASED: 'ESCROW_RELEASED',
  REFUNDED: 'ESCROW_REFUNDED',
  DISPUTE: 'ESCROW_DISPUTE',
  RESOLVED: 'ESCROW_RESOLVED',
};

// Audit Action Types
const AUDIT_ACTION_TYPES = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  CANCEL: 'CANCEL',
};

// User Roles
const USER_ROLES = {
  ADMIN: 'ADMIN',
  BORROWER: 'BORROWER',
  LENDER: 'LENDER',
  INVESTOR: 'INVESTOR',
  OPERATOR: 'OPERATOR',
};

// API Rate Limits
const RATE_LIMITS = {
  DEFAULT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window (increased for testing)
  },
  UPLOAD: {
    windowMs: 15 * 60 * 1000,
    max: 30, // 30 uploads per 15 minutes (increased for testing)
  },
  AUTH: {
    windowMs: 15 * 60 * 1000,
    max: 50, // 50 auth requests per 15 minutes (increased for testing)
  },
  SENSITIVE: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 requests per hour for sensitive operations
  },
};

// Timeouts
const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  DATABASE_QUERY: 10000, // 10 seconds
  FILE_UPLOAD: 60000, // 60 seconds
  BLOCKCHAIN_TRANSACTION: 120000, // 2 minutes
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Credit Score Ranges
const CREDIT_SCORE_RANGES = {
  EXCELLENT: { min: 800, max: 850 },
  VERY_GOOD: { min: 740, max: 799 },
  GOOD: { min: 670, max: 739 },
  FAIR: { min: 580, max: 669 },
  POOR: { min: 300, max: 579 },
};

// Interest Rate Ranges (annual %)
const INTEREST_RATE_RANGES = {
  MIN: 0.5, // 0.5%
  MAX: 15.0, // 15%
  DEFAULT: 2.32, // 2.32%
};

// Loan Amount Ranges
const LOAN_AMOUNT_RANGES = {
  MIN: 1000, // R$ 10,00 (in cents)
  MAX: 100000000, // R$ 1,000,000.00 (in cents)
};

// Loan Term Ranges (in days)
const LOAN_TERM_RANGES = {
  MIN: 30, // 1 month
  MAX: 1080, // 36 months
  DEFAULT: 180, // 6 months
};

// Document Types
const DOCUMENT_TYPES = {
  CPF: 'CPF',
  CNPJ: 'CNPJ',
  RG: 'RG',
  CNH: 'CNH',
  PASSPORT: 'PASSPORT',
  PROOF_OF_ADDRESS: 'PROOF_OF_ADDRESS',
  PROOF_OF_INCOME: 'PROOF_OF_INCOME',
  BANK_STATEMENT: 'BANK_STATEMENT',
};

// Regex Patterns
const REGEX_PATTERNS = {
  CPF: /^\d{11}$/,
  CNPJ: /^\d{14}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10,11}$/,
  CEP: /^\d{8}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

// Error Messages
const ERROR_MESSAGES = {
  // Authentication
  UNAUTHORIZED: 'Não autorizado',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  TOKEN_EXPIRED: 'Token expirado',
  SESSION_EXPIRED: 'Sessão expirada',

  // Validation
  REQUIRED_FIELD: 'Campo obrigatório',
  INVALID_FORMAT: 'Formato inválido',
  INVALID_FILE_TYPE: 'Tipo de arquivo não permitido',
  FILE_TOO_LARGE: 'Arquivo muito grande',
  INVALID_FILE_EXTENSION: 'Extensão de arquivo não permitida',

  // Database
  NOT_FOUND: 'Recurso não encontrado',
  ALREADY_EXISTS: 'Recurso já existe',
  DATABASE_ERROR: 'Erro no banco de dados',

  // Business Logic
  INSUFFICIENT_FUNDS: 'Fundos insuficientes',
  LOAN_NOT_ACTIVE: 'Empréstimo não está ativo',
  INVALID_STATUS_TRANSITION: 'Transição de status inválida',
  KYC_NOT_APPROVED: 'KYC não aprovado',
  CREDIT_LIMIT_EXCEEDED: 'Limite de crédito excedido',

  // Server
  INTERNAL_SERVER_ERROR: 'Erro interno do servidor',
  SERVICE_UNAVAILABLE: 'Serviço indisponível',
};

// Success Messages
const SUCCESS_MESSAGES = {
  CREATED: 'Criado com sucesso',
  UPDATED: 'Atualizado com sucesso',
  DELETED: 'Deletado com sucesso',
  UPLOADED: 'Upload realizado com sucesso',
  SENT: 'Enviado com sucesso',
};

module.exports = {
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
  ALLOWED_FILE_EXTENSIONS,
  LOAN_STATUS,
  LOAN_STATUS_TRANSITIONS,
  OFFER_STATUS,
  CREDIT_ANALYSIS_STATUS,
  KYC_STATUS,
  RISK_LEVELS,
  TRANSACTION_TYPES,
  ESCROW_EVENT_TYPES,
  AUDIT_ACTION_TYPES,
  USER_ROLES,
  RATE_LIMITS,
  TIMEOUTS,
  PAGINATION,
  CREDIT_SCORE_RANGES,
  INTEREST_RATE_RANGES,
  LOAN_AMOUNT_RANGES,
  LOAN_TERM_RANGES,
  DOCUMENT_TYPES,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};

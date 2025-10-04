const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({ 
        success: false, 
        error: 'Validation error',
        details: errors
      });
    }
    
    req.validatedBody = value;
    next();
  };
};

// Schemas for different endpoints
const schemas = {
  // Credit Analysis Schemas
  individualCreditAnalysis: Joi.object({
    document: Joi.string().required().messages({
      'string.base': 'Document must be a string',
      'string.empty': 'Document is required',
      'any.required': 'Document is required'
    }),
    name: Joi.string().required().min(2).max(100).messages({
      'string.base': 'Name must be a string',
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.base': 'Email must be a string',
      'string.email': 'Please provide a valid email',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
    phone: Joi.string().optional(),
    birthDate: Joi.date().iso().optional(),
    monthlyIncome: Joi.number().positive().required().messages({
      'number.base': 'Monthly income must be a number',
      'number.positive': 'Monthly income must be a positive number',
      'any.required': 'Monthly income is required'
    }),
    address: Joi.object().optional(),
    userId: Joi.string().optional()
  }),
  
  businessCreditAnalysis: Joi.object({
    document: Joi.string().required(),
    corporateName: Joi.string().required().min(2).max(100),
    tradingName: Joi.string().optional().min(2).max(100),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    monthlyRevenue: Joi.number().positive().required(),
    cnae: Joi.string().optional(),
    address: Joi.object().optional(),
    userId: Joi.string().optional()
  }),
  
  // Banking Schemas
  createAccount: Joi.object({
    document: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    address: Joi.object().optional(),
    userId: Joi.string().optional(),
    type: Joi.string().valid('individual', 'business').default('individual')
  }),
  
  createPixTransaction: Joi.object({
    amount: Joi.number().positive().required(),
    description: Joi.string().optional(),
    payer: Joi.object({
      document: Joi.string().required(),
      name: Joi.string().required()
    }).required(),
    receiver: Joi.object({
      document: Joi.string().required(),
      name: Joi.string().required(),
      key: Joi.string().required()
    }).required()
  }),
  
  issueBoleto: Joi.object({
    amount: Joi.number().positive().required(),
    description: Joi.string().optional(),
    payer: Joi.object({
      name: Joi.string().required(),
      document: Joi.string().required(),
      email: Joi.string().email().required(),
      address: Joi.object().required()
    }).required(),
    dueDate: Joi.date().iso().required(),
    instructions: Joi.string().optional(),
    userId: Joi.string().optional(),
    type: Joi.string().optional()
  }),
  
  // Lending Schemas
  createCreditContract: Joi.object({
    borrower: Joi.object({
      document: Joi.string().required(),
      name: Joi.string().required(),
      email: Joi.string().email().required()
    }).required(),
    loanAmount: Joi.number().positive().required(),
    interestRate: Joi.number().min(0).max(100).required(),
    term: Joi.number().integer().min(1).max(360).required(),
    contractType: Joi.string().valid('CCB', 'CCI', 'CCE').default('CCB'),
    description: Joi.string().optional(),
    userId: Joi.string().optional(),
    loanId: Joi.string().optional()
  }),
  
  notifyPayment: Joi.object({
    paymentId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    date: Joi.date().iso().required(),
    method: Joi.string().required(),
    reference: Joi.string().optional()
  }),
  
  assignContract: Joi.object({
    fundId: Joi.string().required(),
    assignmentPercentage: Joi.number().min(0).max(100).required(),
    effectiveDate: Joi.date().iso().required(),
    metadata: Joi.object().optional()
  }),
  
  // Blockchain Schemas
  depositToEscrow: Joi.object({
    escrowId: Joi.string().required(),
    borrowerAddress: Joi.string().required(),
    lenderAddress: Joi.string().required(),
    arbitratorAddress: Joi.string().required(),
    amount: Joi.number().positive().required()
  }),
  
  // General schemas
  calculateLoanSchedule: Joi.object({
    loanAmount: Joi.number().positive().required(),
    interestRate: Joi.number().min(0).max(100).required(),
    term: Joi.number().integer().min(1).max(360).required()
  })
};

module.exports = {
  validate,
  schemas
};
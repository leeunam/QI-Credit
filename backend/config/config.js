// Database and API configuration
module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'qicredit_db',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  ESCROW_CONTRACT_ADDRESS: process.env.ESCROW_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ADDRESS: process.env.TOKEN_CONTRACT_ADDRESS,
  BLOCKCHAIN_MOCK_MODE: process.env.BLOCKCHAIN_MOCK_MODE || 'false', // Default to false
  
  // QITech API Configuration
  QITECH_API_KEY: process.env.QITECH_API_KEY,
  QITECH_CREDIT_ANALYSIS_URL: process.env.QITECH_CREDIT_ANALYSIS_URL || 'https://api.sandbox.caas.qitech.app/credit_analysis/',
  QITECH_BANKING_URL: process.env.QITECH_BANKING_URL || 'https://api.sandbox.caas.qitech.app/banking/',
  QITECH_LAAS_URL: process.env.QITECH_LAAS_URL || 'https://api.sandbox.caas.qitech.app/laas/',
  QITECH_FRAUD_URL: process.env.QITECH_FRAUD_URL || 'https://api.sandbox.caas.qitech.app/fraud/',
  QITECH_OPEN_FINANCE_URL: process.env.QITECH_OPEN_FINANCE_URL || 'https://api.sandbox.caas.qitech.app/open-finance/',
  QITECH_WEBHOOK_SECRET: process.env.QITECH_WEBHOOK_SECRET,
  QITECH_MOCK_MODE: process.env.QITECH_MOCK_MODE || 'false', // Default to false
};
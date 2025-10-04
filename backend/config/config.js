require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Estrutura que database.js espera
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  // Blockchain
  blockchain: {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
    privateKey: process.env.PRIVATE_KEY,
    escrowAddress: process.env.ESCROW_CONTRACT_ADDRESS,
    tokenAddress: process.env.TOKEN_CONTRACT_ADDRESS,
    mockMode: process.env.BLOCKCHAIN_MOCK_MODE === 'true',
  },

  // QITech
  qitech: {
    apiKey: process.env.QITECH_API_KEY,
    creditUrl:
      process.env.QITECH_CREDIT_ANALYSIS_URL ||
      'https://api.sandbox.caas.qitech.app/credit_analysis/',
    bankingUrl:
      process.env.QITECH_BANKING_URL ||
      'https://api.sandbox.caas.qitech.app/banking/',
    laasUrl:
      process.env.QITECH_LAAS_URL ||
      'https://api.sandbox.caas.qitech.app/laas/',
    fraudUrl:
      process.env.QITECH_FRAUD_URL ||
      'https://api.sandbox.caas.qitech.app/fraud/',
    openFinanceUrl:
      process.env.QITECH_OPEN_FINANCE_URL ||
      'https://api.sandbox.caas.qitech.app/open-finance/',
    webhookSecret: process.env.QITECH_WEBHOOK_SECRET,
    mockMode: process.env.QITECH_MOCK_MODE === 'true',
  },

  // Supabase (adicionado)
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: process.env.SUPABASE_ANON_KEY,
    mockMode: process.env.STORAGE_MOCK_MODE === 'true',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret',
  },
};

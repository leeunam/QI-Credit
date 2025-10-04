const BaseModel = require('./baseModel');
const User = require('./userModel');
const MarketplaceOffer = require('./mktplaceOffer');
const Loan = require('./loanModel');
const EscrowTransaction = require('./escrowtransactionModel');
const DigitalAccount = require('./digitalaccountModel');
const CreditAnalysis = require('./creditanalysisModel');
const KycVerification = require('./kycverificationModel');

module.exports = {
  BaseModel,
  User,
  MarketplaceOffer,
  Loan,
  EscrowTransaction,
  DigitalAccount,
  CreditAnalysis,
  KycVerification
};
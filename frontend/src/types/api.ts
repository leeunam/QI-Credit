/**
 * Tipos compartilhados para comunicação com a API backend
 *
 * Este arquivo contém interfaces TypeScript que correspondem aos
 * contratos da API definidos no backend.
 */

// ============================================================================
// RESPOSTAS GENÉRICAS DA API
// ============================================================================

/**
 * Formato padrão de resposta da API
 * Usado pela maioria dos endpoints do backend
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  details?: ValidationError[];
}

/**
 * Erro de validação retornado pela API
 */
export interface ValidationError {
  field?: string;
  message: string;
  value?: any;
}

/**
 * Resposta paginada da API
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// AUTENTICAÇÃO (/api/auth)
// ============================================================================

/**
 * Dados do usuário autenticado
 */
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at?: string;
  last_login?: string;
}

/**
 * Tokens JWT retornados pelo backend
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // segundos
  tokenType: 'Bearer';
}

/**
 * Resposta do endpoint de login/register
 */
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

/**
 * Credenciais de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Dados para registro de novo usuário
 */
export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: 'user' | 'admin';
}

// ============================================================================
// ONBOARDING & KYC (/api/onboarding)
// ============================================================================

/**
 * Status do processo de onboarding
 */
export type OnboardingStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'denied'
  | 'incomplete';

/**
 * Status de verificação KYC
 */
export type KYCStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'denied'
  | 'requires_resubmission';

/**
 * Dados de verificação de identidade
 */
export interface KYCVerificationData {
  userId: string;
  documentType: 'cpf' | 'cnpj' | 'rg' | 'cnh';
  documentNumber: string;
  documentImage: File | string; // File para upload, string para base64
  faceImage?: File | string;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
}

/**
 * Resultado da verificação KYC
 */
export interface KYCVerificationResult {
  kycStatus: KYCStatus;
  overallStatus: OnboardingStatus;
  score?: number;
  checks: {
    documentValid: boolean;
    faceMatch: boolean;
    livenessCheck: boolean;
    fraudScore: number;
  };
  reason?: string;
  updatedAt: string;
}

/**
 * Status completo do onboarding
 */
export interface OnboardingStatusData {
  userId: string;
  status: OnboardingStatus;
  kycStatus: KYCStatus;
  steps: {
    registration: boolean;
    documentUpload: boolean;
    faceVerification: boolean;
    kycVerification: boolean;
    completed: boolean;
  };
  reason?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// ============================================================================
// ANÁLISE DE CRÉDITO (/api/qitech/credit & /api/credit-analysis)
// ============================================================================

/**
 * Nível de risco de crédito
 */
export type CreditRiskLevel = 'low' | 'medium' | 'high' | 'very_high';

/**
 * Status da análise de crédito
 */
export type CreditAnalysisStatus =
  | 'pending'
  | 'analyzing'
  | 'approved'
  | 'denied'
  | 'requires_review';

/**
 * Dados para submissão de análise de crédito individual
 */
export interface IndividualCreditAnalysisData {
  userId: string;
  document: string; // CPF
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  monthlyIncome: number;
  requestedAmount: number;
  loanPurpose: string;
  employmentStatus?: 'employed' | 'self_employed' | 'unemployed' | 'retired';
  address?: {
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

/**
 * Score de crédito do usuário
 */
export interface CreditScore {
  userId: string;
  score: number; // 0-1000
  scoreDate: string;
  riskLevel: CreditRiskLevel;
  approvedAmount: number;
  suggestedInterestRate: number; // taxa anual %
  analysis: {
    paymentHistory: string;
    debtRatio: string;
    creditUtilization: string;
    accountAge: string;
    recentInquiries: string;
  };
  factors: {
    positive: string[];
    negative: string[];
  };
}

/**
 * Resultado da análise de crédito
 */
export interface CreditAnalysisResult {
  id: string;
  analysisStatus: CreditAnalysisStatus;
  userId: string;
  requestedAmount: number;
  approvedAmount: number;
  interestRate: number; // % anual
  numberOfInstallments: number;
  monthlyPayment: number;
  totalAmount: number;
  score: number;
  riskLevel: CreditRiskLevel;
  decisionDetails: {
    reason: string;
    factors: string[];
    recommendations?: string[];
  };
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

// ============================================================================
// BANKING (/api/qitech/banking)
// ============================================================================

/**
 * Status de conta digital
 */
export type AccountStatus = 'active' | 'inactive' | 'blocked' | 'pending_activation';

/**
 * Tipo de conta
 */
export type AccountType = 'checking' | 'savings' | 'payment';

/**
 * Dados para criação de conta digital
 */
export interface CreateDigitalAccountData {
  userId: string;
  document: string; // CPF/CNPJ
  name: string;
  email: string;
  phone: string;
  accountType?: AccountType;
}

/**
 * Conta digital
 */
export interface DigitalAccount {
  id: string;
  accountId: string;
  userId: string;
  agencyNumber: string;
  accountNumber: string;
  accountDigit: string;
  bankCode: string;
  bankName: string;
  accountType: AccountType;
  status: AccountStatus;
  balance: number;
  availableBalance: number;
  blockedBalance: number;
  pixKeys: PixKey[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Chave PIX
 */
export interface PixKey {
  keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  keyValue: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

/**
 * Dados para transação PIX
 */
export interface PixTransactionData {
  accountId: string;
  amount: number;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  description?: string;
}

/**
 * Transação PIX
 */
export interface PixTransaction {
  id: string;
  transactionId: string;
  accountId: string;
  amount: number;
  pixKey: string;
  pixKeyType: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

// ============================================================================
// LENDING (/api/qitech/lending)
// ============================================================================

/**
 * Status do contrato de empréstimo
 */
export type LoanContractStatus =
  | 'draft'
  | 'pending_signature'
  | 'active'
  | 'completed'
  | 'defaulted'
  | 'cancelled';

/**
 * Dados para criação de contrato de empréstimo
 */
export interface CreateLoanContractData {
  borrowerId: string;
  lenderId?: string;
  amount: number;
  interestRate: number; // % anual
  numberOfInstallments: number;
  firstDueDate: string; // YYYY-MM-DD
  purpose?: string;
  collateral?: string;
}

/**
 * Contrato de empréstimo
 */
export interface LoanContract {
  id: string;
  contractId: string;
  borrowerId: string;
  lenderId?: string;
  amount: number;
  interestRate: number;
  numberOfInstallments: number;
  installmentAmount: number;
  totalAmount: number;
  outstandingBalance: number;
  firstDueDate: string;
  lastDueDate: string;
  status: LoanContractStatus;
  signedAt?: string;
  disbursedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cronograma de pagamento
 */
export interface PaymentSchedule {
  installmentNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  paidAt?: string;
  paidAmount?: number;
}

/**
 * Resultado do cálculo de cronograma
 */
export interface CalculateScheduleResult {
  amount: number;
  interestRate: number;
  numberOfInstallments: number;
  installmentAmount: number;
  totalInterest: number;
  totalAmount: number;
  schedule: PaymentSchedule[];
}

// ============================================================================
// BLOCKCHAIN (/api/blockchain)
// ============================================================================

/**
 * Status de escrow blockchain
 */
export type EscrowStatus =
  | 'created'
  | 'funded'
  | 'released'
  | 'refunded'
  | 'disputed';

/**
 * Dados do saldo da carteira
 */
export interface WalletBalance {
  address: string;
  balance: string; // Em wei
  balanceEth: string; // Em ETH
  tokenBalance?: string;
  network: string;
}

/**
 * Dados para depósito em escrow
 */
export interface EscrowDepositData {
  amount: number;
  recipientAddress: string;
  contractId: string;
  releaseTime?: number; // timestamp
}

/**
 * Status do escrow
 */
export interface EscrowStatusData {
  address: string;
  status: EscrowStatus;
  amount: string;
  amountEth: string;
  sender: string;
  recipient: string;
  releaseTime?: number;
  createdAt: string;
  releasedAt?: string;
  refundedAt?: string;
}

/**
 * Detalhes da transação blockchain
 */
export interface BlockchainTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueEth: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  timestamp?: number;
  gasUsed?: string;
  gasFee?: string;
}

// ============================================================================
// STORAGE (/api/storage)
// ============================================================================

/**
 * Resultado do upload de arquivo
 */
export interface UploadFileResult {
  fileId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

/**
 * Metadados do arquivo
 */
export interface FileMetadata {
  fileId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  userId?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MARKETPLACE (Futuro - ainda não implementado no backend)
// ============================================================================

/**
 * Perfil de risco de oferta de crédito
 */
export type RiskProfile = 'Baixo Risco' | 'Médio Risco' | 'Alto Risco';

/**
 * Oferta de crédito no marketplace
 */
export interface CreditOffer {
  id: string;
  amount: number;
  interestRate: number;
  term: number; // meses
  borrowerId: string;
  borrowerScore: number;
  riskProfile: RiskProfile;
  purpose?: string;
  monthlyReturn?: number;
  totalReturn?: number;
  status: 'available' | 'funded' | 'completed' | 'defaulted';
  createdAt: string;
  fundedAt?: string;
}

/**
 * Filtros para busca de ofertas
 */
export interface MarketplaceFilters {
  minAmount?: number;
  maxAmount?: number;
  minInterestRate?: number;
  maxInterestRate?: number;
  term?: number;
  riskProfile?: RiskProfile;
  borrowerMinScore?: number;
}

// ============================================================================
// INVESTOR DASHBOARD (Futuro - ainda não implementado no backend)
// ============================================================================

/**
 * Métricas do investidor
 */
export interface InvestmentMetrics {
  totalInvested: number;
  totalReturn: number;
  activeInvestmentsCount: number;
  completedInvestmentsCount: number;
  defaultRate: number; // percentual
  averageReturn: number; // percentual
}

/**
 * Histórico de retornos
 */
export interface ReturnHistory {
  date: string;
  label: string;
  value: number;
}

/**
 * Investimento ativo
 */
export interface ActiveInvestment {
  id: string;
  offerId: string;
  amount: number;
  interestRate: number;
  term: number;
  borrowerScore: number;
  riskProfile: RiskProfile;
  status: 'active' | 'completed' | 'defaulted';
  nextPaymentDate: string;
  accumulatedReturn: number;
  startDate: string;
  expectedEndDate: string;
}

/**
 * Dados do dashboard do investidor
 */
export interface InvestorDashboardData {
  metrics: InvestmentMetrics;
  returnHistory: ReturnHistory[];
  activeInvestments: ActiveInvestment[];
}

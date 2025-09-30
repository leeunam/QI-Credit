# Backend Documentation

## Summary
1. [Overview](#overview)
2. [Backend Architecture](#backend-architecture)
3. [QITech API Integrations](#qitech-api-integrations)
4. [Blockchain Integration](#blockchain-integration)
5. [Folder Structure](#folder-structure)
6. [Implemented Services](#implemented-services)
7. [Available Endpoints](#available-endpoints)
8. [Data Models](#data-models)
9. [How to Use](#how-to-use)
10. [Configuration and Environment Variables](#configuration-and-environment-variables)
11. [Security and Best Practices](#security-and-best-practices)
12. [Error Handling and Logging](#error-handling-and-logging)

## Overview

The QI Credit backend is a robust and modular solution developed in Node.js that provides a complete integration layer with QITech financial APIs and blockchain services. This backend enables operations such as credit analysis, banking services (Pix and boletos), loan contracts, and blockchain operations.

### Project Objectives
- Integration with QITech APIs for credit analysis, banking as a service, and lending as a service
- Integration with blockchain for escrow and token operations
- Provision of RESTful endpoints for the frontend
- Asynchronous processing of webhooks and events
- Modular and scalable architecture

## Backend Architecture

### Architecture Pattern
The backend follows a layered architecture pattern:

```
┌─────────────────┐    ┌──────────────────────┐
│   Controllers   │    │     Services         │
│                 │◄──►│                      │
│  (Business     │    │  (API Integration,   │
│   Logic)       │    │   Blockchain, etc.)  │
└─────────────────┘    └──────────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌──────────────────────┐
│   Middlewares   │    │   External APIs      │
│                 │    │   (QITech, Blockchain)│
│  (Auth,         │    │                      │
│   Validation)   │    │                      │
└─────────────────┘    └──────────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐    ┌──────────────────────┐
│     Routes      │    │      Database        │
│                 │    │                      │
│  (RESTful      │    │  (To be integrated)  │
│   Endpoints)    │    │                      │
└─────────────────┘    └──────────────────────┘
```

### Main Components
- **Controllers**: Contain specific business logic for each domain (credit, banking, lending, blockchain)
- **Services**: Integration layer with external APIs and blockchain
- **Middlewares**: Authentication, validation, and error handling middleware
- **Routes**: Definition of RESTful endpoints
- **Models**: Internal data representation models

## QITech API Integrations

### 1. Credit Analysis API
- **Base URL**: `QITECH_CREDIT_ANALYSIS_URL`
- **Features**:
  - Submission of proposals for individuals and businesses
  - Analysis status updates
  - Credit score consultation

### 2. Banking as a Service (BaaS) API
- **Base URL**: `QITECH_BANKING_URL`
- **Features**:
  - Creation and management of digital accounts
  - Pix transaction creation
  - Boleto issuance and management

### 3. Lending as a Service (LaaS) API
- **Base URL**: `QITECH_LAAS_URL`
- **Features**:
  - Creation of credit contracts (CCB, CCI, CCE)
  - Electronic signature process
  - Payment and installment management
  - Contract assignment to funds

### 4. Other QITech APIs
- **Antifraud and KYC API**: Identity verification and fraud analysis
- **Open Finance API**: Consultation of bank accounts and transactions

## Blockchain Integration

### Technology Used
- **Ethers.js**: Library for blockchain interaction
- **Supported Networks**: Gnosis, Arbitrum (configurable)
- **Smart Contracts**: Escrow contracts for transaction guarantee

### Features
- **Escrow Deposit**: Secure fund storage during operations
- **Fund Release**: Controlled fund transfer after condition fulfillment
- **Fund Refund**: Fund return in case of operation failure
- **Token Minting**: Creation of tokens for rewards or asset representation
- **Token Transfer**: Movement of tokens between wallets
- **Event Monitoring**: Real-time event listening for state updates

## Folder Structure

```
backend/
├── config/                  # Configuration files
├── controllers/            # Business logic
│   ├── creditAnalysisController.js
│   ├── bankingController.js
│   └── lendingController.js
├── services/               # External API integrations
│   ├── creditAnalysisService.js
│   ├── bankingAsAService.js
│   ├── lendingAsAService.js
│   ├── blockchainService.js
│   └── webhookHandler.js
├── middlewares/            # Authentication and validation middleware
│   ├── auth.js
│   └── validation.js
├── models/                 # Data models
│   ├── User.js
│   ├── CreditAnalysis.js
│   └── LoanContract.js
├── utils/                  # Utility functions
│   └── helpers.js
├── routes/                 # Endpoint definitions
│   ├── creditAnalysisRoutes.js
│   ├── bankingRoutes.js
│   ├── lendingRoutes.js
│   ├── blockchainRoutes.js
│   └── webhookRoutes.js
├── app.js                  # Main application configuration
├── server.js               # HTTP server
└── package.json            # Dependencies and scripts
```

## Implemented Services

### 1. CreditAnalysisService
Responsible for interaction with the QITech credit analysis API.

**Main Functions:**
- `submitIndividualCreditAnalysis()`: Submits credit analysis for individuals
- `submitBusinessCreditAnalysis()`: Submits credit analysis for businesses
- `getCreditScore()`: Retrieves user credit score
- `updateCreditAnalysisStatus()`: Updates credit analysis status

### 2. BankingAsAService
Manages banking operations through the QITech API.

**Main Functions:**
- `createDigitalAccount()`: Creates digital account for users
- `createPixTransaction()`: Performs Pix transactions
- `issueBoleto()`: Issues bank boletos
- `processPixWebhook()`: Processes Pix payment webhooks

### 3. LendingAsAService
Manages loan contracts and operations.

**Main Functions:**
- `createCreditContract()`: Creates credit contracts
- `triggerContractSignature()`: Initiates electronic signature process
- `notifyContractPayment()`: Notifies installment payment
- `calculateLoanSchedule()`: Calculates payment schedule

### 4. BlockchainService
Interacts with smart contracts on the blockchain.

**Main Functions:**
- `depositToEscrow()`: Deposits funds in escrow
- `releaseFundsFromEscrow()`: Releases funds from escrow
- `refundFundsFromEscrow()`: Refunds funds from escrow
- `transferTokens()`: Transfers tokens
- `getEscrowStatus()`: Consults escrow status

### 5. WebhookHandler
Processes asynchronous webhooks from external APIs.

**Main Functions:**
- `processWebhook()`: Processes QITech webhooks
- `verifyQitechSignature()`: Verifies webhook signatures
- `processBlockchainEvent()`: Processes blockchain events

## Available Endpoints

### QITech Credit API
```
POST /api/qitech/credit/individual    # Individual credit analysis
POST /api/qitech/credit/business     # Business credit analysis
GET /api/qitech/credit/score/:userId # Credit score
PUT /api/qitech/credit/status/:id    # Update status
POST /api/qitech/credit/apply        # Complete loan application
```

### QITech Banking API
```
POST /api/qitech/banking/accounts     # Create digital account
GET /api/qitech/banking/accounts/:id # Consult account
POST /api/qitech/banking/pix          # Create Pix transaction
POST /api/qitech/banking/boletos      # Issue boleto
GET /api/qitech/banking/boletos/:id   # Consult boleto
```

### QITech Lending API
```
POST /api/qitech/lending/contracts              # Create contract
POST /api/qitech/lending/contracts/:id/sign     # Sign contract
GET /api/qitech/lending/contracts/:id/payments  # Consult payments
POST /api/qitech/lending/contracts/:id/payments # Notify payment
POST /api/qitech/lending/calculate-schedule     # Calculate schedule
```

### Blockchain API
```
GET /api/blockchain/wallet/balance              # Wallet balance
POST /api/blockchain/escrow/deposit             # Deposit to escrow
POST /api/blockchain/escrow/:address/release    # Release funds
POST /api/blockchain/escrow/:address/refund     # Refund funds
GET /api/blockchain/escrow/:address             # Escrow status
POST /api/blockchain/tokens/mint                # Mint tokens
POST /api/blockchain/tokens/transfer            # Token transfer
GET /api/blockchain/tokens/:address             # Token balance
GET /api/blockchain/transactions/:hash          # Transaction details
```

### Webhooks
```
POST /api/webhooks/qitech      # QITech webhooks
POST /api/webhooks/blockchain  # Blockchain webhooks
```

## Data Models

### User
Represents a system user.

```javascript
{
  id: string,
  document: string,
  name: string,
  email: string,
  phone: string,
  birthDate: Date,
  monthlyIncome: number,
  address: object,
  creditScore: number,
  createdAt: Date,
  updatedAt: Date
}
```

### CreditAnalysis
Represents a credit analysis.

```javascript
{
  id: string,
  userId: string,
  document: string,
  analysisType: 'individual' | 'business',
  status: 'pending' | 'processing' | 'completed' | 'failed',
  score: number,
  providerId: string,
  result: object,
  metadata: object,
  createdAt: Date,
  updatedAt: Date
}
```

### LoanContract
Represents a loan contract.

```javascript
{
  id: string,
  contractId: string,
  borrowerId: string,
  lenderId: string,
  amount: number,
  interestRate: number,
  installments: number,
  status: 'draft' | 'awaiting_signature' | 'signed' | 'funded' | 'active' | 'completed' | 'defaulted',
  contractType: 'CCB' | 'CCI' | 'CCE',
  startDate: Date,
  endDate: Date,
  repaymentSchedule: array,
  blockchainContractAddress: string,
  createdAt: Date,
  updatedAt: Date
}
```

### DigitalAccount
Represents a digital banking account.

```javascript
{
  id: string,
  accountId: string,
  userId: string,
  agencyNumber: string,
  accountNumber: string,
  accountDigit: string,
  bankCode: string,
  bankName: string,
  accountType: string,
  status: 'pending' | 'active' | 'inactive' | 'closed',
  pixKeys: array,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction
Represents a financial transaction.

```javascript
{
  id: string,
  transactionId: string,
  accountId: string,
  type: 'pix' | 'boleto' | 'transfer' | 'deposit',
  amount: number,
  currency: string,
  status: 'pending' | 'processed' | 'completed' | 'failed' | 'cancelled',
  description: string,
  reference: string,
  createdAt: Date,
  updatedAt: Date
}
```

## How to Use

### Prerequisites
Before using the backend, ensure you have:
- **Node.js** (version 16 or higher)
- **npm** (usually installed with Node.js)
- **Git** (for cloning/managing the repository)

### Installation
1. Clone the repository:
```bash
git clone https://github.com/your-repo/qi-credit.git
cd qi-credit/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Running the Server
#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

### API Testing
Use tools like Postman, Insomnia, or curl to test the endpoints:

#### Health Check
```bash
curl http://localhost:3000/health
```

#### Create Digital Account
```bash
curl -X POST http://localhost:3000/api/qitech/banking/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "document": "12345678900",
    "name": "Fulano de Tal",
    "email": "fulano@example.com",
    "phone": {
      "area_code": "11",
      "number": "999999999"
    }
  }'
```

## Configuration and Environment Variables

### Required Variables
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qicredit_db
DB_USER=postgres
DB_PASSWORD=password

# QITech API Configuration
QITECH_API_KEY=your_api_key
QITECH_CREDIT_ANALYSIS_URL=https://api.sandbox.caas.qitech.app/credit_analysis/
QITECH_BANKING_URL=https://api.sandbox.caas.qitech.app/banking/
QITECH_LAAS_URL=https://api.sandbox.caas.qitech.app/laas/
QITECH_FRAUD_URL=https://api.sandbox.caas.qitech.app/fraud/
QITECH_OPEN_FINANCE_URL=https://api.sandbox.caas.qitech.app/open-finance/
QITECH_WEBHOOK_SECRET=your_webhook_secret

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://sepolia.scroll.io
PRIVATE_KEY=your_private_key
ESCROW_CONTRACT_ADDRESS=your_escrow_contract_address
TOKEN_CONTRACT_ADDRESS=your_token_contract_address

# Security Configuration
JWT_SECRET=your_jwt_secret
INTERNAL_API_KEY=your_internal_api_key
```

### Mock Mode Configuration
For development without real API keys:
```env
QITECH_MOCK_MODE=true
BLOCKCHAIN_MOCK_MODE=true
```

## Security and Best Practices

### Authentication
- **JWT Tokens**: Secure user authentication and session management
- **API Keys**: Protected endpoints with internal API keys
- **Rate Limiting**: Prevent abuse and DDoS attacks

### Data Protection
- **Encryption**: Sensitive data encrypted at rest and in transit
- **Input Validation**: Strict validation of all user inputs
- **CORS Policies**: Controlled cross-origin resource sharing

### Blockchain Security
- **Smart Contract Audits**: Regular security reviews of contracts
- **Multi-signature Wallets**: Enhanced security for fund management
- **Transaction Signing**: Secure private key management

## Error Handling and Logging

### Error Types
The backend implements comprehensive error handling for:
- **Validation Errors**: Invalid input data
- **Authentication Errors**: Unauthorized access attempts
- **API Errors**: External service failures
- **Database Errors**: Connection and query issues
- **Blockchain Errors**: Smart contract and network issues

### Logging
Logs are captured for:
- **Request/Response**: All API interactions
- **Errors**: Detailed error information
- **Performance**: Response times and system metrics
- **Security**: Suspicious activities and access attempts

### Monitoring
The system includes:
- **Health Checks**: Periodic system status verification
- **Metrics Collection**: Performance and usage statistics
- **Alerting**: Notification of critical issues
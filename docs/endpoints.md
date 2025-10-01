# QI Credit API Endpoints Documentation

This document provides a comprehensive guide to all available API endpoints in the QI Credit platform, including testing instructions for both mock and real modes.

## Base URL
All endpoints are relative to: `http://localhost:3000`

## Health Check Endpoint

### GET /health
Check if the server is running and responding.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-09-29T22:54:23.579Z"
}
```

## Onboarding API

### POST /api/onboarding/register
Register a new user in the system.

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string", 
  "email": "string",
  "password": "string",
  "phoneNumber": "string"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "userId": "string",
  "email": "string"
}
```

### POST /api/onboarding/verify
Verify user identity with document details.

**Request Body:**
```json
{
  "userId": "string",
  "documentType": "string",
  "documentNumber": "string",
  "documentImage": "string"
}
```

**Response:**
```json
{
  "userId": "string",
  "status": "VERIFIED",
  "message": "Identity verified successfully",
  "kycResult": { ... }
}
```

## QI Tech Mock API Endpoints

### POST /api/qitech/banking/accounts
Create a digital banking account (mock).

**Request Body:**
```json
{
  "document": "string",
  "name": "string",
  "email": "string",
  "phone": {
    "area_code": "string",
    "number": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "accountId": "string",
  "accountNumber": "string",
  "agencyNumber": "string",
  "pixKey": { ... },
  "status": "active"
}
```

### POST /api/qitech/credit/individual
Submit individual credit analysis (mock).

**Request Body:**
```json
{
  "document": "string",
  "name": "string",
  "email": "string",
  "monthly_income": "number",
  "financial": {
    "amount": "number",
    "number_of_installments": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "analysisId": "string",
  "status": "string",
  "approved_amount": "number",
  "interest_rate": "number",
  "number_of_installments": "number"
}
```

### POST /api/qitech/lending/contracts
Create a credit contract (mock).

**Request Body:**
```json
{
  "borrower_document": "string",
  "amount": "number",
  "interest_rate": "number",
  "installments": "number",
  "contract_type": "string"
}
```

**Response:**
```json
{
  "success": true,
  "contractId": "string",
  "status": "string",
  "amount": "number",
  "interest_rate": "number",
  "installments": "number"
}
```

### POST /api/qitech/lending/calculate-schedule
Calculate payment schedule for a loan.

**Request Body:**
```json
{
  "loanAmount": "number",
  "interestRate": "number",
  "term": "number"
}
```

**Response:**
```json
{
  "totalAmount": "number",
  "totalInterest": "number",
  "paymentAmount": "number",
  "schedule": [
    {
      "installment": "number",
      "dueDate": "string",
      "amount": "number",
      "principal": "number",
      "interest": "number",
      "balance": "number"
    }
  ]
}
```

## Fraud & KYC API Endpoints

### POST /api/qitech/fraud/kyc/verify
Complete KYC verification process.

**Request Body:**
```json
{
  "document": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "monthly_income": "number",
  "phone": "string",
  "ip": "string"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "string",
  "overallStatus": "string",
  "deviceScan": { ... },
  "fraudScore": { ... },
  "faceVerification": { ... }
}
```

### POST /api/qitech/fraud/device-scan
Perform device scan for fraud prevention.

**Request Body:**
```json
{
  "deviceInfo": { ... },
  "ip_address": "string",
  "fingerprint": "string"
}
```

### POST /api/qitech/fraud/score
Get antifraud score.

**Request Body:**
```json
{
  "document": "string",
  "transaction_data": { ... }
}
```

## Blockchain API Endpoints

### GET /api/blockchain/wallet/balance
Get blockchain wallet balance (mock).

**Response:**
```json
{
  "success": true,
  "address": "string",
  "balance": "string",
  "balanceWei": "string"
}
```

### POST /api/blockchain/tokens/transfer
Transfer tokens on blockchain (mock).

**Request Body:**
```json
{
  "toAddress": "string",
  "amount": "number"
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "string",
  "from": "string",
  "to": "string",
  "amount": "number"
}
```

### POST /api/blockchain/escrow/deposit
Deposit funds to escrow contract (mock).

**Request Body:**
```json
{
  "escrowId": "string",
  "borrowerAddress": "string",
  "lenderAddress": "string",
  "arbitratorAddress": "string",
  "amount": "number"
}
```

**Response:**
```json
{
  "success": true,
  "escrowContractAddress": "string",
  "transactionHash": "string",
  "escrowDetails": { ... }
}
```

### POST /api/blockchain/escrow/:address/release
Release funds from escrow contract (mock).

**Parameters:**
- `address`: Escrow contract address

**Response:**
```json
{
  "success": true,
  "transactionHash": "string",
  "status": "RELEASED"
}
```

### POST /api/blockchain/escrow/:address/refund
Refund funds from escrow contract (mock).

**Parameters:**
- `address`: Escrow contract address

**Response:**
```json
{
  "success": true,
  "transactionHash": "string",
  "status": "REFUNDED"
}
```

### GET /api/blockchain/escrow/:address
Get escrow contract status (mock).

**Parameters:**
- `address`: Escrow contract address

**Response:**
```json
{
  "success": true,
  "escrowDetails": { ... }
}
```

### POST /api/blockchain/tokens/mint
Mint new tokens (mock).

**Request Body:**
```json
{
  "toAddress": "string",
  "amount": "number"
}
```

**Response:**
```json
{
  "success": true,
  "transactionHash": "string",
  "message": "Tokens minted successfully (mock implementation)",
  "to": "string",
  "amount": "number"
}
```

### GET /api/blockchain/tokens/balance/:address
Get token balance for an address (mock).

**Parameters:**
- `address`: Wallet address

**Response:**
```json
{
  "success": true,
  "address": "string",
  "balance": "number",
  "balanceWei": "string"
}
```

### GET /api/blockchain/transactions/:txHash
Get transaction details (mock).

**Parameters:**
- `txHash`: Transaction hash

**Response:**
```json
{
  "success": true,
  "transaction": { ... },
  "receipt": { ... },
  "status": "string"
}
```

## Webhook Endpoints

### POST /api/webhooks/qitech
Process QI Tech webhooks.

## Testing with Mock Services

When `QITECH_MOCK_MODE=true` and `BLOCKCHAIN_MOCK_MODE=true` are set in your `.env` file, all endpoints will return realistic mock data instead of making actual API calls. This allows for complete testing of the application workflow without requiring real API keys.

### Complete Test Flow

#### 1. Health Check
```bash
curl http://localhost:3000/health
```

#### 2. User Registration
```bash
curl -X POST http://localhost:3000/api/onboarding/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao.silva@example.com",
    "password": "securePassword123",
    "phoneNumber": "11999999999"
  }'
```

#### 3. Identity Verification (KYC)
```bash
curl -X POST http://localhost:3000/api/onboarding/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_from_registration",
    "documentType": "CPF",
    "documentNumber": "12345678900",
    "documentImage": "data:image/jpeg;base64,dummy_image_data"
  }'
```

#### 4. Banking Services
```bash
curl -X POST http://localhost:3000/api/qitech/banking/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "document": "12345678900",
    "name": "João Silva",
    "email": "joao.silva@example.com",
    "phone": {
      "area_code": "11",
      "number": "999999999"
    }
  }'
```

#### 5. Credit Analysis
```bash
curl -X POST http://localhost:3000/api/qitech/credit/individual \
  -H "Content-Type: application/json" \
  -d '{
    "document": "12345678900",
    "name": "João Silva",
    "email": "joao.silva@example.com",
    "monthly_income": 500000,
    "financial": {
      "amount": 300000,
      "number_of_installments": 12
    }
  }'
```

#### 6. Lending Services
```bash
curl -X POST http://localhost:3000/api/qitech/lending/contracts \
  -H "Content-Type: application/json" \
  -d '{
    "borrower_document": "12345678900",
    "amount": 500000,
    "interest_rate": 2.5,
    "installments": 12,
    "contract_type": "CCB"
  }'
```

#### 7. Payment Schedule Calculation
```bash
curl -X POST http://localhost:3000/api/qitech/lending/calculate-schedule \
  -H "Content-Type: application/json" \
  -d '{
    "loanAmount": 500000,
    "interestRate": 12.5,
    "term": 24
  }'
```

#### 8. Fraud & KYC Services
```bash
curl -X POST http://localhost:3000/api/qitech/fraud/kyc/verify \
  -H "Content-Type: application/json" \
  -d '{
    "document": "12345678900",
    "email": "joao.silva@example.com",
    "firstName": "João",
    "lastName": "Silva",
    "monthly_income": 500000
  }'
```

### Blockchain Services Testing

#### 1. Get Wallet Balance
```bash
curl -X GET http://localhost:3000/api/blockchain/wallet/balance
```

#### 2. Token Transfer
```bash
curl -X POST http://localhost:3000/api/blockchain/tokens/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "toAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "amount": 100
  }'
```

#### 3. Escrow Deposit
```bash
curl -X POST http://localhost:3000/api/blockchain/escrow/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "escrowId": "escrow_123",
    "borrowerAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "lenderAddress": "0x9876543210987654321098765432109876543210",
    "arbitratorAddress": "0x1234567890123456789012345678901234567890",
    "amount": 1000000
  }'
```

#### 4. Get Escrow Status
```bash
curl -X GET http://localhost:3000/api/blockchain/escrow/ESCROW_CONTRACT_ADDRESS
```

#### 5. Release Funds from Escrow
```bash
curl -X POST http://localhost:3000/api/blockchain/escrow/ESCROW_CONTRACT_ADDRESS/release \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### 6. Refund Funds from Escrow
```bash
curl -X POST http://localhost:3000/api/blockchain/escrow/ESCROW_CONTRACT_ADDRESS/refund \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### 7. Get Token Balance
```bash
curl -X GET http://localhost:3000/api/blockchain/tokens/balance/ADDRESS
```

#### 8. Mint Tokens
```bash
curl -X POST http://localhost:3000/api/blockchain/tokens/mint \
  -H "Content-Type: application/json" \
  -d '{
    "toAddress": "ADDRESS",
    "amount": 1000
  }'
```

#### 9. Get Transaction Details
```bash
curl -X GET http://localhost:3000/api/blockchain/transactions/TRANSACTION_HASH
```

### Testing Different Credit Scenarios

#### Approved Credit (Low Amount)
```bash
curl -X POST http://localhost:3000/api/qitech/credit/individual \
  -H "Content-Type: application/json" \
  -d '{
    "document": "12345678900",
    "name": "Test User",
    "email": "test@example.com",
    "monthly_income": 500000,
    "financial": {
      "amount": 150000,
      "number_of_installments": 6
    }
  }'
```

#### Pending Credit (Medium Amount)
```bash
curl -X POST http://localhost:3000/api/qitech/credit/individual \
  -H "Content-Type: application/json" \
  -d '{
    "document": "12345678900",
    "name": "Test User",
    "email": "test@example.com",
    "monthly_income": 300000,
    "financial": {
      "amount": 400000,
      "number_of_installments": 12
    }
  }'
```

#### Rejected Credit (High Amount)
```bash
curl -X POST http://localhost:3000/api/qitech/credit/individual \
  -H "Content-Type: application/json" \
  -d '{
    "document": "12345678900",
    "name": "Test User",
    "email": "test@example.com",
    "monthly_income": 300000,
    "financial": {
      "amount": 800000,
      "number_of_installments": 24
    }
  }'
```

## Configuration Variables

Make sure your `.env` file includes:

```env
QITECH_MOCK_MODE=true
BLOCKCHAIN_MOCK_MODE=true
QITECH_API_KEY=your_qitech_api_key
QITECH_CREDIT_ANALYSIS_URL=https://api.sandbox.caas.qitech.app/credit_analysis/
QITECH_BANKING_URL=https://api.sandbox.caas.qitech.app/banking/
QITECH_LAAS_URL=https://api.sandbox.caas.qitech.app/laas/
QITECH_FRAUD_URL=https://api.sandbox.caas.qitech.app/fraud/
QITECH_OPEN_FINANCE_URL=https://api.sandbox.caas.qitech.app/open-finance/
QITECH_WEBHOOK_SECRET=your_webhook_secret
BLOCKCHAIN_RPC_URL=https://sepolia.scroll.io
PRIVATE_KEY=your_private_key_here
ESCROW_CONTRACT_ADDRESS=endereço_contrato_aqui_após_deploy
TOKEN_CONTRACT_ADDRESS=endereço_token_aqui_após_deploy
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qicredit_db
DB_USER=postgres
DB_PASSWORD=your_password
```

These variables enable the mock services instead of making real API calls when set to `true`.
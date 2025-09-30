# Mock Services Implementation Guide

## Introduction

This document describes the implementation of mock services for the QI Tech APIs, enabling development and testing of the QI Credit platform without requiring real API keys from QI Tech. The approach implemented allows switching between mock and real modes using environment variables.

## Objectives

- Enable continuous development without real QI Tech API keys
- Simulate different response scenarios (credit approval/rejection, etc.)
- Maintain full system functionality during development
- Facilitate testing and demonstrations of the platform

## Implementation Structure

### General Approach

The implementation follows a **conditional switch** approach based on environment variables:

- **Real Mode**: Makes actual calls to QI Tech APIs
- **Mock Mode**: Returns simulated data without making external calls
- **Configuration**: Controlled via environment variables in the `.env` file

### Environment Variables

New variables were added to the `.env` file:

```env
# Mock mode for QI Tech APIs
QITECH_MOCK_MODE=true

# Mock mode for blockchain services
BLOCKCHAIN_MOCK_MODE=true
```

## Detailed Implementation by Service

### Credit Analysis Service

#### Location:
- File: `backend/services/creditAnalysisService.js`

#### Modifications:
- Added check for `config.QITECH_MOCK_MODE`
- Implemented conditional flow for mock mode
- Creation of helper methods to simulate credit decisions

#### How it works in mock mode:
- **Credit Decision**: Simulates different outcomes based on loan amount
  - 0-2000: Automatically approved
  - 2001-4000: Pending
  - 4001-6000: Waiting for data
  - 6001-8000: Manual analysis (approval)
  - 8001-10000: Manual analysis (rejection)
  - 10001+: Automatically rejected

- **Credit Score**: Generates realistic scores based on user profile
- **Rates and Terms**: Calculates appropriate values for approvals

#### Example mock response:
```javascript
{
  id: 'mock_12345',
  analysis_status: 'automatically_approved',
  approved_amount: 450000, // in cents
  score: 750,
  interest_rate: 2.32,
  number_of_installments: 12
}
```

### Banking as a Service

#### Location:
- File: `backend/services/bankingAsAService.js`

#### Modifications:
- Added mock mode support with realistic response data
- Implementation of real-world banking account and transaction simulations

#### Mock Features:
- **Digital Account Creation**: Generates realistic account data
- **Pix Transactions**: Creates transactions with QR codes and statuses
- **Boleto Issuance**: Generates unique barcodes for boletos
- **Account Queries**: Returns realistic account information

#### Example mock response:
```javascript
{
  id: 'mock_acc_12345',
  account_id: 'acc_12345',
  agency_number: '1234',
  account_number: '5678910',
  status: 'active',
  pix_keys: [{
    key_type: 'cpf',
    key_value: '12345678900'
  }]
}
```

### Lending as a Service

#### Location:
- File: `backend/services/lendingAsAService.js`

#### Modifications:
- Added mock mode with complete contract simulation
- Implementation of payment schedules and interest calculations

#### Mock Features:
- **Contract Creation**: Generates credit contracts (CCB, CCI, CCE) simulations
- **Electronic Signature**: Simulates signing process
- **Payments and Installments**: Creates realistic payment schedules
- **Contract Assignment**: Simulates transfer to funds

#### Example mock response:
```javascript
{
  id: 'mock_contract_12345',
  status: 'awaiting_signature',
  amount: 500000,
  interest_rate: 2.5,
  installments: 12,
  repayment_schedule: [
    { installment: 1, dueDate: '2023-11-01', amount: 47000 }
    // ... more installments
  ]
}
```

### Fraud & KYC Service (New Service)

#### Location:
- File: `backend/services/fraudKycService.js`

#### Why it was created:
- The QI Credit system needs fraud prevention and KYC services
- This service didn't exist previously
- Implemented with mock capability from the beginning

#### Features:
- **Device Scan**: Device verification for fraud prevention
- **Face Verification**: Facial verification for KYC
- **Antifraud Score**: Risk scoring based on multiple factors
- **Open Finance**: Financial data retrieval (simulated)
- **Complete KYC**: Combination of all verification checks

#### Example mock response:
```javascript
{
  id: 'mock_antifraud_12345',
  score: 750,
  risk_level: 'LOW',
  status: 'completed',
  recommendations: ['Standard processing'],
  policy: {
    approved: true,
    max_amount: 5000000
  }
}
```

### Blockchain Service

#### Location:
- File: `backend/services/blockchainService.js`

#### Modifications:
- Added mock mode support with blockchain operation simulation
- Maintained existing code for real operations

#### Mock Features:
- **Escrow Deposit**: Simulates creation of escrow contracts
- **Fund Release**: Simulates fund transfers
- **Fund Refund**: Simulates fund returns
- **Escrow Status**: Returns contract state simulations
- **Token Minting**: Simulates token creation
- **Token Transfer**: Simulates asset movement
- **Blockchain Events**: Simulates event listening

#### Example mock response:
```javascript
{
  success: true,
  escrowContractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  transactionHash: '0x1234567890abcdef',
  escrowDetails: {
    id: 'mock_escrow_12345',
    borrower: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    lender: '0x9876543210987654321098765432109876543210',
    arbitrator: '0x1234567890123456789012345678901234567890',
    amount: 1000000,
    status: 'PENDING'
  }
}
```

## Controller and Route Updates

### Controller Updates

#### Credit Analysis Controller
- Updated to use the main service with mock capability
- Adapted to use methods from the main service

#### Onboarding Controller
- Integrated with the new fraud/KYC service for identity verification
- Expanded KYC functionality

### API Routes

#### New Fraud/KYC Route
- Created: `backend/routes/fraudKycRoutes.js`
- Associated with: `/api/qitech/fraud`
- Endpoints include: `/device-scan`, `/face-verify`, `/score`, `/kyc/verify`

## How to Use

### Initial Setup

1. **Set mock mode in `.env`**:
```env
QITECH_MOCK_MODE=true
BLOCKCHAIN_MOCK_MODE=true
```

2. **Run the backend**:
```bash
cd backend
npm run dev
```

### Testing APIs with Mock Mode

#### Test credit analysis:
```bash
curl -X POST http://localhost:3000/api/qitech/credit/individual \
  -H "Content-Type: application/json" \
  -d '{
    "document": "12345678900",
    "name": "Test User",
    "email": "test@example.com",
    "monthly_income": 500000,
    "financial": {
      "amount": 300000,
      "number_of_installments": 12
    }
  }'
```

#### Test banking account creation:
```bash
curl -X POST http://localhost:3000/api/qitech/banking/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "document": "12345678900",
    "name": "Test User",
    "email": "test@example.com",
    "phone": {
      "area_code": "11",
      "number": "999999999"
    }
  }'
```

#### Test KYC verification:
```bash
curl -X POST http://localhost:3000/api/qitech/fraud/kyc/verify \
  -H "Content-Type: application/json" \
  -d '{
    "document": "12345678900",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "monthly_income": 500000
  }'
```

## Benefits of Implementation

### Continuous Development
- No need for real API keys
- Ability to test different scenarios
- Integration continuity without external dependencies

### Realistic Simulation
- Response data follows real API patterns
- Business logic maintained (decisions based on real criteria)
- Status and workflows realistic

### Easy Transition
- Simple switching between modes (change environment variables)
- Same interface for existing code
- No frontend changes required

## Important Considerations

- Mock mode is ideal for development and testing
- For production, switch to real API calls
- Environment variables should be changed as needed
- The system maintains exactly the same interface in both modes

## Next Steps

- When real API keys are available, change environment variables to `false`
- Test complete integration with real APIs
- Adjust business logic based on real API behavior
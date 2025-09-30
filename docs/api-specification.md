# API Specification

## Introduction

This document outlines the API endpoints available in the QI Credit platform, detailing request/response formats, parameters, and expected behaviors for each endpoint.

## Base URL

All API endpoints are prefixed with `/api/{module}` where `{module}` represents the specific API module.

## Common Response Format

### Success Response
```json
{
  "status": "success",
  "data": { /* response data */ },
  "timestamp": "2023-01-01T12:00:00Z"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error message",
  "timestamp": "2023-01-01T12:00:00Z"
}
```

## Credit Analysis API (`/api/credit-analysis`)

### Get Credit Score
- **Method**: `GET`
- **Endpoint**: `/api/credit-analysis/score/:userId`
- **Description**: Retrieves the credit score for a user
- **Path Parameters**:
  - `userId`: The ID of the user
- **Response**:
  ```json
  {
    "userId": "user123",
    "creditScore": 780,
    "riskLevel": "LOW"
  }
  ```

### Analyze Creditworthiness
- **Method**: `POST`
- **Endpoint**: `/api/credit-analysis/analyze`
- **Description**: Performs credit analysis for a loan application
- **Request Body**:
  ```json
  {
    "userId": "user123",
    "loanAmount": 10000,
    "loanTerm": 24
  }
  ```
- **Response**:
  ```json
  {
    "userId": "user123",
    "loanAmount": 10000,
    "loanTerm": 24,
    "approved": true,
    "creditScore": 780,
    "interestRate": 0.08,
    "riskAssessment": "APPROVED",
    "repaymentCapacity": {
      "monthlyPayment": 450.00,
      "totalRepayment": 10800.00,
      "totalInterest": 800.00
    }
  }
  ```

### Get Credit History
- **Method**: `GET`
- **Endpoint**: `/api/credit-analysis/history/:userId`
- **Description**: Retrieves the credit history for a user
- **Path Parameters**:
  - `userId`: The ID of the user
- **Response**:
  ```json
  {
    "userId": "user123",
    "creditHistory": [
      {
        "date": "2023-01-15",
        "type": "loan",
        "amount": 10000,
        "status": "repaid"
      }
    ]
  }
  ```

## Onboarding API (`/api/onboarding`)

### Register User
- **Method**: `POST`
- **Endpoint**: `/api/onboarding/register`
- **Description**: Registers a new user
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "securePassword123",
    "phoneNumber": "+1234567890"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully",
    "userId": "user123",
    "email": "john.doe@example.com"
  }
  ```

### Verify Identity
- **Method**: `POST`
- **Endpoint**: `/api/onboarding/verify`
- **Description**: Verifies user identity with document
- **Request Body**:
  ```json
  {
    "userId": "user123",
    "documentType": "passport",
    "documentNumber": "P12345678",
    "documentImage": "base64_encoded_image_data"
  }
  ```
- **Response**:
  ```json
  {
    "userId": "user123",
    "status": "VERIFIED",
    "message": "Identity verified successfully"
  }
  ```

### Complete Onboarding
- **Method**: `POST`
- **Endpoint**: `/api/onboarding/complete`
- **Description**: Completes the onboarding process
- **Request Body**:
  ```json
  {
    "userId": "user123"
  }
  ```
- **Response**:
  ```json
  {
    "userId": "user123",
    "status": "COMPLETED",
    "message": "Onboarding completed successfully",
    "walletAddress": "wallet_123_1234567890"
  }
  ```

### Get Onboarding Status
- **Method**: `GET`
- **Endpoint**: `/api/onboarding/status/:userId`
- **Description**: Retrieves onboarding status for a user
- **Path Parameters**:
  - `userId`: The ID of the user
- **Response**:
  ```json
  {
    "userId": "user123",
    "completed": true,
    "status": "COMPLETED",
    "identityVerified": true,
    "documentsSubmitted": true,
    "steps": [
      { "step": "registration", "completed": true },
      { "step": "identity_verification", "completed": true },
      { "step": "onboarding_completion", "completed": true }
    ]
  }
  ```

## Escrow API (`/api/escrow`)

### Create Escrow
- **Method**: `POST`
- **Endpoint**: `/api/escrow/create`
- **Description**: Creates an escrow contract
- **Request Body**:
  ```json
  {
    "borrowerId": "user123",
    "lenderId": "user456",
    "loanId": "loan789",
    "amount": 5000,
    "terms": "Loan terms and conditions"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Escrow created successfully",
    "escrowId": "escrow123",
    "status": "PENDING",
    "amount": 5000
  }
  ```

### Release Funds
- **Method**: `POST`
- **Endpoint**: `/api/escrow/release`
- **Description**: Releases funds from escrow
- **Request Body**:
  ```json
  {
    "escrowId": "escrow123",
    "authorizedBy": "user123"
  }
  ```
- **Response**:
  ```json
  {
    "escrowId": "escrow123",
    "status": "RELEASED",
    "message": "Funds released successfully",
    "releasedAt": "2023-01-01T12:00:00Z"
  }
  ```

### Refund Funds
- **Method**: `POST`
- **Endpoint**: `/api/escrow/refund`
- **Description**: Refunds funds from escrow
- **Request Body**:
  ```json
  {
    "escrowId": "escrow123",
    "reason": "Loan agreement not met"
  }
  ```
- **Response**:
  ```json
  {
    "escrowId": "escrow123",
    "status": "REFUNDED",
    "message": "Funds refunded successfully",
    "refundedAt": "2023-01-01T12:00:00Z"
  }
  ```

### Get Escrow Details
- **Method**: `GET`
- **Endpoint**: `/api/escrow/:escrowId`
- **Description**: Retrieves details for an escrow contract
- **Path Parameters**:
  - `escrowId`: The ID of the escrow
- **Response**:
  ```json
  {
    "id": "escrow123",
    "borrowerId": "user123",
    "lenderId": "user456",
    "loanId": "loan789",
    "amount": 5000,
    "terms": "Loan terms and conditions",
    "status": "PENDING",
    "createdAt": "2023-01-01T12:00:00Z",
    "blockchainContractAddress": "0x123456789..."
  }
  ```

### Get Escrow Status
- **Method**: `GET`
- **Endpoint**: `/api/escrow/status/:escrowId`
- **Description**: Retrieves status of an escrow contract
- **Path Parameters**:
  - `escrowId`: The ID of the escrow
- **Response**:
  ```json
  {
    "escrowId": "escrow123",
    "status": {
      "status": "PENDING",
      "amount": 5000,
      "borrowerId": "user123",
      "lenderId": "user456",
      "blockchainSynced": true
    }
  }
  ```

## Wallet API (`/api/wallet`)

### Get Wallet Details
- **Method**: `GET`
- **Endpoint**: `/api/wallet/details/:userId`
- **Description**: Retrieves wallet details for a user
- **Path Parameters**:
  - `userId`: The ID of the user
- **Response**:
  ```json
  {
    "userId": "user123",
    "walletAddress": "0x123456789...",
    "balance": 1000.50,
    "currency": "BRL",
    "lastTransaction": "2023-01-01T12:00:00Z"
  }
  ```

### Transfer Funds
- **Method**: `POST`
- **Endpoint**: `/api/wallet/transfer`
- **Description**: Transfers funds between wallets
- **Request Body**:
  ```json
  {
    "fromUserId": "user123",
    "toUserId": "user456",
    "amount": 100.00,
    "description": "Loan payment"
  }
  ```
- **Response**:
  ```json
  {
    "transactionId": "tx123",
    "fromUserId": "user123",
    "toUserId": "user456",
    "amount": 100.00,
    "currency": "BRL",
    "status": "COMPLETED",
    "timestamp": "2023-01-01T12:00:00Z"
  }
  ```

### Get Transaction History
- **Method**: `GET`
- **Endpoint**: `/api/wallet/transactions/:userId`
- **Description**: Retrieves transaction history for a user
- **Path Parameters**:
  - `userId`: The ID of the user
- **Query Parameters**:
  - `limit`: Number of transactions to return (default: 10)
  - `offset`: Offset for pagination (default: 0)
- **Response**:
  ```json
  {
    "userId": "user123",
    "transactions": [
      {
        "transactionId": "tx123",
        "fromUserId": "user123",
        "toUserId": "user456",
        "amount": 100.00,
        "currency": "BRL",
        "status": "COMPLETED",
        "timestamp": "2023-01-01T12:00:00Z",
        "description": "Loan payment"
      }
    ],
    "totalCount": 1
  }
  ```

### Deposit Funds
- **Method**: `POST`
- **Endpoint**: `/api/wallet/deposit`
- **Description**: Deposits funds into a wallet
- **Request Body**:
  ```json
  {
    "userId": "user123",
    "amount": 500.00,
    "paymentMethod": "PIX",
    "reference": "Deposit via PIX"
  }
  ```
- **Response**:
  ```json
  {
    "transactionId": "tx456",
    "userId": "user123",
    "amount": 500.00,
    "currency": "BRL",
    "status": "PENDING",
    "paymentMethod": "PIX",
    "reference": "Deposit via PIX",
    "timestamp": "2023-01-01T12:00:00Z"
  }
  ```

### Withdraw Funds
- **Method**: `POST`
- **Endpoint**: `/api/wallet/withdraw`
- **Description**: Withdraws funds from a wallet
- **Request Body**:
  ```json
  {
    "userId": "user123",
    "amount": 200.00,
    "destination": "Bank Account",
    "reference": "Withdrawal to bank"
  }
  ```
- **Response**:
  ```json
  {
    "transactionId": "tx789",
    "userId": "user123",
    "amount": 200.00,
    "currency": "BRL",
    "status": "PROCESSING",
    "destination": "Bank Account",
    "reference": "Withdrawal to bank",
    "timestamp": "2023-01-01T12:00:00Z"
  }
  ```
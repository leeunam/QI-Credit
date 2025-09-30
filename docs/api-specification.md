# QI Credit – Especificação de API

> Versão: `v1` (MVP). Documento consolidando: domínios, endpoints (Sandbox / Produção quando aplicável), parâmetros de entrada/saída, segurança e fluxo ponta a ponta. Seções funcionais abaixo seguem exatamente o escopo solicitado (Onboarding, Análise de Crédito, Wallet/Banking, Marketplace & Escrow, Antifraude, Autenticação).

## Base & Versionamento

Base URL (dev): `http://localhost:3000/api/v1`  
Headers comuns:

```
Content-Type: application/json
Authorization: Bearer <jwt>
X-Request-Id: <uuid>
```

## Convenções de Resposta

```json
// Sucesso
{
  "success": true,
  "data": {},
  "meta": { "requestId": "uuid", "ts": "2025-09-30T12:00:00Z" }
}
```

```json
// Erro
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campo X inválido",
    "details": []
  },
  "meta": { "requestId": "uuid" }
}
```

## Autenticação & Segurança

- Auth: JWT emitido após login (endpoint a definir).
- Rate limit: por IP + chave de API interna (futuro).
- Idempotência: `Idempotency-Key` em POST críticos (depósito, release).
- Auditing: cada mudança relevante gera evento em `escrow_events` ou trilha em `audit_logs` (planejado).

## Domínios

| Domínio                  | Prefixo                 | Objetivo / Escopo Principal                                     |
| ------------------------ | ----------------------- | --------------------------------------------------------------- |
| Onboarding (KYC)         | `/onboarding`           | Cadastro PF/PJ, coleta documentos, verificação identidade & KYC |
| Análise de Crédito       | `/credit-analysis`      | Score, decisão (aprovado/reprovado/manual/pendente)             |
| Wallet & Banking         | `/wallet` + BaaS        | Saldos, depósitos, Pix, boletos, transferências                 |
| Marketplace P2P / Loans  | `/marketplace`/`/loans` | Matching ofertas-investimentos e geração de contratos (CCB)     |
| Escrow                   | `/escrow`               | Bloqueio, liberação e reembolso de fundos on-chain              |
| Antifraude               | Integrado               | Validação documental, biometria, comportamento, device scan     |
| Autenticação / Segurança | `/auth` (futuro)        | API Key + Assinatura assimétrica + JWT                          |
| Blockchain               | `/blockchain`           | Operações de contrato / tokens (mock / ambiente L2)             |
| Webhooks                 | `/webhooks`             | Recepção de eventos externos / QI                               |

---

## 1. Onboarding (Cadastro e KYC)

**Endpoints Oficiais QI Tech** (exemplo real):  
Produção: `https://api.caas.qitech.app/onboarding/`  
Sandbox: `https://api.sandbox.caas.qitech.app/onboarding/`

**Funcionalidade:** Realiza o cadastro, validação documental e KYC de pessoas físicas e jurídicas.

**Parâmetros de Entrada (exemplos):**

- Dados pessoais: `nome`, `documento` (CPF/CNPJ), `data_nascimento`, `email`, `endereco{ rua, numero, cep, cidade, uf }`
- Contatos: `telefones[]`
- Documentos: imagens (`selfie`, `frente_documento`, `verso_documento`), comprovantes
- Metadados: `ip_origem`, `canal`, `device_fingerprint`

**Parâmetros de Saída:**

- `status_kyc`: `aprovado | reprovado | analise_manual | pendente`
- `motivos` / `pendencias`
- `score_risco_onboarding` (se fornecido)

**Recursos Inclusos:**

- Validação automática/manual
- Integração antifraude (OCR + face match + device)
- Enfileiramento para análise manual

**Aplicação:** Onboarding seguro e automatizado do usuário na plataforma, garantindo conformidade regulatória.

### Exemplo Simplificado (Sandbox Interno)

`POST /onboarding/register`

```json
{
  "nome": "Maria Silva",
  "documento": "12345678901",
  "email": "maria@example.com",
  "data_nascimento": "1995-04-10",
  "endereco": { "cidade": "São Paulo", "uf": "SP" }
}
```

Resposta:

```json
{ "success": true, "data": { "userId": "usr_123", "status_kyc": "pendente" } }
```

---

## 2. Análise de Crédito

**Endpoints Oficiais QI Tech:**  
Produção: `https://api.caas.qitech.app/credit_analysis/`  
Sandbox: `https://api.sandbox.caas.qitech.app/credit_analysis/`

**Funcionalidade:** Executa análise de crédito e retorna score, decisão e justificativas.

**Entradas:**

- Dados cadastrais (nome, documento, idade)
- Dados financeiros: `renda`, `comprometimento`, `histórico_pagamentos`
- Valor solicitado: `financial.amount`
- Estrutura financeira adicional: `annual_interest_rate`, `number_of_installments`, `cdi_percentage`

**Saídas:**

- `decisao`: `aprovado | reprovado | analise_manual | pendente`
- `score_credito`
- `justificativas[]`
- `montante_aprovado`

**Recursos Inclusos:**

- Webhooks para atualização de status
- Regras de decisão customizáveis
- Suporte a reprocessamento / atualização de status

**Aplicação:** Avaliação automática de risco com possibilidade de IA / modelos preditivos para refino de score.

### Exemplo (Sandbox)

`POST /credit-analysis/analyze`

```json
{ "userId": "usr_123", "loanAmount": 1500000, "loanTerm": 12 }
```

Resposta:

```json
{
  "success": true,
  "data": {
    "userId": "usr_123",
    "score_credito": 780,
    "decisao": "aprovado",
    "interestRate": 0.08
  }
}
```

---

## 3. Carteira Digital (Wallet) e Banking

**Endpoints:** Dependem do provedor BaaS (ex.: QI / Banking-as-a-Service). Necessário consultar documentação específica para: criação de conta, emissão de boletos, Pix, extratos.

**Funcionalidade:** Gerenciamento de saldo, extrato, transferências, pagamentos (Pix/boletos), liquidação de parcelas.

**Entradas:**

- Identificador de conta / usuário (`userId` / `accountId`)
- Valor e tipo de operação (`credit`, `debit`, `pix`, `boleto`)
- Dados bancários destino quando transferência externa

**Saídas:**

- Confirmação da operação (`transactionId`)
- Saldo atualizado (`balance`, `reserved`)
- Histórico de transações paginado

**Recursos Inclusos:**

- APIs Pix, boletos, TED, cartões (conforme BaaS)
- Integração antifraude e compliance (monitoramento AML)

**Aplicação:** Permite que usuários movam valores dentro da plataforma e liquidem obrigações de contratos.

---

## 4. Marketplace P2P (Contratos e Escrow)

**Endpoints Internos (MVP):** `/marketplace`, `/loans`, `/escrow`

**Funcionalidade:** Criação de ofertas, matching, geração de contrato digital (ex.: CCB), criação de escrow, liberação e repasse automático entre investidor e tomador.

**Entradas:**

- Dados do contrato: partes (investorId, borrowerId), valores, taxas, condições
- Dados de movimentação financeira: `amount`, `rate`, `term`, `fundingSource`

**Saídas:**

- `status_contrato` (PENDING_FUNDS, FUNDS_LOCKED, ACTIVE, REPAID, DEFAULTED)
- Comprovantes / hashes de transações on-chain (`txHash`)
- Eventos de escrow (`DEPOSITED`, `RELEASED`, `REFUNDED`)

**Recursos:**

- Geração e assinatura digital (hash + assinatura futura EIP-712)
- Liberação automática via API pós-condição
- Registro de eventos para auditoria

**Aplicação:** Traz transparência e automação ao modelo P2P, reduzindo risco operacional.

---

## 5. Antifraude e Validação Documental

**Endpoints:** Integrados aos fluxos de Onboarding / Atualização de Perfil.

**Funcionalidade:** Validação de documentos, biometria facial, análise de comportamento e device fingerprint.

**Entradas:**

- Imagens (documento frente/verso, selfie)
- Dados de dispositivo (user-agent, ip, geolocalização aproximada)
- Padrões de comportamento (velocidade de digitação, tentativas falhas) – opcional futuro

**Saídas:**

- `status_validacao`: aprovado / suspeito / reprovado / manual
- Detalhes de inconsistências: lista com códigos (ex.: `FACE_MISMATCH`, `DOCUMENT_EXPIRED`)

**Recursos:**

- OCR + Reconhecimento Facial
- Device fingerprint
- Reprocessamento manual

**Aplicação:** Reduz risco de fraude e aumenta segurança do onboarding e das transações.

---

## 6. APIs de Autenticação e Segurança

**Endpoint Exemplo (QI Auth Sandbox):** `POST https://api-auth.sandbox.qitech.app/test`

**Funcionalidade:** Autenticación de requisições via API Key e assinatura assimétrica (payload assinado base64 / HMAC ou RSA dependendo do provedor) + emissão de JWT interno.

**Entradas (Headers):**

- `API-CLIENT-KEY`
- `Authorization` (assinatura / Bearer token)

**Body:**

- `encoded_body` (payload JSON assinado/criptografado)

**Saídas:**

- Confirmação de autenticação / validade de assinatura
- Token de sessão (se fluxo de login interno)

**Recursos:**

- Segurança de ponta a ponta
- Rotação de chaves (planejado)
- Revogação / Lista de chaves comprometidas

**Aplicação:** Garante que somente clientes autorizados consumam as APIs protegendo dados sensíveis (PII, operações financeiras).

---

## (Seções Detalhadas dos Endpoints Internos)

As seções abaixo mantêm o formato anterior, agora contextualizadas pelos domínios descritos acima.

---

## (Detalhe Técnico) Onboarding Interno

### POST `/onboarding/register`

Registra usuário.

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "***",
  "phoneNumber": "+551199999999"
}
```

Resposta:

```json
{
  "success": true,
  "data": { "userId": "usr_123", "email": "john@example.com" }
}
```

### POST `/onboarding/verify`

Envia documento/selfie.

```json
{
  "userId": "usr_123",
  "documentType": "CPF",
  "documentNumber": "12345678900",
  "documentImage": "base64..."
}
```

Resposta:

```json
{ "success": true, "data": { "userId": "usr_123", "status": "VERIFIED" } }
```

### GET `/onboarding/status/:userId`

```json
{
  "success": true,
  "data": {
    "userId": "usr_123",
    "status": "COMPLETED",
    "steps": [{ "step": "registration", "completed": true }]
  }
}
```

---

## (Detalhe Técnico) Análise de Crédito Interna

### POST `/credit-analysis/analyze`

```json
{ "userId": "usr_123", "loanAmount": 10000, "loanTerm": 24 }
```

Resposta:

```json
{
  "success": true,
  "data": {
    "userId": "usr_123",
    "approved": true,
    "creditScore": 780,
    "riskAssessment": "APPROVED",
    "interestRate": 0.08
  }
}
```

### GET `/credit-analysis/score/:userId`

```json
{
  "success": true,
  "data": { "userId": "usr_123", "creditScore": 780, "riskLevel": "LOW" }
}
```

### GET `/credit-analysis/history/:userId`

```json
{
  "success": true,
  "data": {
    "userId": "usr_123",
    "creditHistory": [
      {
        "date": "2025-09-01",
        "type": "loan",
        "amount": 10000,
        "status": "REPAID"
      }
    ]
  }
}
```

---

## (Detalhe Técnico) Marketplace

### POST `/marketplace/offers`

Cria oferta de investimento.

```json
{
  "investorId": "usr_inv",
  "amount": 50000,
  "rate": 0.025,
  "termDays": 180,
  "riskProfile": "A"
}
```

Resposta:

```json
{ "success": true, "data": { "offerId": "off_123", "status": "OPEN" } }
```

### GET `/marketplace/offers?status=OPEN`

```json
{
  "success": true,
  "data": {
    "offers": [
      { "offerId": "off_123", "amount": 50000, "rate": 0.025, "termDays": 180 }
    ]
  }
}
```

### POST `/marketplace/offers/:offerId/match`

```json
{ "borrowerId": "usr_bor" }
```

Resposta cria `loanId` preliminar:

```json
{
  "success": true,
  "data": {
    "loanId": "loan_789",
    "offerId": "off_123",
    "status": "PENDING_FUNDS"
  }
}
```

---

## (Detalhe Técnico) Loans

### GET `/loans/:loanId`

```json
{
  "success": true,
  "data": {
    "loanId": "loan_789",
    "principal": 50000,
    "rate": 0.025,
    "status": "FUNDS_LOCKED"
  }
}
```

### POST `/loans/:loanId/sign`

```json
{ "signerId": "usr_bor", "signatureHash": "0xabc..." }
```

### POST `/loans/:loanId/schedule/calculate`

```json
{ "principal": 50000, "rate": 0.025, "termDays": 180, "method": "PRICE" }
```

---

## (Detalhe Técnico) Escrow

### POST `/escrow/create`

```json
{
  "loanId": "loan_789",
  "borrowerId": "usr_bor",
  "investorId": "usr_inv",
  "amount": 50000
}
```

### POST `/escrow/:loanId/deposit`

Headers: `Idempotency-Key: uuid`

```json
{ "investorWallet": "0xabc...", "amount": 50000 }
```

Resposta:

```json
{
  "success": true,
  "data": {
    "loanId": "loan_789",
    "event": "DEPOSITED",
    "txHash": "0xhash",
    "state": "FUNDS_LOCKED"
  }
}
```

### POST `/escrow/:loanId/release`

```json
{ "authorizedBy": "platform" }
```

### POST `/escrow/:loanId/refund`

```json
{ "reason": "KYC_FAIL" }
```

### GET `/escrow/:loanId/events`

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "type": "DEPOSITED",
        "amount": 50000,
        "txHash": "0xhash",
        "eventHash": "0xev"
      }
    ]
  }
}
```

---

## (Detalhe Técnico) Wallet

### GET `/wallet/:userId`

```json
{
  "success": true,
  "data": {
    "userId": "usr_inv",
    "balance": 100000,
    "reserved": 50000,
    "currency": "BRL"
  }
}
```

### POST `/wallet/deposit`

```json
{ "userId": "usr_inv", "amount": 100000, "method": "PIX" }
```

### POST `/wallet/transfer`

```json
{
  "fromUserId": "usr_inv",
  "toUserId": "usr_bor",
  "amount": 2500,
  "description": "INSTALLMENT_1"
}
```

### GET `/wallet/:userId/transactions?limit=10&offset=0`

```json
{
  "success": true,
  "data": {
    "transactions": [{ "txId": "tx_1", "amount": 2500, "type": "DEBIT" }],
    "total": 1
  }
}
```

---

## (Detalhe Técnico) Blockchain (Mock / Hardhat)

### POST `/blockchain/escrow/deposit`

```json
{
  "escrowId": "loan_789",
  "borrowerAddress": "0x...",
  "lenderAddress": "0x...",
  "amount": 50000
}
```

### POST `/blockchain/escrow/:address/release`

### POST `/blockchain/escrow/:address/refund`

### GET `/blockchain/escrow/:address`

### POST `/blockchain/tokens/transfer`

### POST `/blockchain/tokens/mint`

### GET `/blockchain/tokens/balance/:address`

### GET `/blockchain/transactions/:txHash`

---

## (Detalhe Técnico) Webhooks

### POST `/webhooks/qitech`

Assinatura: header `X-QI-Signature` (HMAC SHA256).  
Payload exemplo:

```json
{
  "type": "CREDIT_ANALYSIS.COMPLETED",
  "data": { "userId": "usr_123", "score": 780, "decision": "APPROVED" },
  "timestamp": "2025-09-30T12:00:00Z"
}
```

---

## Fluxo Completo

```bash
# 1. Registrar usuário investidor
curl -s -X POST http://localhost:3000/api/v1/onboarding/register \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"Ana","lastName":"Invest","email":"ana@ex.com","password":"x","phoneNumber":"1199"}'

# 2. Criar oferta
curl -s -X POST http://localhost:3000/api/v1/marketplace/offers \
  -H 'Content-Type: application/json' \
  -d '{"investorId":"usr_inv","amount":50000,"rate":0.025,"termDays":180,"riskProfile":"A"}'

# 3. Match oferta -> loan
curl -s -X POST http://localhost:3000/api/v1/marketplace/offers/off_123/match \
  -H 'Content-Type: application/json' -d '{"borrowerId":"usr_bor"}'

# 4. Depósito escrow
curl -s -X POST http://localhost:3000/api/v1/escrow/loan_789/deposit \
  -H 'Content-Type: application/json' -H 'Idempotency-Key: 1111-2222' \
  -d '{"investorWallet":"0xabc","amount":50000}'

# 5. Liberação
curl -s -X POST http://localhost:3000/api/v1/escrow/loan_789/release -H 'Content-Type: application/json' -d '{"authorizedBy":"platform"}'

# 6. Consulta eventos
curl -s http://localhost:3000/api/v1/escrow/loan_789/events
```

---

## OpenAPI (Fragmento Inicial)

```yaml
openapi: 3.0.3
info:
  title: QI Credit API
  version: 1.0.0
servers:
  - url: http://localhost:3000/api/v1
paths:
  /onboarding/register:
    post:
      summary: Register user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [firstName, lastName, email, password]
              properties:
                firstName: { type: string }
                lastName: { type: string }
                email: { type: string, format: email }
                password: { type: string, minLength: 6 }
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean }
                  data:
                    type: object
                    properties:
                      userId: { type: string }
                      email: { type: string }
  /credit-analysis/analyze:
    post:
      summary: Analyze credit
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [userId, loanAmount, loanTerm]
              properties:
                userId: { type: string }
                loanAmount: { type: number }
                loanTerm: { type: integer }
      responses:
        '200': { description: Analysis result }
```

---

## Códigos de Erro

| Código           | HTTP | Descrição                               |
| ---------------- | ---- | --------------------------------------- |
| VALIDATION_ERROR | 400  | Campos inválidos                        |
| UNAUTHORIZED     | 401  | Token ausente/inválido                  |
| FORBIDDEN        | 403  | Sem permissão                           |
| NOT_FOUND        | 404  | Recurso não localizado                  |
| CONFLICT         | 409  | Estado incompatível (ex: já depositado) |
| RATE_LIMITED     | 429  | Limite excedido                         |
| INTERNAL_ERROR   | 500  | Erro inesperado                         |

---

## Observabilidade

Headers de saída sugeridos:  
`X-Request-Id`, `X-Trace-Id`, `X-RateLimit-Remaining`.  
Eventos críticos: `ESCROW_DEPOSITED`, `ESCROW_RELEASED`, `LOAN_SIGNED`, `PAYMENT_CONFIRMED`.

---

## Próximos Passos (API)

- Completar OpenAPI para todos endpoints.
- Adicionar `PATCH /loans/:loanId/repayment` para registrar pagamento.
- Implementar paginação consistente (`limit`, `cursor`).
- Implementar HMAC verificação de webhook (assinatura).
- Idempotência persistente com tabela `idempotency_keys`.

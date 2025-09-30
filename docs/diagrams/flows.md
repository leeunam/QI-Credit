# Diagramas de Fluxo

---

## 1. Onboarding + KYC + Score

```mermaid
sequenceDiagram
  autonumber
  participant U as Usuário
  participant FE as Frontend
  participant API as Backend
  participant KYC as KYC Service (QI)
  participant CR as Credit API (QI)
  participant DB as DB
  U->>FE: Preenche Cadastro
  FE->>API: POST /onboarding/register
  API->>DB: insert user(PENDING)
  DB-->>API: OK
  API-->>FE: userId
  U->>FE: Envia Documentos
  FE->>API: POST /onboarding/verify
  API->>KYC: validateDocument
  KYC-->>API: status=APPROVED
  API->>CR: POST /credit-analysis/analyze
  CR-->>API: score=780 approved
  API->>DB: update user (kyc_status=APPROVED, credit_score=780)
  API-->>FE: {kyc: APPROVED, score:780}
```

---

## 2. Funding (Oferta → Loan → Depósito Escrow)

```mermaid
sequenceDiagram
  autonumber
  participant INV as Investidor
  participant FE as Frontend
  participant API as Backend
  participant MK as marketplaceService
  participant LN as loanService
  participant ES as escrowService
  participant SC as SmartContract
  participant DB as DB
  INV->>FE: Cria Oferta
  FE->>API: POST /marketplace/offers
  API->>MK: createOffer
  MK->>DB: insert offer
  DB-->>MK: OK
  MK-->>API: offerId
  API-->>FE: offerId
  FE->>API: POST /marketplace/offers/:id/match (borrowerId)
  API->>LN: createFromOffer
  LN->>DB: insert loan (status=PENDING_FUNDS)
  DB-->>LN: OK
  LN-->>API: loanId
  API-->>FE: loanId
  INV->>FE: Depositar
  FE->>API: POST /escrow/:loanId/deposit
  API->>ES: deposit
  ES->>SC: deposit(loanId,value)
  SC-->>ES: Event Deposited(hash)
  ES->>DB: insert escrow_event + update loan(FUNDS_LOCKED)
  API-->>FE: state=FUNDS_LOCKED
```

---

## 3. Release (Validações → Liberação)

```mermaid
sequenceDiagram
  autonumber
  participant SYS as Scheduler/Trigger
  participant API as Backend
  participant VAL as validationOrchestrator
  participant KYC as KYC API
  participant SCORE as Credit API
  participant ES as escrowService
  participant SC as SmartContract
  participant DB as DB
  SYS->>API: checkLoansToRelease
  API->>VAL: validate(loanId)
  VAL->>KYC: status(user)
  KYC-->>VAL: APPROVED
  VAL->>SCORE: score(user)
  SCORE-->>VAL: 780
  VAL-->>API: okToRelease=true
  API->>ES: release(loanId)
  ES->>SC: release(loanId)
  SC-->>ES: Event Released(hash)
  ES->>DB: update loan(ACTIVE) + escrow_event
  API-->>SYS: released
```

---

## 4. Repayment (Parcela Paga / Atraso)

```mermaid
sequenceDiagram
  autonumber
  participant BOR as Tomador
  participant FE as Frontend
  participant API as Backend
  participant RP as repaymentService
  participant WL as walletService
  participant DB as DB
  BOR->>FE: Pagar Parcela
  FE->>API: POST /loans/:loanId/repay {amount}
  API->>RP: registerPayment
  RP->>DB: fetch next installment
  DB-->>RP: installment data
  RP->>WL: transfer(borrower->investor, amount)
  WL-->>RP: txId
  RP->>DB: update repayment(status=PAID, paid_date)
  RP->>DB: insert transaction + audit_log
  API-->>FE: status=PAID, next_due=...
```

---

## 5. Penalty / Refund Flow

```mermaid
stateDiagram-v2
  [*] --> NORMAL
  NORMAL --> LATE : dueDate + graceExpired
  LATE --> PENALTY_APPLIED : penaltyJob
  PENALTY_APPLIED --> PARTIAL_PAID : payment < total
  PARTIAL_PAID --> SETTLED : remaining==0
  LATE --> DEFAULTED : thresholdExceeded
  NORMAL --> REFUND_REQUESTED : platformDecision
  REFUND_REQUESTED --> REFUNDED : escrow.refund()
  DEFAULTED --> COLLECTION : escalate
  COLLECTION --> SETTLED : recovery
```

---

## 6. Reconciliation (On-chain vs Off-chain)

```mermaid
sequenceDiagram
  autonumber
  participant JOB as ReconciliationJob
  participant CHAIN as RPC Provider
  participant DB as Database
  participant API as Backend
  JOB->>DB: SELECT loans ACTIVE/FUNDS_LOCKED
  DB-->>JOB: loan list
  loop Each Loan
    JOB->>CHAIN: getEvents(loanId)
    CHAIN-->>JOB: events[]
    JOB->>DB: fetch escrow_events(loanId)
    DB-->>JOB: stored[]
    JOB->>JOB: diff = chain \ stored
    alt diff not empty
      JOB->>API: POST /internal/reconcile {loanId,diff}
      API->>DB: insert missing events + audit
    end
  end
```

---

## 7. Estados de Loan / Escrow (Consolidado)

```mermaid
stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> PENDING_FUNDS : matchOffer
    PENDING_FUNDS --> FUNDS_LOCKED : deposit
    FUNDS_LOCKED --> ACTIVE : release
    FUNDS_LOCKED --> REFUNDED : refund
    ACTIVE --> DELINQUENT : missedPayment
    DELINQUENT --> DEFAULTED : thresholdExceeded
    DELINQUENT --> ACTIVE : catchUp
    ACTIVE --> SETTLED : allPaid
    REFUNDED --> [*]
    SETTLED --> [*]
    DEFAULTED --> [*]

```

---

## 8. Notas

- Diagramas servem como referência rápida para implementação / testes.
- Para adição futura: fluxo Secondary Market (transferência de posição) e fluxo de renegociação.
- Reconciliation é batch (ex: cron a cada 15 min) – pode evoluir para streaming com eventos on-chain.

> Atualizado 30/09/2025

# Backend Examples

These examples illustrate end-to-end orchestration across modules (credit analysis → digital account → lending contract → escrow) plus direct escrow operations.

## 1. Orquestração de Pedido de Empréstimo (Controller)

Requisição (JSON simplificado):

```
POST /api/qitech/credit/apply-loan
{
  "userId": "usr_123",
  "document": "12345678901",
  "name": "Maria Silva",
  "email": "maria@example.com",
  "phone": "11988887777",
  "birthDate": "1995-04-10",
  "monthlyIncome": 850000,        // centavos (R$ 8.500,00)
  "loanAmount": 1500000,          // centavos (R$ 15.000,00)
  "loanTerm": 12,
  "purpose": "capital de giro",
  "address": { "city": "São Paulo", "uf": "SP" }
}
```

Sequência (também nos diagramas):

1. Submete análise de crédito (mock ou QI Tech real).
2. Cria conta digital (bankingAsAService).
3. Gera contrato de crédito (lendingAsAService).
4. Calcula cronograma de pagamentos.
5. Faz depósito (ou simula) em escrow (blockchainService → escrowService).
6. Retorna visão agregada da aplicação.

## 2. Uso do Serviço de Escrow (Simplificado)

`escrowService` encapsula interações blockchain e guarda estado em memória (hackathon). Eventos simulam futura tabela `escrow_events`.

### Criar / Depositar

```
POST /api/escrow
{
  "escrowId": "escrow_loan_abc123",
  "borrowerAddress": "0xBorrower...",
  "lenderAddress": "0xLender...",
  "arbitratorAddress": "0xArb...",
  "amount": 1500000
}
```

Resposta (mock):

```
{
  "success": true,
  "escrow": {"id":"escrow_loan_abc123","status":"PENDING", ...},
  "chain": {"escrowContractAddress":"0x...","transactionHash":"0x..." }
}
```

### Liberar Fundos

```
POST /api/escrow/escrow_loan_abc123/release
```

### Reembolsar Fundos

```
POST /api/escrow/escrow_loan_abc123/refund
```

### Consultar Status

```
GET /api/escrow/escrow_loan_abc123
```

### Listar Eventos

```
GET /api/escrow/escrow_loan_abc123/events
```

## 3. Script Curl (Ciclo Escrow)

```bash
# 1. Criar escrow
echo "Criando escrow";
curl -s -X POST http://localhost:3000/api/escrow \
  -H 'Content-Type: application/json' \
  -d '{
    "escrowId":"escrow_demo_1", "borrowerAddress":"0xB...", "lenderAddress":"0xL...",
    "arbitratorAddress":"0xA...", "amount": 500000
  }' | jq '.';

# 2. Ver status
curl -s http://localhost:3000/api/escrow/escrow_demo_1 | jq '.';

# 3. Liberar fundos
curl -s -X POST http://localhost:3000/api/escrow/escrow_demo_1/release | jq '.';

# 4. Listar eventos
curl -s http://localhost:3000/api/escrow/escrow_demo_1/events | jq '.';
```

## 4. Modelo de Evento (Persistência Planejada)

```
escrow_events
-------------
id (uuid) PK
escrow_id (fk -> escrows / loan_contracts.id)
event_type (ENUM: CREATED, RELEASED, REFUNDED, PARTIAL_RELEASE, PENALTY_APPLIED)
payload JSONB (hash para dados sensíveis no futuro)
created_at timestamptz default now()
```

Estratégia hash-only on-chain: armazenar `keccak256(escrowId|action|timestamp)` para auditoria sem expor contexto sensível.

## 5. Pontos de Extensão

- Substituir armazenamento em memória por repositórios Knex (`escrows`, `escrow_events`).
- Adicionar idempotência (`Idempotency-Key`) ao POST /api/escrow.
- Integrar contrato Solidity estendido (liberação parcial & penalidades) mapeando estados.
- Webhooks: disparar ao liberar / reembolsar.
- Verificação de assinatura (EIP-712) antes de transições críticas.

## 6. Padrão de Tratamento de Erros

Controller responde 4xx validação, 5xx exceção. Service retorna `{ success:false, error }`; controller adapta para HTTP.

## 7. Notas de Segurança

- Validar formato de endereço (regex `^0x[a-fA-F0-9]{40}$`).
- Autorizar (middleware) somente partes corretas para release/refund.
- Futuro: rate limiting (ex.: 20/min) em endpoints de mutação.
- Logar apenas identificadores hash em produção (PII off-limits).

## 8. Ideias de Teste

- Unit: `createEscrow` persiste registro + evento.
- Unit: `releaseEscrow` altera status e registra evento.
- Integração: fluxo completo com `BLOCKCHAIN_MOCK_MODE=true`.
- Propriedade: várias execuções garantem ausência de double-release.

## 9. Mapeamento Roadmap

Fase 1: depósito/liberação básico.
Fase 2: liberação parcial + penalidades (contrato estendido).
Fase 3: event sourcing + reconciliação + mercado secundário.

---

Estes exemplos devem ser lidos junto com a especificação de API e diagramas de arquitetura para rápida compreensão pelo júri / avaliadores.

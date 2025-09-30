# QI Credit - Plataforma P2P com Smart Contracts & Blockchain

![logo](./logo.png)

---

## 📌 Introdução
A **QI Credit** é uma plataforma criada para integrar o hub de soluções financeiras da QI Tech.

Hoje a QI Tech já possui APIs maduras para análise de crédito B2B/P2P entre empresas, mas falta uma **porta de entrada transparente** com execução on-chain e escrow automatizado para operações P2P — nosso foco nesta proposta é **implementar smart contracts obrigatórios para execução via escrow** e **registro hash-only em blockchain** para garantir transparência e rastreabilidade.

### 4 pilares da plataforma
- **Smart Contracts:** automação do escrow e execução contratual (OBRIGATÓRIO).  
- **Infraestrutura P2P:** marketplace que conecta investidores e tomadores.  
- **Registro em blockchain (hash-only):** prova de existência e auditabilidade.  
- **Proof-of-funds (Hold/Capture):** garantia de que os fundos do investidor estão efetivamente reservados antes da ativação do contrato.

---

## 🚀 Fluxo da Plataforma (resumo)
1. Investidor cadastra-se e seleciona perfil de risco.  
2. Investidor cria `hold` (Proof-of-Funds) e deposita recursos no **smart contract escrow**.  
3. Tomador faz onboarding, KYC e passa pela análise de crédito (API QI Tech).  
4. Contrato digital é assinado pelas partes e um `eventHash` é registrado (hash-only) na blockchain.  
5. Smart contract libera os fundos para o tomador após validação.  
6. Tomador realiza pagamentos conforme cronograma; cada pagamento gera evento no contrato.  
7. Penalidades aplicadas automaticamente em caso de atraso; cláusulas de resolução são acionadas em inadimplência extrema.  
8. Dashboard permite acompanhamento e auditoria por todas as partes.

---

## 📂 Estrutura de pastas (sugestão)
```
HACKATHON-BH
├── certificado-nft
│   └── ...
├── client
│   └── ...
├── scroll
│   └── ...
├── token-smd
│   └── ...
├── README.md
```

---

## 🛠️ Tech Stack

### Backend & Blockchain
- **APIs QI Tech** (Onboarding, Credit Analysis, Wallet, Escrow).  
- **Blockchains alvo:** Scroll, Arbitrum (EVM compatible).  
- **Linguagens:** Rust / Solidity (smart contracts), Node.js (backend orchestration).

### Frontend
- **React.js** (UI/UX), Tailwind e React para estilo.

---

## 🗄️ Banco de Dados (Mini-DER)
**Entities (mínimo):**
- `users` (user_id, name, cpf/cnpj, email, status_kyc, created_at)  
- `wallets` (wallet_id, user_id, currency, balance, reserved_balance, created_at)  
- `marketplace_offers` (offer_id, investor_id, amount, rate, term, risk_profile, status)  
- `loans / contracts` (contract_id, borrower_id, offer_id, principal, rate, term, status, signed_at)  
- `escrow_events` (event_id, contract_id, event_type, amount, from_account, to_account, timestamp, tx_hash)  
- `transactions` (tx_id, wallet_id_from, wallet_id_to, amount, tx_type, status, created_at)

> **TODO:** Incluir DER detalhado (relacionamentos e cardinalidades) — *placeholder para próxima iteração*.

---

## 🔒 Escrow + Smart Contracts
**Conceito:**  
- O smart contract atua como escrow: recebe depósitos dos investidores, mantém fundos bloqueados até que condições (KYC, score, assinatura) sejam satisfeitas e executa liberação, penalidades ou reembolso automaticamente.  
- O registro na blockchain será **hash-only** (eventHash) para preservar privacidade e garantir auditabilidade.

**Fluxo resumido (técnico):**
1. `createLoan(borrower)` — plataforma cria registro de empréstimo no contrato on-chain (loanId).  
2. `deposit(loanId)` — investidor deposita ETH/asset no smart contract; evento `Deposited` emitido com `eventHash`.  
3. Off-chain: KYC + credit_analysis (QI API) → se aprovado, plataforma chama `release(loanId)` no smart contract.  
4. `release(loanId)` → smart contract envia fundos ao tomador; evento `Released` emitido com `eventHash`.  
5. Pagamentos periódicos executam eventos on-chain; inadimplência aciona `penalty` / cláusulas de resolução.  

**Parâmetros (escrow events):**  
- Entrada: `escrowId`, `contractId`, `eventType`, `amount`, `from`, `to`, `timestamp`.  
- Saída: `eventId`, `eventHash` (registrado em blockchain).

**Taxas:** gas fees (execução on-chain). Estratégia de tax passing/absorption definida no modelo de negócio.

---

### Exemplo de Smart Contract (Solidity — minimal, didático)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleEscrow {
    address public platform; 
    enum State { AWAITING_VALIDATION, FUNDS_LOCKED, RELEASED, REFUNDED }
    struct Loan {
        address investor;
        address borrower;
        uint256 amount;
        State state;
    }
    mapping(uint256 => Loan) public loans;
    uint256 public nextLoanId;

    event Deposited(uint256 loanId, address indexed investor, uint256 amount, bytes32 eventHash);
    event Released(uint256 loanId, address indexed borrower, uint256 amount, bytes32 eventHash);
    event Refunded(uint256 loanId, address indexed investor, uint256 amount, bytes32 eventHash);

    constructor() {
        platform = msg.sender;
    }

    function createLoan(address borrower) external returns (uint256) {
        require(msg.sender == platform, "only platform");
        loans[nextLoanId] = Loan(address(0), borrower, 0, State.AWAITING_VALIDATION);
        nextLoanId++;
        return nextLoanId - 1;
    }

    function deposit(uint256 loanId) external payable {
        require(msg.value > 0, "zero");
        Loan storage l = loans[loanId];
        require(l.amount == 0 && l.state == State.AWAITING_VALIDATION, "invalid state");
        l.investor = msg.sender;
        l.amount = msg.value;
        l.state = State.FUNDS_LOCKED;
        emit Deposited(loanId, msg.sender, msg.value, keccak256(abi.encodePacked(loanId, msg.sender, msg.value, block.timestamp)));
    }

    function release(uint256 loanId) external {
        require(msg.sender == platform, "only platform");
        Loan storage l = loans[loanId];
        require(l.state == State.FUNDS_LOCKED, "not locked");
        l.state = State.RELEASED;
        payable(l.borrower).transfer(l.amount);
        emit Released(loanId, l.borrower, l.amount, keccak256(abi.encodePacked(loanId, l.borrower, l.amount, block.timestamp)));
    }

    function refund(uint256 loanId) external {
        require(msg.sender == platform, "only platform");
        Loan storage l = loans[loanId];
        require(l.state == State.FUNDS_LOCKED, "not locked");
        l.state = State.REFUNDED;
        payable(l.investor).transfer(l.amount);
        emit Refunded(loanId, l.investor, l.amount, keccak256(abi.encodePacked(loanId, l.investor, l.amount, block.timestamp)));
    }
}
```

> **Nota:** Código didático — revisão de segurança/auditoria obrigatória antes de produção.

---

## 🔗 APIs
- **Onboarding** (KYC)  
- **Credit Analysis** (score/decisão)  
- **Wallet** (saldo, pix, transferências)  
- **Escrow** (reconciliation, proof-of-funds, eventos)

> **TODO:** Incluir exemplos de chamadas API (curl / JSON) após documentação final e mapeamento das rotas QI Tech.

---

## 🖼️ Diagramas
- [Fluxo de Aplicação] (fluxoaplicacao.png)

- Fluxo de API.
[Fluxo de API] (fluxoapi.png)

---

## 📊 KPIs / Métricas de Sucesso
- **Tempo médio de onboarding:** target < 5 min.  
- **% de contratos liberados após validação:** target > 95%.  
- **% de pagamentos on-time:** target > 90%.  
- **% de reconciliação automática de escrow:** target > 99%.

---

## 📅 Roadmap
- **Collateral Management:** registro e avaliação de garantias.  
- **Collections / Renegociação:** fluxo de cobrança, notificações e renegociação.  
- **Rate Engine / Amortization:** cálculos SAC, PRICE, juros e multas.  
- **Secondary Market:** permitir venda de posição por investidores.  
- **IA externa no score:** pesquisa/PoC para uso de dados alternativos (ex.: redes sociais) — *roadmap apenas, não será desenvolvido no hackathon*.

---

## 💡 Diferenciais - “Wow factor”
- **Chatbot trilíngue (EN/ES/PT-BR).**  
- **Blockchain Proof-of-Existence** (registro hash-only).  
- **Smart Contract no escrow:** automação e redução de intermediários (gas-fee only).  
- **Opções de saque para o tomador:** valor cheio (juros maiores) ou parcelado (juros menores).

---

## 🔧 Considerações Técnicas

**Infraestrutura**
- Banco de dados relacional (Postgres / MySQL).  
- Integração BaaS (wallets, Pix, geração de cobranças).  
- Monitoramento: logs, métricas, alertas (Prometheus / Grafana).

**Segurança**
- KYC/Onboarding integrado via QI APIs.  
- AML / Sanctions Screening.  
- Assinatura digital de contratos (CCB) e armazenamento seguro de documentos.  
- Compliance LGPD (consent / right-to-be-forgotten pipeline).

---

## ▶️ How to Run / Demo Script
> **TODO:** Incluir passo-a-passo detalhado para demo:
- Ex.: 1) criar investidor → 2) criar loanId → 3) investidor `deposit(loanId)` (hold) → 4) tomador onboarding + credit_analysis → 5) plataforma chama `release(loanId)` → 6) registrar pagamentos.

---

## 🙏 Agradecimentos
Um agradecimento especial à equipe da **Poli Júnior** e à **QI Tech** pela oportunidade e abertura das APIs.

---

## ⚠️ Disclaimer
A QI Tech já utiliza blockchain e Web3 em APIs de câmbio e stablecoin. Nossa proposta é **expandir** essa infraestrutura para o mercado de crédito P2P, com foco em escrow automatizado, transparência e rastreabilidade (hash-only).  
Este README é uma versão MVP/POC — itens de produção (auditoria de smart contracts, monitoramento, GL, collections) estão no roadmap.

```

# QI Credit - Plataforma P2P com Smart Contracts & Blockchain

![logo](./logo.png)

---

## Introdução

A **QI Credit** é uma plataforma criada para integrar o hub de soluções financeiras da QI Tech.

Hoje a QI Tech já possui APIs maduras para análise de crédito B2B/P2P entre empresas, mas falta uma **porta de entrada transparente** com execução on-chain e escrow automatizado para operações P2P — nosso foco nesta proposta é **implementar smart contracts obrigatórios para execução via escrow** e **registro hash-only em blockchain** para garantir transparência e rastreabilidade.

### 4 pilares da plataforma

- **Smart Contracts:** automação do escrow e execução contratual.
- **Infraestrutura P2P:** marketplace que conecta investidores e tomadores.
- **Registro em blockchain (hash-only):** prova de existência e auditabilidade.
- **Proof-of-funds (Hold/Capture):** garantia de que os fundos do investidor estão efetivamente reservados antes da ativação do contrato.

---

## Quick Start

### - Executar a Aplicação

```bash
# Na raiz do projeto
npm start
# ou
npm run dev

# Acesse: http://localhost:8080
```

### - Instalação Completa

#### *Instalação Rápida*

```bash
# Instalar todas as dependências
npm run setup

# Verificar se tudo foi instalado corretamente
npm run help
```

#### *Instalação Manual por Workspace*

```bash
# Instalar dependências do projeto raiz
npm install

# Instalar dependências do frontend
npm run install:frontend
# ou: cd frontend && npm install

# Backend (quando implementado)
cd backend && npm install

# Blockchain (quando implementado)
cd blockchain && npm install
```

#### *Pré-requisitos*

```bash
# Verificar versões necessárias
node --version    # >=18.0.0
npm --version     # >=9.0.0

# Instalar dependências globais (opcional)
npm install -g typescript vite
```

#### *Configuração de Ambiente*

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar variáveis de ambiente
nano .env
```

### - Comandos Disponíveis

```bash
npm start           # Inicia servidor de desenvolvimento
npm run build       # Build para produção
npm run lint        # Executa linting
npm run type-check  # Verificação TypeScript
npm run clean       # Limpa caches
npm run help        # Lista todos os comandos
```

---

## 📁 Estrutura do Projeto

```
QI-Credit/
├── apis/                      # Módulos de API específicos
│   ├── credit-analysis/          # Análise de crédito (QI Tech)
│   │   ├── controllers/          # Controladores de crédito
│   │   ├── models/               # Modelos de dados
│   │   ├── routes.js             # Rotas da API
│   │   └── services/             # Serviços de negócio
│   ├── escrow/                   # Gestão de escrow
│   │   ├── controllers/          # Lógica de escrow
│   │   ├── models/               # Modelos de transação
│   │   ├── routes.js             # Endpoints de escrow
│   │   └── services/             # Serviços blockchain
│   ├── onboarding/               # KYC e cadastro
│   │   ├── controllers/          # Fluxo de onboarding
│   │   ├── models/               # Modelos de usuário
│   │   ├── routes.js             # APIs de cadastro
│   │   └── services/             # Validações KYC
│   └── wallet/                   # Carteira digital
│       ├── controllers/          # Gestão de saldos
│       ├── models/               # Modelos financeiros
│       ├── routes.js             # APIs de wallet
│       └── services/             # Integrações Pix/Banco
│
├── backend/                   # Servidor principal Node.js
│   ├── app.js                    # Configuração da aplicação
│   ├── server.js                 # Inicialização do servidor
│   ├── config/                   # Configurações (DB, ENV)
│   ├── controllers/              # Controllers principais
│   ├── middlewares/              # Middlewares (auth, logs)
│   ├── services/                 # Serviços compartilhados
│   └── utils/                    # Utilitários e helpers
│
├── blockchain/                 # Smart Contracts & Web3
│   ├── contracts/                # Contratos Solidity
│   ├── migrations/               # Deploy e versionamento
│   ├── scripts/                  # Scripts de automação
│   └── tests/                    # Testes de contratos
│
├── database/                  # Persistência de dados
│   ├── knexfile.js               # Configuração Knex.js
│   ├── migrations/               # Migrações do banco
│   ├── models/                   # Modelos ORM/ODM
│   └── seeders/                  # Dados iniciais
│
├── frontend/                   # Interface React + TypeScript
│   ├── public/                   # Assets estáticos
│   ├── src/
│   │   ├── components/           # Componentes reutilizáveis
│   │   │   ├── dashboard/        # Componentes do dashboard
│   │   │   ├── onboarding/       # Fluxo KYC
│   │   │   ├── ui/               # Componentes UI (Shadcn/UI)
│   │   ├── contexts/             # Contexts React
│   │   ├── hooks/                # Custom hooks
│   │   ├── lib/                  # Bibliotecas e utils
│   │   ├── pages/                # Páginas da aplicação
│   │   ├── services/             # Serviços API
│   │   ├── styles/               # Estilos globais
│   │   ├── App.tsx               # Componente raiz
│   │   ├── main.tsx              # Entry point React
│   ├── package.json              # Dependências frontend
│   ├── tailwind.config.ts        # Configuração Tailwind
│   ├── tsconfig.json             # Configuração TypeScript
│   └── vite.config.ts            # Configuração Vite
│
├── docs/                      # Documentação técnica
│   ├── api-specification.md      # Especificação das APIs
│   ├── architecture.md           # Arquitetura do sistema
│   ├── diagrams/                 # Diagramas técnicos
│   ├── roadmap.md                # Roadmap do produto
│
├── scripts/                   # Scripts de automação
│
├── tests/                     # Suíte de testes
│   ├── e2e/                      # Testes end-to-end
│   ├── integration/              # Testes de integração
│   └── unit/                     # Testes unitários
│
├── .env.example               # Exemplo variáveis ambiente
├── .gitignore                 # Arquivos ignorados Git
├── LICENSE                    # Licença MIT
└── README.md                  # Documentação principal
```
## 🛠️ Tech Stack

### **apis/** - Módulos de API Específicos

Arquitetura modular onde cada funcionalidade principal tem sua própria estrutura:

- **credit-analysis/**: Integração com APIs QI Tech para análise de crédito e scoring
- **escrow/**: Gestão de fundos bloqueados e smart contracts de escrow
- **onboarding/**: Processo KYC completo (documentos, selfie, validações)
- **wallet/**: Carteira digital, saldos, Pix e transferências bancárias

- O smart contract atua como escrow: recebe depósitos dos investidores, mantém fundos bloqueados até que condições (KYC, score, assinatura) sejam satisfeitas e executa liberação, penalidades ou reembolso automaticamente.
- O registro na blockchain será **hash-only** (eventHash) para preservar privacidade e garantir auditabilidade.

**Parâmetros (escrow events):**

- Entrada: `escrowId`, `contractId`, `eventType`, `amount`, `from`, `to`, `timestamp`.
- Saída: `eventId`, `eventHash` (registrado em blockchain).

**Taxas:** gas fees (execução on-chain). Estratégia de tax passing/absorption definida no modelo de negócio.


- **Onboarding** (KYC)
- **Credit Analysis** (score/decisão)
- **Wallet** (saldo, pix, transferências)
- **Escrow** (reconciliation, proof-of-funds, eventos)

> **TODO:** Incluir exemplos de chamadas API (curl / JSON) após documentação final e mapeamento das rotas QI Tech.

Se quiser visualizar melhor todo mapeamento de api acesse o documento abaixo:
[Documentação completa das API's](docs/api-specification.md)

### **backend/** - Servidor Principal

Core da aplicação Node.js com arquitetura RESTful:

- **app.js**: Configuração Express, middlewares, rotas
- **server.js**: Inicialização do servidor, conexões DB
- **config/**: Configurações de ambiente, banco, APIs externas
- **middlewares/**: Autenticação, logs, CORS, rate limiting
- **services/**: Lógica de negócio compartilhada entre módulos

- **APIs QI Tech** (Onboarding, Credit Analysis, Wallet, Escrow).
- **Blockchains alvo:** Scroll, Arbitrum (EVM compatible).
- **Linguagens:** Rust / Solidity (smart contracts), Node.js (backend orchestration).


### **blockchain/** - Smart Contracts

Infraestrutura Web3 para escrow automatizado:

- **contracts/**: Contratos Solidity (escrow, tokens, governance)
- **migrations/**: Scripts de deploy e versionamento blockchain
- **scripts/**: Automação (deploy, verify, interact)
- **tests/**: Testes unitários dos contratos (Hardhat/Foundry)

### **database/** - Persistência

Camada de dados com Knex.js/PostgreSQL:

- **knexfile.js**: Configurações de conexão multi-ambiente
- **migrations/**: Versionamento schema (users, loans, transactions)
- **models/**: Modelos ORM com relacionamentos
- **seeders/**: Dados iniciais para desenvolvimento/testes


**Entities (mínimo):**

- `users` (user_id, name, cpf/cnpj, email, status_kyc, created_at)
- `wallets` (wallet_id, user_id, currency, balance, reserved_balance, created_at)
- `marketplace_offers` (offer_id, investor_id, amount, rate, term, risk_profile, status)
- `loans / contracts` (contract_id, borrower_id, offer_id, principal, rate, term, status, signed_at)
- `escrow_events` (event_id, contract_id, event_type, amount, from_account, to_account, timestamp, tx_hash)
- `transactions` (tx_id, wallet_id_from, wallet_id_to, amount, tx_type, status, created_at)
> **TODO:** Incluir DER detalhado (relacionamentos e cardinalidades) — _placeholder para próxima iteração_.

Se quiser visualizar melhor toda arquitetura acesse o documento abaixo:
[Documentação completa da Arquitetura](docs/architecture.md)

### **frontend/** - Interface React

SPA moderna com TypeScript, Vite e Tailwind:

- **components/dashboard/**: Componentes específicos do painel administrativo
- **components/onboarding/**: Fluxo KYC em 4 etapas com validações
- **components/ui/**: Design system baseado em Shadcn/UI e Radix
- **contexts/**: Estado global React (onboarding, auth, theme)
- **hooks/**: Custom hooks para lógica reutilizável
- **pages/**: Rotas principais da aplicação (SPA routing)
- **services/**: Camada de comunicação com APIs (axios, fetch)

- **React.js** (UI/UX), Tailwind e React para estilo.

### **scripts/** - Automação

Scripts bash para operações comuns:

- **setup.sh**: Instalação inicial completa (deps, DB, env)
- **start.sh**: Inicialização orquestrada (backend + frontend)
- **test.sh**: Execução de suíte de testes completa

### **tests/** - Qualidade

Estratégia de testes multicamada:

- **unit/**: Testes unitários (Jest, Vitest)
- **integration/**: Testes de API e integração
- **e2e/**: Testes end-to-end (Playwright, Cypress)

---

## Fluxo da Plataforma - resumo:

1. Investidor cadastra e seleciona perfil de risco.
2. Investidor cria `hold` (Proof-of-Funds) e deposita recursos no **smart contract escrow**;
3. Tomador faz onboarding, KYC e passa pela análise de crédito (API QI Tech);
4. Contrato digital é assinado pelas partes e um `eventHash` é registrado (hash-only) na blockchain;
5. Smart contract libera os fundos para o tomador após validação;
6. Tomador realiza pagamentos conforme cronograma - cada pagamento gera evento no contrato;
7. Penalidades aplicadas automaticamente em caso de atraso - cláusulas de resolução são acionadas em inadimplência extrema;
8. Dashboard permite acompanhamento e auditoria por todas as partes.

---

## Fluxo resumido - técnico:

1. `createLoan(borrower)` — plataforma cria registro de empréstimo no contrato on-chain (loanId);
2. `deposit(loanId)` — investidor deposita ETH/asset no smart contract; evento `Deposited` emitido com `eventHash`;
3. Off-chain: KYC + credit_analysis (QI API) - *se aprovado, plataforma chama `release(loanId)` no smart contract*;
4. `release(loanId)` → smart contract envia fundos ao tomador; evento `Released` emitido com `eventHash`;
5. Pagamentos periódicos executam eventos on-chain; inadimplência aciona `penalty` / cláusulas de resolução.

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

---

## 📊 KPIs / Métricas de Sucesso

- **Tempo médio de onboarding:** target < 5 min.
- **% de contratos liberados após validação:** target > 95%.
- **% de pagamentos on-time:** target > 90%.
- **% de reconciliação automática de escrow:** target > 99%.

---

## Roadmap

- **Collateral Management:** registro e avaliação de garantias.
- **Collections / Renegociação:** fluxo de cobrança, notificações e renegociação.
- **Rate Engine / Amortization:** cálculos SAC, PRICE, juros e multas.
- **Secondary Market:** permitir venda de posição por investidores.
- **IA externa no score:** pesquisa/PoC para uso de dados alternativos (ex.: redes sociais) 

— _roadmap apenas, não será desenvolvido no hackathon_.

---

## Diferenciais - “Wow factor”

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

## 🙏 Agradecimentos

Um agradecimento especial à equipe da **Poli Júnior** e à **QI Tech** pela oportunidade e abertura das APIs.

---

## ⚠️ Disclaimer

A QI Tech já utiliza blockchain e Web3 em APIs de câmbio e stablecoin. Nossa proposta é **expandir** essa infraestrutura para o mercado de crédito P2P, com foco em escrow automatizado, transparência e rastreabilidade (hash-only).  
Este README é uma versão MVP/POC — itens de produção (auditoria de smart contracts, monitoramento, GL, collections) estão no roadmap.
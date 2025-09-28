# QI Credit - Acesso a crédito entre PF's OU Concessão e gestão de crédito por meio de um marketplace P2P ( a definir qual frase possui proposta de valor mais impactante)

![logo](./logo.png)

## Introdução
A QI Credit é uma plataforma criada para integrar o hub de soluções financeiras da QI Tech. Hoje, a empresa não possui uma solução voltada para a PF (pessoa física), sendo assim a QI Credit foi criada para conceder e gerir crédito entre pesssoas de forma segura, transparente e automatizada. A plataforma cobre 4 principais pilares: 
- Existência de uma carteira;
- Infraestrutura P2P;
- Sistema antifraude;
- Score de crédito.

Nela, usuários (a definir) tomam acesso a opções de crédito diversas (e talvez mais baratas, não é possível afirmar) enquanto financiadores ganham acesso a opções de investimentos que diversificam seu patrimônio em troca de taxas acima da selic/inflação correndo mais riscos, lógico.

Em resumo usamos blockchain, smart contracts, análise de crédito com IA e carteira digital integrada para democratizar o acesso a crédito.

## Fluxo da Plataforma
1.Investidor cadastra-se e seleciona perfil de risco.
2. Realiza o aporte financeiro que é depositado em smart contract escrow.
3. Tomador passa por onboarding, validação e análise de crédito.
4. Contrato digital é assinado pelas partes e armazenado em blockchain.
5. Smart contract libera o crédito após validação.
6. Tomador recebe crédito e realiza pagamentos conforme cronograma.
7. Sistema aplica penalidades automaticamente em caso de inadimplência.
8. Dashboard transparente para acompanhamento de todos os envolvidos.

## Features
- Onboarding e KYC: API QI Tech para cadastro, validação e antifraude;
- Análise de Crédito: íA integrada para score financeiro;
- Antifraude básico;
- Carteira Digital: Gestão de recursos, movimentações e histórico financeiro;
- Proof-of-funds (Hold/capture);
- Smart Contracts: Automatização do escrow e execução contratual;
- Registro em blockchain (Hash only).

## Estrutura de pastas

```
HACKATHON-BH
├── certificado-nft
│   └── ...
├── client
│   └── ...
├── scroll
|   └── ...
├── token-smd
|   └── ...
├── README.MD
│   
```

## Tech Stacks

### Backend & Blockchain
APIs QI Tech e Zaig.
Blockchain pública/privada para smart contracts.
#### Blockchains
- Scroll
- Arbitrum

#### Pacotes externos
- rustup
- rustc
- cargo

### Front-end
Frameworks modernos para frontend (React) e backend (Node.js).
#### Pacotes externos
- React

## Roadmap
Planejamos implementar outras funcionalidades ao pensar no projeto a longo prazo, sendo elas:
- **Collateral Management:** registro e avaliação de garantias.
- **Collections / Renegociação:** inadimplência, notificações, renegociação, cobrança.
- **Consent & Data Privacy (LGPD):** registro e revogação de consentimentos.
  a) **Reporting & Compliance:** relatórios para reguladores, auditoria.
  b) **Model Monitoring & Explainability:** monitoramento de modelos, explicabilidade (XAI).
- **Rate Engine / Amortization:** cálculos SAC, PRICE, juros e multas.
- **Secondary Market:** liquidez para investidores (venda de posição antes do prazo).

## Agradecimentos
Um agradecimento especial à equipes de organização da Poli Júnior e a QI Tech pela oportunidade. 

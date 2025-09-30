# Segurança Front-End

> Objetivo: Descrever práticas recomendadas para proteger dados sensíveis, fluxos de assinatura, interação com carteira/identidade e mitigar vetores comuns (XSS, CSRF, supply chain) no contexto da QI Credit.

## 1. Princípios

- Mínimo privilégio: evitar expor chaves ou escopos maiores que o necessário.
- Defense in depth: combinação de headers, validação, isolamento lógico e monitoração.
- Zero trust no cliente: tudo que chega ao backend é revalidado.
- Redução de superfície: componentes com escopo claro e sem dependências não utilizadas.

## 2. Armazenamento Seguro

| Tipo de Dado                  | Local Recomendado                                 | Observações                       |
| ----------------------------- | ------------------------------------------------- | --------------------------------- |
| Token de sessão (JWT)         | Cookie `httpOnly`, `Secure`, `SameSite=Strict`    | Evita acesso por JS (mitiga XSS). |
| Refresh token                 | Mesmo cookie ou rotacionado via endpoint dedicado | Rotação periódica.                |
| Chaves públicas de contrato   | Bundle estático / `.env` de build                 | Nunca expor chave privada.        |
| Preferências UX não sensíveis | `localStorage`/`IndexedDB`                        | Sanitizar ao ler.                 |
| Dados sensíveis temporários   | State in-memory (React context)                   | Limpar ao logout / inatividade.   |

Nunca armazenar: documentos completos, hashes de assinatura reutilizáveis, seeds / mnemonics.

## 3. Proteção contra XSS

- Escapar sempre conteúdo dinâmico (React já ajuda, evitar `dangerouslySetInnerHTML`).
- CSP estrita (`Content-Security-Policy`): `script-src 'self' 'nonce-<dinamico>'` + bloquear inline não autorizado.
- Sanitizar entrada rica (ex: campos com HTML) usando lib aprovada (DOMPurify) no backend ou na borda.
- Não interpolar dados de usuário em templates sem validação de charset / whitelist.

## 4. Proteção contra CSRF

- Uso de `SameSite=Strict` nos cookies de sessão.
- Reforço via token anti-CSRF (Double Submit Cookie ou Synchronizer Token) em rotas mutativas caso abra exceções de SameSite (ex: integrações iframe).
- Rejeitar `Content-Type` estranhos em endpoints JSON (aceitar somente `application/json`).
- Verificar cabeçalho `Origin`/`Referer` em ações sensíveis (liberar lista de domínios confiáveis).

## 5. Gestão de Chaves & Segredos

- Chaves privadas somente em backend ou signer custodial (nunca no bundle). Se for fluxo não-custodial futuramente, usar provider de carteira do usuário (MetaMask / WalletConnect) e assinar transações client-side sem enviar a private key.
- Variáveis frontend prefixadas (`VITE_` / `NEXT_PUBLIC_`) NÃO são seguras; restringir ao mínimo (expor somente endpoints públicos e chain IDs).
- Rotacionar chaves de API de serviços terceiros via pipeline (CI) + revogação imediata em caso de vazamento.

## 6. Fluxo de Assinatura (EIP-712 / Mensagens)

1. Backend gera payload canônico (ordenado, sem campos supérfluos) + `nonce` + `expiresAt`.
2. Front-end solicita à carteira do usuário assinatura (EIP-712 typed data preferencial para legibilidade / anti-phishing).
3. Assinatura enviada ao backend que valida:
   - Domínio / chainId esperado
   - `nonce` não reutilizado (tabela `signature_nonces` ou cache Redis)
   - `expiresAt` não expirado
4. Backend armazena apenas hash da mensagem original + assinatura + endereço.
5. Evento correlacionado gera log auditável.

Resultado: impossibilita replay e reduz ataque de "assinatura cega".

## 7. Isolamento de Contexto

- Separar domínio de UI pública e painel administrativo (ex: `app.qicredit` vs `admin.qicredit`).
- Serviço de upload isolado (`uploads.qicredit`) sem cookies de sessão -> previne ataque via execução de arquivo malicioso.
- Iframes sandboxed (`sandbox="allow-scripts allow-same-origin"` apenas quando estritamente necessário).

## 8. Controle de Dependências (Supply Chain)

- Auditoria periódica (`npm audit` / `snyk`) + bloqueio de builds se high severity não mitigados.
- Fixar versões (`package-lock.json`) e evitar dependências abandonadas.
- Verificar integridade (Subresource Integrity) para scripts CDN (idealmente evitar CDN público em produção).

## 9. Monitoramento & Observabilidade de Segurança

| Métrica                           | Descrição                                | Ferramenta              |
| --------------------------------- | ---------------------------------------- | ----------------------- |
| Taxa de falha de login            | Possível brute force                     | Logs + dashboard        |
| Tentativas de assinatura inválida | Replay / phishing                        | Audit trail             |
| Erros de CSP violations           | Tentativas XSS                           | Report-Only + collector |
| Uso de tokens expirados           | Tokens roubados / relógio desincronizado | Auth logs               |

Alertas automáticos via Webhook/Slack ao ultrapassar thresholds.

## 10. Anti-abuso & Rate Limiting

- Rate limit progressivo (ex.: 60 req / 1 min por IP em rotas de auth; burst tokens)
- Bloqueio adaptativo: aumentar timeout em tentativas repetidas de assinatura inválida.
- Captcha invisível somente em padrão anômalo (último recurso).

## 11. Boas Práticas de UX Segura

- Indicar claramente o que o usuário está assinando (exibir campos relevantes + hash truncado).
- Mostrar rede / chain ativa para evitar transações em chain equivocada.
- Feedback claro em falhas de validação (sem vazar lógica interna).

## 12. Checklist de Review Front-End

| Item                                              | Ok? | Notas |
| ------------------------------------------------- | --- | ----- |
| Nenhum uso de `eval` ou `Function()`              |     |       |
| CSP configurada (prod)                            |     |       |
| Cookies `httpOnly` + `Secure` + `SameSite`        |     |       |
| Dependências auditadas                            |     |       |
| Assinaturas com nonce + expiração                 |     |       |
| Sanitização de inputs ricos                       |     |       |
| Tratamento consistente de erros (sem stack brute) |     |       |
| Logs sem PII                                      |     |       |

## 13. Roadmap de Segurança Front-end

| Fase | Entrega                               | Benefício                     |
| ---- | ------------------------------------- | ----------------------------- |
| F1   | Cookies seguros + CSP básica          | Mitiga XSS inicial            |
| F2   | EIP-712 + nonce store                 | Evita replay / phishing       |
| F3   | Monitoramento CSP + alertas           | Visibilidade                  |
| F4   | Isolation uploads + SRI               | Reduz superfície supply chain |
| F5   | Modo assinatura avançada (multi-step) | UX + redução erro humano      |

---

**Referências:** OWASP ASVS / OWASP Top 10 / EIP-712 / MDN Web Security Cheatsheet.

> Última atualização: 30/09/2025

# Validações de Formulário - Onboarding

## Resumo das Correções Implementadas

### 1. Campo Nome Completo

- **Validação**: Apenas letras (maiúsculas, minúsculas, acentos), espaços, hífens e apostrofes
- **Limite**: Máximo 255 caracteres
- **Implementação**:
  - Filtro automático remove caracteres inválidos
  - Contador de caracteres em tempo real
  - Regex: `/^[a-zA-ZÀ-ÿ\u00C0-\u017F\s'-]+$/`

### 2. Campo CPF/CNPJ

- **Armazenamento**: Apenas números (sem formatação)
- **Tipo do Campo**: VARCHAR(14)
- **Campo Adicional**: `documentType` CHAR(1) ('F' para CPF, 'J' para CNPJ)
- **Validação**:
  - CPF: 11 dígitos com validação matemática
  - CNPJ: 14 dígitos com validação matemática
  - Formatação automática para exibição
  - Detecção automática do tipo (F/J)

### 3. Campo Email

- **Tipo**: VARCHAR(255)
- **Limite**: Máximo 255 caracteres
- **Validação Backend**: Regex `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
- **Validação Frontend**: `<input type="email">` + regex personalizada
- **Implementação**: Contador de caracteres + validação obrigatória de @

### 4. Campo Senha

- **Tipo**: VARCHAR(20)
- **Limite**: Mínimo 8, máximo 20 caracteres
- **Implementação**:
  - Bloqueio de entrada após 20 caracteres
  - Validação de comprimento mínimo
  - Contador de caracteres
  - Toggle de visibilidade

## Estrutura de Dados

```typescript
interface OnboardingData {
  fullName: string; // Máximo 255 chars, apenas letras
  document: string; // Apenas números, 11 ou 14 dígitos
  documentType: 'F' | 'J'; // F = CPF, J = CNPJ
  email: string; // Máximo 255 chars, formato válido
  password: string; // 8-20 caracteres
}
```

## Funções de Validação

### `validationUtils.validateFullName(name: string)`

- Valida se contém apenas letras
- Verifica limite de 255 caracteres
- Verifica mínimo de 3 caracteres

### `validationUtils.validateDocument(document: string)`

- Remove caracteres não numéricos
- Valida CPF (11 dígitos) com algoritmo
- Valida CNPJ (14 dígitos) com algoritmo
- Retorna tipo de documento (F/J)

### `validationUtils.validateEmail(email: string)`

- Verifica formato com regex rigorosa
- Valida limite de 255 caracteres

### `validationUtils.validatePassword(password: string)`

- Verifica comprimento entre 8-20 caracteres

## Formatação e Filtros

### `validationUtils.onlyLetters(value: string)`

- Remove todos os caracteres que não sejam letras, espaços, hífens ou apostrofes

### `validationUtils.onlyNumbers(value: string)`

- Remove todos os caracteres não numéricos

### `validationUtils.formatDocument(document: string)`

- Formata CPF: `000.000.000-00`
- Formata CNPJ: `00.000.000/0000-00`

## Interface de Usuário

- **Contadores de caracteres**: Mostram utilização atual/máximo
- **Feedback em tempo real**: Validação enquanto o usuário digita
- **Mensagens de erro**: Específicas para cada tipo de validação
- **Formatação automática**: CPF/CNPJ são formatados para exibição
- **Prevenção de entrada inválida**: Filtros impedem digitação de caracteres inválidos

## Compatibilidade Backend

Os dados são enviados no formato correto para armazenamento:

- `fullName`: String limpa, apenas letras
- `document`: String numérica (11 ou 14 dígitos)
- `documentType`: 'F' ou 'J'
- `email`: String validada com regex
- `password`: String entre 8-20 caracteres

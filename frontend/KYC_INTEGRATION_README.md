# KYC Onboarding - Guia de Integração

## 📋 Visão Geral

Sistema completo de onboarding KYC com 4 passos:
1. **Dados Básicos** - Nome, CPF/CNPJ, email, senha
2. **Upload de Documentos** - RG/CPF (frente/verso), comprovante
3. **Selfie** - Captura via câmera ou upload
4. **Revisão** - Confirmação e envio final

## 🎨 Design System

### Tipografia
- **Fontes**: Plus Jakarta Sans (headings) + Inter (corpo)
- **Escalas**: H1 (48px), H2 (40px), H3 (32px), H4 (28px), Body (20/18/16/14px)

### Cores (HSL)
- **Primary**: `hsl(226, 64%, 49%)` - #2952CC
- **Secondary**: `hsl(186, 100%, 39%)` - #00B3C6
- **Success**: `hsl(163, 100%, 38%)` - #00C28B
- **Error**: `hsl(351, 89%, 60%)` - #F43F5E

### Breakpoints
- **mobile**: 390px
- **desktop-sm**: 1280px
- **desktop-md**: 1512px
- **desktop-lg**: 1728px

## 🔧 Arquitetura

```
src/
├── contexts/
│   └── OnboardingContext.tsx      # Estado global do onboarding
├── services/
│   └── onboardingService.ts       # Mock backend (substituir por APIs reais)
├── components/onboarding/
│   ├── ProgressBar.tsx
│   ├── Step1BasicData.tsx
│   ├── Step2Documents.tsx
│   ├── Step3Selfie.tsx
│   └── Step4Review.tsx
└── pages/
    ├── Index.tsx                  # Landing page
    └── Onboarding.tsx             # Fluxo principal
```

## 🔌 Integrando com Backend Real

### 1. Configurar Base URL da API

Crie um arquivo `src/config/api.ts`:

```typescript
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  SUBMIT_BASIC_DATA: '/onboarding/basic-data',
  UPLOAD_DOCUMENT: '/onboarding/:id/documents',
  SUBMIT_SELFIE: '/onboarding/:id/selfie',
  FINALIZE_ONBOARDING: '/onboarding/:id/finalize',
  CHECK_KYC_STATUS: '/onboarding/:id/kyc-status',
};
```

### 2. Substituir Mock no onboardingService.ts

#### Exemplo: submitBasicData

**Mock atual:**
```typescript
export async function submitBasicData(payload: {...}) {
  await simulateDelay(800);
  return { status: 'ok', data: { onboardingId: `onb_${Date.now()}` } };
}
```

**Integração real:**
```typescript
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

export async function submitBasicData(payload: {
  fullName: string;
  document: string;
  email: string;
  password: string;
}): Promise<ApiResponse<{ onboardingId: string; userId: string }>> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.SUBMIT_BASIC_DATA}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      status: 'ok',
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: error.response?.data?.message || 'Erro ao processar dados',
    };
  }
}
```

#### Exemplo: uploadDocument

**Integração real com FormData:**
```typescript
export async function uploadDocument(
  onboardingId: string,
  file: File,
  docType: 'idFront' | 'idBack' | 'proof'
): Promise<ApiResponse<{ fileId: string; urlPreview: string }>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);

    const response = await axios.post(
      `${API_BASE_URL}/onboarding/${onboardingId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      status: 'ok',
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: error.response?.data?.message || 'Erro no upload',
    };
  }
}
```

#### Exemplo: submitSelfie

**Integração real:**
```typescript
export async function submitSelfie(
  onboardingId: string,
  imageBlob: Blob | File
): Promise<ApiResponse<{ livenessScore: number; faceDetected: boolean }>> {
  try {
    const formData = new FormData();
    formData.append('selfie', imageBlob, 'selfie.jpg');

    const response = await axios.post(
      `${API_BASE_URL}/onboarding/${onboardingId}/selfie`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      status: 'ok',
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: error.response?.data?.message || 'Erro ao processar selfie',
    };
  }
}
```

## 📝 Contratos de API Esperados

### POST /api/onboarding/basic-data

**Request Body:**
```json
{
  "fullName": "João Silva",
  "document": "12345678900",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "onboardingId": "onb_1234567890",
  "userId": "usr_9876543210"
}
```

### POST /api/onboarding/{id}/documents

**Request:** `multipart/form-data`
- `file`: File (JPG/PNG/PDF, max 8MB)
- `docType`: 'idFront' | 'idBack' | 'proof'

**Response (200):**
```json
{
  "fileId": "file_abc123",
  "urlPreview": "https://cdn.example.com/preview/abc123.jpg"
}
```

### POST /api/onboarding/{id}/selfie

**Request:** `multipart/form-data`
- `selfie`: Image file

**Response (200):**
```json
{
  "livenessScore": 0.95,
  "faceDetected": true
}
```

### POST /api/onboarding/{id}/finalize

**Request Body:**
```json
{
  "confirmData": true
}
```

**Response (200):**
```json
{
  "kycStatus": "pending",
  "submittedAt": "2024-01-15T10:30:00Z"
}
```

### GET /api/onboarding/{id}/kyc-status

**Response (200):**
```json
{
  "kycStatus": "approved",
  "reason": null,
  "updatedAt": "2024-01-15T12:00:00Z"
}
```

Status possíveis: `pending`, `in_review`, `approved`, `denied`

## 🧪 Testando com Mocks

Para testar erros simulados, altere em `onboardingService.ts`:

```typescript
const SIMULATE_ERRORS = true; // Ativa erros aleatórios para QA
```

## 🔐 Segurança

### Implementadas:
- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho (8MB)
- ✅ Mascaramento de dados sensíveis (CPF, email)
- ✅ Validação de resolução mínima para selfie (600x600)

### Recomendações adicionais:
- Adicionar autenticação JWT nas chamadas API
- Implementar rate limiting
- Sanitizar inputs no backend
- Criptografar arquivos em trânsito (HTTPS)
- Implementar RLS (Row Level Security) no banco

## 📱 Responsividade

Todas as telas foram testadas para:
- ✅ Mobile: 390×844
- ✅ Desktop SM: 1280×832
- ✅ Desktop MD: 1512×982
- ✅ Desktop LG: 1728×1117

## ♿ Acessibilidade

- Labels corretos em todos os inputs
- `aria-invalid` em campos com erro
- Contraste mínimo WCAG 4.5:1
- Navegação por teclado funcional

## 📦 Dependências Necessárias

Se integrar com API real, instale:

```bash
npm install axios
```

## 🚀 Como Usar

1. **Desenvolvimento local:**
   ```bash
   npm install
   npm run dev
   ```

2. **Testar fluxo completo:**
   - Acesse `http://localhost:8080`
   - Clique em "Iniciar Cadastro"
   - Complete os 4 passos

3. **Preparar para produção:**
   - Substitua mocks em `onboardingService.ts`
   - Configure variáveis de ambiente
   - Teste integração com backend real

## 📞 Suporte

Para dúvidas sobre integração, consulte os comentários detalhados em:
- `src/services/onboardingService.ts` - Contratos de API
- `src/contexts/OnboardingContext.tsx` - Estrutura de dados

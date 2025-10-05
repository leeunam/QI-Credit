/**
 * Serviço de Onboarding e KYC
 *
 * Integração real com backend /api/onboarding
 * Substitui os mocks anteriores por chamadas HTTP reais
 *
 * Rotas backend:
 * - POST /api/onboarding/verify - Verificação de identidade
 * - POST /api/onboarding/complete - Finalizar onboarding
 * - GET /api/onboarding/status/:userId - Status do onboarding
 *
 * NOTA: Registro de usuário usa /api/auth/register (não /api/onboarding/register)
 */

import { apiClient } from './apiClients';
import type {
  ApiResponse,
  KYCVerificationData,
  KYCVerificationResult,
  OnboardingStatusData,
} from '@/types';

// ============================================================================
// INTERFACES ESPECÍFICAS DO ONBOARDING
// ============================================================================

/**
 * Dados para verificação de identidade
 */
export interface VerifyIdentityData {
  userId: string;
  documentType: 'cpf' | 'cnpj' | 'rg' | 'cnh';
  documentNumber: string;
  documentImage: string | File; // base64 ou File
  faceImage?: string | File;
  phoneNumber?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string; // YYYY-MM-DD
}

/**
 * Resposta da verificação de identidade
 */
export interface VerifyIdentityResponse {
  message: string;
  userId: string;
  verificationStatus: string;
  kycResult: KYCVerificationResult;
  overallStatus: string;
}

/**
 * Dados para completar onboarding
 */
export interface CompleteOnboardingData {
  userId: string;
}

/**
 * Resposta do status de onboarding
 */
export interface OnboardingStatusResponse {
  userId: string;
  status: {
    isComplete: boolean;
    steps: {
      registration: boolean;
      verification: boolean;
      completed: boolean;
    };
    currentStep: string;
    lastUpdated: string;
  };
}

// ============================================================================
// SERVIÇO DE ONBOARDING
// ============================================================================

export const onboardingService = {
  /**
   * Verificar identidade do usuário (KYC)
   * POST /api/onboarding/verify
   *
   * Este endpoint realiza:
   * - Verificação de documento
   * - Verificação facial (se faceImage fornecida)
   * - Score antifraude
   * - Validação KYC completa
   */
  async verifyIdentity(data: VerifyIdentityData): Promise<ApiResponse<VerifyIdentityResponse>> {
    try {
      // Preparar dados para envio
      const payload = {
        userId: data.userId,
        documentType: data.documentType,
        documentNumber: data.documentNumber,
        documentImage: data.documentImage,
        faceImage: data.faceImage,
        phoneNumber: data.phoneNumber,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate,
      };

      const response = await apiClient.post('/onboarding/verify', payload);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Verify identity error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao verificar identidade',
        code: error.response?.data?.code || 'VERIFY_IDENTITY_ERROR',
      };
    }
  },

  /**
   * Completar processo de onboarding
   * POST /api/onboarding/complete
   */
  async complete(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/onboarding/complete', { userId });

      return {
        success: true,
        data: response.data,
        message: 'Onboarding completado com sucesso',
      };
    } catch (error: any) {
      console.error('Complete onboarding error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao completar onboarding',
        code: error.response?.data?.code || 'COMPLETE_ONBOARDING_ERROR',
      };
    }
  },

  /**
   * Obter status do onboarding
   * GET /api/onboarding/status/:userId
   */
  async getStatus(userId: string): Promise<ApiResponse<OnboardingStatusResponse>> {
    try {
      const response = await apiClient.get(`/onboarding/status/${userId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('Get onboarding status error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar status do onboarding',
        code: error.response?.data?.code || 'GET_STATUS_ERROR',
      };
    }
  },

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  /**
   * Validar arquivo de documento antes do upload
   */
  validateDocumentFile(file: File): { valid: boolean; error?: string } {
    // Validar tamanho (max 8MB)
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Máximo 8MB.',
      };
    }

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo inválido. Use JPG, PNG ou PDF.',
      };
    }

    return { valid: true };
  },

  /**
   * Converter arquivo para base64
   * Útil para enviar imagens em JSON
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };

      reader.readAsDataURL(file);
    });
  },

  /**
   * Preparar dados de verificação com conversão de arquivos
   * Se os arquivos forem File objects, converte para base64
   */
  async prepareVerificationData(data: VerifyIdentityData): Promise<VerifyIdentityData> {
    const prepared = { ...data };

    // Converter documentImage se for File
    if (data.documentImage instanceof File) {
      prepared.documentImage = await this.fileToBase64(data.documentImage);
    }

    // Converter faceImage se for File
    if (data.faceImage instanceof File) {
      prepared.faceImage = await this.fileToBase64(data.faceImage);
    }

    return prepared;
  },
};

export default onboardingService;

// ============================================================================
// BACKWARDS COMPATIBILITY (Manter compatibilidade com código existente)
// ============================================================================

/**
 * @deprecated Use onboardingService.verifyIdentity() instead
 */
export async function submitBasicData(payload: {
  fullName: string;
  document: string;
  documentType?: 'F' | 'J';
  email: string;
  password: string;
}): Promise<any> {
  console.warn('submitBasicData is deprecated. Use authService.register() instead.');
  // Redirecionar para authService
  return {
    status: 'error',
    message: 'Use authService.register() para registrar usuários',
  };
}

/**
 * @deprecated Use storageService.uploadFile() instead
 */
export async function uploadDocument(
  onboardingId: string,
  file: File,
  docType: 'idFront' | 'idBack' | 'proof'
): Promise<any> {
  console.warn('uploadDocument is deprecated. Use storageService.uploadFile() instead.');

  // Validar arquivo
  const validation = onboardingService.validateDocumentFile(file);
  if (!validation.valid) {
    return {
      status: 'error',
      message: validation.error,
    };
  }

  return {
    status: 'ok',
    message: 'Use storageService.uploadFile() para upload de documentos',
  };
}

/**
 * @deprecated Use onboardingService.complete() instead
 */
export async function finalizeOnboarding(onboardingId: string): Promise<any> {
  console.warn('finalizeOnboarding is deprecated. Use onboardingService.complete() instead.');
  return onboardingService.complete(onboardingId);
}

/**
 * @deprecated Use onboardingService.getStatus() instead
 */
export async function checkKycStatus(onboardingId: string): Promise<any> {
  console.warn('checkKycStatus is deprecated. Use onboardingService.getStatus() instead.');
  return onboardingService.getStatus(onboardingId);
}

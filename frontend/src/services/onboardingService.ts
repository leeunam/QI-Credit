/**
 * Mock Onboarding Service
 * 
 * This service simulates backend API calls for the KYC onboarding flow.
 * When integrating with real APIs, replace the mock implementations with actual HTTP requests.
 * 
 * Expected real API endpoints:
 * - POST /api/onboarding/basic-data - Submit basic user information
 * - POST /api/onboarding/{id}/documents - Upload document files
 * - POST /api/onboarding/{id}/selfie - Submit selfie/biometric image
 * - POST /api/onboarding/{id}/finalize - Complete onboarding submission
 * - GET /api/onboarding/{id}/kyc-status - Check KYC verification status
 */

// Simulate network latency
const simulateDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Toggle this to simulate API errors for testing
const SIMULATE_ERRORS = false;

export interface ApiResponse<T = any> {
  status: 'ok' | 'error';
  data?: T;
  message?: string;
}

/**
 * Submit basic user data (Step 1)
 * 
 * Real API Contract:
 * POST /api/onboarding/basic-data
 * Body: { fullName: string, document: string, email: string, password: string }
 * Response: { status: 'ok', data: { onboardingId: string, userId: string } }
 */
export async function submitBasicData(payload: {
  fullName: string;
  document: string;
  email: string;
  password: string;
}): Promise<ApiResponse<{ onboardingId: string; userId: string }>> {
  await simulateDelay(800);

  if (SIMULATE_ERRORS && Math.random() > 0.7) {
    return {
      status: 'error',
      message: 'Erro ao processar dados. Tente novamente.',
    };
  }

  // Mock validation
  if (!payload.email.includes('@')) {
    return {
      status: 'error',
      message: 'Email inválido',
    };
  }

  return {
    status: 'ok',
    data: {
      onboardingId: `onb_${Date.now()}`,
      userId: `usr_${Date.now()}`,
    },
  };
}

/**
 * Upload document file (Step 2)
 * 
 * Real API Contract:
 * POST /api/onboarding/{onboardingId}/documents
 * Content-Type: multipart/form-data
 * Body: FormData with 'file' and 'docType' fields
 * Response: { status: 'uploaded', data: { fileId: string, urlPreview: string } }
 */
export async function uploadDocument(
  onboardingId: string,
  file: File,
  docType: 'idFront' | 'idBack' | 'proof'
): Promise<ApiResponse<{ fileId: string; urlPreview: string }>> {
  await simulateDelay(1200);

  if (SIMULATE_ERRORS && Math.random() > 0.8) {
    return {
      status: 'error',
      message: 'Falha no upload do documento. Verifique o arquivo e tente novamente.',
    };
  }

  // Validate file size (max 8MB)
  if (file.size > 8 * 1024 * 1024) {
    return {
      status: 'error',
      message: 'Arquivo muito grande. Máximo 8MB.',
    };
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    return {
      status: 'error',
      message: 'Tipo de arquivo inválido. Use JPG, PNG ou PDF.',
    };
  }

  // Create mock preview URL
  const urlPreview = URL.createObjectURL(file);

  return {
    status: 'ok',
    data: {
      fileId: `file_${docType}_${Date.now()}`,
      urlPreview,
    },
  };
}

/**
 * Submit selfie/biometric image (Step 3)
 * 
 * Real API Contract:
 * POST /api/onboarding/{onboardingId}/selfie
 * Content-Type: multipart/form-data or application/json with base64
 * Body: image file or { imageData: base64String }
 * Response: { status: 'ok', data: { livenessScore: number, faceDetected: boolean } }
 */
export async function submitSelfie(
  onboardingId: string,
  imageBlob: Blob | File
): Promise<ApiResponse<{ livenessScore: number; faceDetected: boolean }>> {
  await simulateDelay(1500);

  if (SIMULATE_ERRORS && Math.random() > 0.8) {
    return {
      status: 'error',
      message: 'Não foi possível processar a selfie. Tente novamente.',
    };
  }

  // Mock liveness detection
  const livenessScore = 0.92 + Math.random() * 0.07; // 0.92-0.99

  return {
    status: 'ok',
    data: {
      livenessScore,
      faceDetected: true,
    },
  };
}

/**
 * Finalize onboarding and submit for KYC verification (Step 4)
 * 
 * Real API Contract:
 * POST /api/onboarding/{onboardingId}/finalize
 * Body: { confirmData: boolean }
 * Response: { status: 'submitted', data: { kycStatus: 'pending' | 'in_review', submittedAt: string } }
 */
export async function finalizeOnboarding(
  onboardingId: string
): Promise<ApiResponse<{ kycStatus: string; submittedAt: string }>> {
  await simulateDelay(1000);

  if (SIMULATE_ERRORS && Math.random() > 0.9) {
    return {
      status: 'error',
      message: 'Erro ao finalizar cadastro. Entre em contato com o suporte.',
    };
  }

  return {
    status: 'ok',
    data: {
      kycStatus: 'pending',
      submittedAt: new Date().toISOString(),
    },
  };
}

/**
 * Check KYC verification status
 * 
 * Real API Contract:
 * GET /api/onboarding/{onboardingId}/kyc-status
 * Response: { 
 *   status: 'ok', 
 *   data: { 
 *     kycStatus: 'pending' | 'in_review' | 'approved' | 'denied',
 *     reason?: string,
 *     updatedAt: string
 *   } 
 * }
 */
export async function checkKycStatus(
  onboardingId: string
): Promise<ApiResponse<{ kycStatus: string; reason?: string; updatedAt: string }>> {
  await simulateDelay(500);

  return {
    status: 'ok',
    data: {
      kycStatus: 'pending',
      updatedAt: new Date().toISOString(),
    },
  };
}

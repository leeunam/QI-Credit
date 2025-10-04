import { createContext, useContext, useState, ReactNode } from 'react';

export interface OnboardingData {
  // Step 1: Basic data
  fullName: string;
  document: string; // CPF/CNPJ (apenas números)
  documentType?: 'F' | 'J'; // F = Pessoa Física, J = Pessoa Jurídica
  email: string;
  password: string;

  // Step 2: Documents
  documents: {
    idFront?: File;
    idBack?: File;
    proof?: File;
  };
  documentPreviews: {
    idFront?: string;
    idBack?: string;
    proof?: string;
  };

  // Step 3: Selfie
  selfie?: Blob | File;
  selfiePreview?: string;

  // Backend IDs
  onboardingId?: string;
  fileIds?: Record<string, string>;
}

interface OnboardingContextType {
  currentStep: number;
  data: OnboardingData;
  setCurrentStep: (step: number) => void;
  updateData: (updates: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

const initialData: OnboardingData = {
  fullName: '',
  document: '',
  documentType: undefined,
  email: '',
  password: '',
  documents: {},
  documentPreviews: {},
};

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const reset = () => {
    setCurrentStep(1);
    setData(initialData);
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        data,
        setCurrentStep,
        updateData,
        nextStep,
        prevStep,
        reset,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

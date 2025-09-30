import React from 'react';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Step1BasicData } from '@/components/onboarding/Step1BasicData';
import { Step2Documents } from '@/components/onboarding/Step2Documents';
import { Step3Selfie } from '@/components/onboarding/Step3Selfie';
import { Step4Review } from '@/components/onboarding/Step4Review';

const OnboardingContent: React.FC = () => {
  const { currentStep } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicData />;
      case 2:
        return <Step2Documents />;
      case 3:
        return <Step3Selfie />;
      case 4:
        return <Step4Review />;
      default:
        return <Step1BasicData />;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 desktop-sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-h1 mb-2">Cadastro KYC</h1>
          <p className="text-body-2 text-muted-foreground">
            Complete seu cadastro em 4 passos simples
          </p>
        </div>

        <ProgressBar currentStep={currentStep} totalSteps={4} />

        <div className="mt-12">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

const Onboarding: React.FC = () => {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
};

export default Onboarding;

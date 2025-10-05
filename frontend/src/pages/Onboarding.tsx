import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Step1BasicData } from '@/components/onboarding/Step1BasicData';
import { Step2Documents } from '@/components/onboarding/Step2Documents';
import { Step3Selfie } from '@/components/onboarding/Step3Selfie';
import { Step4Review } from '@/components/onboarding/Step4Review';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header2 } from '@/components/layout/Header2';

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
    <div className="min-h-screen bg-background">

      <Header2 />
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <div className="text-center mb-12">
            <h1 className="text-h1 mb-2">Cadastro KYC</h1>
            <p className="text-body-2 text-muted-foreground">
              Complete seu cadastro em 4 passos simples
            </p>
          </div>
        </div>
      </header>

      <ProgressBar currentStep={currentStep} totalSteps={4} />

      <div className="mt-12">
        {renderStep()}
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

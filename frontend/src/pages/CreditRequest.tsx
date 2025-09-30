import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CreditSteps } from '@/components/credit/CreditSteps';
import { PersonalInfoForm } from '@/components/credit/PersonalInfoForm';
import { FinancialInfoForm } from '@/components/credit/FinancialInfoForm';
import { LoanDetailsForm } from '@/components/credit/LoanDetailsForm';
import { DocumentUpload } from '@/components/credit/DocumentUpload';
import { ReviewSubmit } from '@/components/credit/ReviewSubmit';
import { useCredit } from '@/contexts/CreditContext';
import { useToast } from '@/hooks/use-toast';

const steps = [
  { id: 1, title: 'Pessoais', description: 'Informações básicas' },
  { id: 2, title: 'Financeiras', description: 'Renda e gastos' },
  { id: 3, title: 'Empréstimo', description: 'Valor e prazo' },
  { id: 4, title: 'Documentos', description: 'Envio de arquivos' },
  { id: 5, title: 'Revisão', description: 'Confirmar dados' }
];

const CreditRequest: React.FC = () => {
  const navigate = useNavigate();
  const { submitApplication, currentApplication } = useCredit();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);


  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return currentApplication?.personalInfo?.name && 
               currentApplication?.personalInfo?.cpf && 
               currentApplication?.personalInfo?.email;
      case 2:
        return currentApplication?.financialInfo?.monthlyIncome && 
               currentApplication?.financialInfo?.employmentType;
      case 3:
        return currentApplication?.amount && 
               currentApplication?.term && 
               currentApplication?.purpose;
      case 4:
        return currentApplication?.documents?.id && 
               currentApplication?.documents?.cpf && 
               currentApplication?.documents?.incomeProof;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentApplication) return;

    try {
      const success = await submitApplication(currentApplication as any);
      
      if (success) {
        toast({
          title: "Solicitação enviada com sucesso!",
          description: "Você receberá uma resposta em até 24 horas.",
          variant: "default"
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Erro ao enviar solicitação",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoForm />;
      case 2:
        return <FinancialInfoForm />;
      case 3:
        return <LoanDetailsForm />;
      case 4:
        return <DocumentUpload />;
      case 5:
        return <ReviewSubmit onSubmit={handleSubmit} />;
      default:
        return <PersonalInfoForm />;
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          <h1 className="text-h1 font-bold text-foreground">Solicitar Crédito</h1>
          <p className="text-body-2 text-muted-foreground mt-2">
            Preencha os dados abaixo para solicitar seu empréstimo
          </p>
        </div>

        {/* Steps */}
        <Card className="mb-8">
          <CardContent>
            <CreditSteps currentStep={currentStep} steps={steps} />
          </CardContent>
        </Card>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          {renderStepContent()}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext()}
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreditRequest;
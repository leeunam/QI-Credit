import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { finalizeOnboarding } from '@/services/onboardingService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Step4Review: React.FC = () => {
  const { data, prevStep, reset } = useOnboarding();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const maskDocument = (doc: string) => {
    const cleaned = doc.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `***.***.${cleaned.slice(6, 9)}-**`;
    }
    return `**.***.${cleaned.slice(8, 11)}/****-**`;
  };

  const maskEmail = (email: string) => {
    const [local, domain] = email.split('@');
    return `${local.slice(0, 2)}***@${domain}`;
  };

  const handleFinalize = async () => {
    if (!data.onboardingId) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'ID de cadastro não encontrado',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await finalizeOnboarding(data.onboardingId);

      if (response.status === 'ok') {
        setSubmitted(true);
        toast({
          title: 'Cadastro concluído!',
          description: 'Seu cadastro está em análise.',
        });

        // Wait 2 seconds before resetting/redirecting
        setTimeout(() => {
          reset();
          // In a real app, you might redirect to a success page or dashboard
          // navigate('/dashboard');
        }, 2000);
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao finalizar',
          description: response.message || 'Tente novamente mais tarde',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao finalizar o cadastro',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-lg mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-success flex items-center justify-center">
            <Check size={32} className="text-white" />
          </div>
        </div>
        <h2 className="text-h2 mb-4">Cadastro Enviado!</h2>
        <p className="text-body-2 text-muted-foreground mb-2">
          Seu cadastro foi enviado com sucesso e está sendo analisado.
        </p>
        <p className="text-body-3 text-muted-foreground">
          Status: <span className="font-medium text-warning">Pendente</span>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-h2 mb-2">Revisão dos Dados</h2>
        <p className="text-body-3 text-muted-foreground">
          Confira suas informações antes de finalizar
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {/* Basic Data */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-h4 mb-4">Dados Pessoais</h3>
          <div className="space-y-3">
            <div>
              <p className="text-body-4 text-muted-foreground">Nome Completo</p>
              <p className="text-body-3 font-medium">{data.fullName}</p>
            </div>
            <div>
              <p className="text-body-4 text-muted-foreground">CPF/CNPJ</p>
              <p className="text-body-3 font-medium">{maskDocument(data.document)}</p>
            </div>
            <div>
              <p className="text-body-4 text-muted-foreground">Email</p>
              <p className="text-body-3 font-medium">{maskEmail(data.email)}</p>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-h4 mb-4">Documentos</h3>
          <div className="grid grid-cols-3 gap-4">
            {data.documentPreviews.idFront && (
              <div>
                <p className="text-body-4 text-muted-foreground mb-2">RG/CPF (Frente)</p>
                <img
                  src={data.documentPreviews.idFront}
                  alt="RG Frente"
                  className="w-full aspect-square object-cover rounded border border-border"
                />
              </div>
            )}
            {data.documentPreviews.idBack && (
              <div>
                <p className="text-body-4 text-muted-foreground mb-2">RG/CPF (Verso)</p>
                <img
                  src={data.documentPreviews.idBack}
                  alt="RG Verso"
                  className="w-full aspect-square object-cover rounded border border-border"
                />
              </div>
            )}
            {data.documentPreviews.proof && (
              <div>
                <p className="text-body-4 text-muted-foreground mb-2">Comprovante</p>
                <img
                  src={data.documentPreviews.proof}
                  alt="Comprovante"
                  className="w-full aspect-square object-cover rounded border border-border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Selfie */}
        {data.selfiePreview && (
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-h4 mb-4">Selfie de Verificação</h3>
            <div className="w-32 h-32">
              <img
                src={data.selfiePreview}
                alt="Selfie"
                className="w-full h-full object-cover rounded-full border-2 border-border"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={prevStep}
          className="flex-1"
          disabled={loading}
        >
          Voltar
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleFinalize}
          className="flex-1"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finalizando...
            </>
          ) : (
            'Concluir Cadastro'
          )}
        </Button>
      </div>
    </div>
  );
};

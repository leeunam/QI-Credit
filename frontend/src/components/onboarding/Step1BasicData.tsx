import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitBasicData } from '@/services/onboardingService';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { validationUtils } from '@/lib/validationUtils';

export const Step1BasicData: React.FC = () => {
  const { data, updateData, nextStep } = useOnboarding();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validação do nome completo
    const nameValidation = validationUtils.validateFullName(data.fullName);
    if (!nameValidation.isValid) {
      newErrors.fullName = nameValidation.message!;
    }

    // Validação do CPF/CNPJ
    const documentValidation = validationUtils.validateDocument(data.document);
    if (!documentValidation.isValid) {
      newErrors.document = documentValidation.message!;
    }

    // Validação do email
    const emailValidation = validationUtils.validateEmail(data.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message!;
    }

    // Validação da senha
    const passwordValidation = validationUtils.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await submitBasicData({
        fullName: data.fullName,
        document: data.document,
        documentType: data.documentType,
        email: data.email,
        password: data.password,
      });

      if (response.status === 'ok' && response.data) {
        updateData({ onboardingId: response.data.onboardingId });
        toast({
          title: 'Dados salvos!',
          description: 'Prossiga para o próximo passo.',
        });
        nextStep();
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: response.message || 'Erro ao processar dados',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro inesperado',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-h2 mb-2">Dados Básicos</h2>
        <p className="text-body-3 text-muted-foreground">
          Preencha suas informações para começar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="fullName">Nome Completo *</Label>
          <Input
            id="fullName"
            type="text"
            value={data.fullName}
            onChange={(e) => {
              const filteredValue = validationUtils.onlyLetters(e.target.value);
              if (filteredValue.length <= 255) {
                updateData({ fullName: filteredValue });
              }
            }}
            placeholder="Digite seu nome completo"
            className="mt-2"
            maxLength={255}
            aria-invalid={!!errors.fullName}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.fullName && (
              <p className="text-body-4 text-destructive">{errors.fullName}</p>
            )}
            <p className="text-body-4 text-muted-foreground text-right">
              {data.fullName.length}/255
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="document">CPF/CNPJ *</Label>
          <Input
            id="document"
            type="text"
            value={validationUtils.formatDocument(data.document)}
            onChange={(e) => {
              const numbersOnly = validationUtils.onlyNumbers(e.target.value);
              if (numbersOnly.length <= 14) {
                // Determina automaticamente o tipo de pessoa
                const documentType =
                  numbersOnly.length === 11
                    ? 'F'
                    : numbersOnly.length === 14
                    ? 'J'
                    : undefined;
                updateData({
                  document: numbersOnly,
                  documentType: documentType,
                });
              }
            }}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            className="mt-2"
            maxLength={18} // Para comportar a formatação
            aria-invalid={!!errors.document}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.document && (
              <p className="text-body-4 text-destructive">{errors.document}</p>
            )}
            <p className="text-body-4 text-muted-foreground text-right">
              {data.document.length <= 11 ? 'CPF' : 'CNPJ'} -{' '}
              {data.document.length}/14
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => {
              if (e.target.value.length <= 255) {
                updateData({ email: e.target.value });
              }
            }}
            placeholder="seu@email.com"
            className="mt-2"
            maxLength={255}
            aria-invalid={!!errors.email}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.email && (
              <p className="text-body-4 text-destructive">{errors.email}</p>
            )}
            <p className="text-body-4 text-muted-foreground text-right">
              {data.email.length}/255
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="password">Senha *</Label>
          <div className="relative mt-2">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              onChange={(e) => {
                if (e.target.value.length <= 20) {
                  updateData({ password: e.target.value });
                }
              }}
              placeholder="8 a 20 caracteres"
              className="pr-10"
              maxLength={20}
              minLength={8}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="flex justify-between items-center mt-1">
            {errors.password && (
              <p className="text-body-4 text-destructive">{errors.password}</p>
            )}
            <p className="text-body-4 text-muted-foreground text-right">
              {data.password.length}/20
            </p>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            'Próximo'
          )}
        </Button>
      </form>
    </div>
  );
};

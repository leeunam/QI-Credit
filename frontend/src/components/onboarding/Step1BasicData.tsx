import React, { useState } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitBasicData } from '@/services/onboardingService';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export const Step1BasicData: React.FC = () => {
  const { data, updateData, nextStep } = useOnboarding();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!data.fullName || data.fullName.length < 3) {
      newErrors.fullName = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!data.document) {
      newErrors.document = 'CPF/CNPJ é obrigatório';
    } else if (data.document.replace(/\D/g, '').length < 11) {
      newErrors.document = 'CPF/CNPJ inválido';
    }

    if (!data.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!data.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (data.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
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
            onChange={(e) => updateData({ fullName: e.target.value })}
            placeholder="Digite seu nome completo"
            className="mt-2"
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && (
            <p className="text-body-4 text-error mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="document">CPF/CNPJ *</Label>
          <Input
            id="document"
            type="text"
            value={data.document}
            onChange={(e) => updateData({ document: e.target.value })}
            placeholder="000.000.000-00"
            className="mt-2"
            aria-invalid={!!errors.document}
          />
          {errors.document && (
            <p className="text-body-4 text-error mt-1">{errors.document}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder="seu@email.com"
            className="mt-2"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-body-4 text-error mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Senha *</Label>
          <div className="relative mt-2">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              onChange={(e) => updateData({ password: e.target.value })}
              placeholder="Mínimo 8 caracteres"
              className="pr-10"
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
          {errors.password && (
            <p className="text-body-4 text-error mt-1">{errors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={loading}
        >
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

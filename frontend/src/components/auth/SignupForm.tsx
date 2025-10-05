import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Briefcase, UserCircle } from 'lucide-react';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'investor' | 'client'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro de validação",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    const success = await signup(name, email, password, userType);
    
    if (success) {
      toast({
        title: "Conta criada com sucesso!",
        description: "Sua conta foi criada e você já está logado.",
      });
    } else {
      toast({
        title: "Erro no cadastro",
        description: "Este email já está em uso. Tente outro email.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-h2 text-foreground mb-2">Criar conta</h2>
        <p className="text-body-3 text-muted-foreground">
          Preencha os dados para criar sua conta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-body-4 font-medium">
            Nome completo
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome completo"
            className="h-12 text-body-3"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-body-4 font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="h-12 text-body-3"
            disabled={isLoading}
          />
        </div>

        {/* User Type Selection */}
        <div className="space-y-3">
          <Label className="text-body-4 font-medium">
            Tipo de conta
          </Label>
          <RadioGroup
            value={userType}
            onValueChange={(value) => setUserType(value as 'investor' | 'client')}
            disabled={isLoading}
            className="grid grid-cols-2 gap-4"
          >
            <div className="relative">
              <RadioGroupItem
                value="client"
                id="client"
                className="peer sr-only"
              />
              <Label
                htmlFor="client"
                className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-muted bg-background p-4 hover:bg-accent hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all duration-200"
              >
                <UserCircle className="h-8 w-8 text-muted-foreground peer-data-[state=checked]:text-primary" />
                <div className="text-center">
                  <div className="font-semibold text-body-3">Cliente</div>
                  <div className="text-body-5 text-muted-foreground mt-1">
                    Solicitar crédito
                  </div>
                </div>
              </Label>
            </div>

            <div className="relative">
              <RadioGroupItem
                value="investor"
                id="investor"
                className="peer sr-only"
              />
              <Label
                htmlFor="investor"
                className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-muted bg-background p-4 hover:bg-accent hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all duration-200"
              >
                <Briefcase className="h-8 w-8 text-muted-foreground peer-data-[state=checked]:text-primary" />
                <div className="text-center">
                  <div className="font-semibold text-body-3">Investidor</div>
                  <div className="text-body-5 text-muted-foreground mt-1">
                    Investir em contratos
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-body-4 font-medium">
            Senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="h-12 text-body-3 pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-body-4 font-medium">
            Confirmar senha
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a senha novamente"
              className="h-12 text-body-3 pr-10"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-body-3 font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar conta'
          )}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-body-4 text-primary hover:text-primary/80 transition-colors"
            disabled={isLoading}
          >
            Já tem uma conta? <span className="font-semibold">Faça login</span>
          </button>
        </div>
      </form>
    </div>
  );
};
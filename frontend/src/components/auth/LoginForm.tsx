import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CustomButton } from '../../components/ui/button-variants';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
    } else {
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos. Tente usar: user@example.com / 123456",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-h2 text-foreground mb-2">Bem-vindo de volta</h2>
        <p className="text-body-3 text-muted-foreground">
          Entre na sua conta para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Digite sua senha"
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

        <CustomButton
          type="submit"
          variant="gradient"
          className="w-full h-12 text-body-3 font-semibold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </CustomButton>

        <div className="text-center">
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-body-4 text-secondary hover:text-secondary/80 transition-colors"
            disabled={isLoading}
          >
            Não tem uma conta? <span className="font-semibold">Cadastre-se</span>
          </button>
        </div>
      </form>
    </div>
  );
};
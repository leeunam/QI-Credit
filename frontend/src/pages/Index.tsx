import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Camera,
  CheckCircle,
  TrendingUp,
  Shield,
  DollarSign,
  Wallet,
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  // Features do sistema KYC
  const kycFeatures = [
    {
      icon: FileText,
      title: 'Dados Básicos',
      description: 'Preencha suas informações pessoais',
    },
    {
      icon: ShieldCheck,
      title: 'Documentos',
      description: 'Upload de RG/CPF e comprovantes',
    },
    {
      icon: Camera,
      title: 'Verificação',
      description: 'Selfie para confirmar identidade',
    },
    {
      icon: CheckCircle,
      title: 'Aprovação',
      description: 'Análise e liberação da conta',
    },
  ];

  // Features do sistema de investimentos
  const investmentFeatures = [
    {
      icon: DollarSign,
      title: 'Retornos Atrativos',
      description: 'Taxas competitivas de 1.5% a 3.2% ao mês',
    },
    {
      icon: Shield,
      title: 'Análise de Risco',
      description: 'Avaliação completa do perfil dos tomadores',
    },
    {
      icon: TrendingUp,
      title: 'Diversificação',
      description: 'Múltiplas ofertas para balancear seu portfólio',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 desktop-sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-display text-foreground mb-6">
            QI Credit - Plataforma Completa
          </h1>

          <p className="text-body-1 text-muted-foreground mb-8 max-w-3xl mx-auto">
            Cadastro KYC seguro e investimentos P2P inteligentes. Complete seu
            cadastro e explore oportunidades de investimento.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Iniciar Cadastro KYC
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/marketplace')}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Explorar Marketplace
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Ver Dashboards
            </Button>
          </div>
        </div>

        {/* KYC Features Section */}
        <section className="mb-16">
          <h2 className="text-heading-2 text-center mb-8">
            Processo KYC Simplificado
          </h2>
          <div className="grid mobile:grid-cols-1 desktop-sm:grid-cols-2 desktop-md:grid-cols-4 gap-6">
            {kycFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-lg border border-border p-6 hover:border-primary transition-smooth"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-heading-4 mb-2">{feature.title}</h3>
                <p className="text-body-3 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Investment Features Section */}
        <section className="mb-16">
          <h2 className="text-heading-2 text-center mb-8">Investimentos P2P</h2>
          <div className="grid mobile:grid-cols-1 desktop-sm:grid-cols-3 gap-8">
            {investmentFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-heading-3 text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-body-3 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Info Section */}
        <div className="bg-primary/5 rounded-lg border border-primary/20 p-8 max-w-2xl mx-auto">
          <h2 className="text-heading-3 mb-4 text-center">Plataforma Segura</h2>
          <ul className="space-y-3 text-body-3">
            <li className="flex items-start gap-2">
              <CheckCircle
                size={20}
                className="text-success mt-0.5 flex-shrink-0"
              />
              <span>Cadastro 100% online e seguro</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle
                size={20}
                className="text-success mt-0.5 flex-shrink-0"
              />
              <span>Verificação de identidade em tempo real</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle
                size={20}
                className="text-success mt-0.5 flex-shrink-0"
              />
              <span>Investimentos com análise de risco completa</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle
                size={20}
                className="text-success mt-0.5 flex-shrink-0"
              />
              <span>Dados protegidos com criptografia</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Index;

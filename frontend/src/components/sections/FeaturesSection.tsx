import { CheckCircle, BarChart3, Users, Smartphone, Cloud, Lock } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Analytics Avançado",
      description: "Relatórios detalhados e insights em tempo real para otimizar sua performance."
    },
    {
      icon: Users,
      title: "Gestão de Equipe",
      description: "Colaboração eficiente com ferramentas de gestão de usuários e permissões."
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Interface responsiva otimizada para todos os dispositivos móveis."
    },
    {
      icon: Cloud,
      title: "Cloud Storage",
      description: "Armazenamento seguro na nuvem com backup automático e sincronização."
    },
    {
      icon: Lock,
      title: "Segurança Total",
      description: "Criptografia de dados e autenticação multi-fator para máxima proteção."
    },
    {
      icon: CheckCircle,
      title: "99.9% Uptime",
      description: "Disponibilidade garantida com infraestrutura robusta e confiável."
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-h2 md:text-5xl font-bold text-foreground mb-6">
            Recursos que fazem a
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              diferença
            </span>
          </h2>
          <p className="text-body-1 text-muted-foreground leading-relaxed">
            Descubra todas as funcionalidades desenvolvidas para maximizar 
            sua produtividade e simplificar seu trabalho.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="group p-8 rounded-xl bg-card border shadow-card hover:shadow-elegant transition-all duration-300 hover:scale-105"
              >
                <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent size={28} className="text-white" />
                </div>
                
                <h3 className="text-h4 font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-body-3 text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-success/10 text-success border border-success/20">
            <CheckCircle size={20} className="mr-2" />
            <span className="text-body-3 font-medium">
              Teste gratuito por 30 dias • Sem compromisso
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
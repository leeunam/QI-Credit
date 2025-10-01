import React from 'react';
import { CustomButton } from '../../components/ui/button-variants';
import { ArrowRight, Play, Shield, Zap, Globe } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />
      
      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8">
            <Zap size={16} className="mr-2" />
            <span className="text-body-4 font-medium">
              Nova plataforma digital disponível
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-h1 md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Transforme sua
            <span className="block bg-gradient-hero bg-clip-text text-transparent">
              experiência digital
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-body-1 md:text-body-1 text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Uma solução completa e inovadora para otimizar seus processos digitais 
            com segurança, velocidade e simplicidade em uma única plataforma.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <CustomButton
              variant="gradient"
              onClick={onGetStarted}
              className="h-14 px-8 text-body-2 font-semibold shadow-elegant"
            >
              Começar agora
              <ArrowRight size={20} className="ml-2" />
            </CustomButton>
            
            <CustomButton
              variant="outline-secondary"
              className="h-14 px-8 text-body-2 font-semibold"
            >
              <Play size={18} className="mr-2" />
              Ver demonstração
            </CustomButton>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border shadow-card hover:shadow-elegant transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Shield size={24} className="text-white" />
              </div>
              <h3 className="text-h4 font-semibold text-foreground mb-2">
                100% Seguro
              </h3>
              <p className="text-body-4 text-muted-foreground">
                Proteção avançada de dados com criptografia de ponta
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border shadow-card hover:shadow-elegant transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Zap size={24} className="text-white" />
              </div>
              <h3 className="text-h4 font-semibold text-foreground mb-2">
                Ultra Rápido
              </h3>
              <p className="text-body-4 text-muted-foreground">
                Performance otimizada para máxima velocidade
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border shadow-card hover:shadow-elegant transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                <Globe size={24} className="text-white" />
              </div>
              <h3 className="text-h4 font-semibold text-foreground mb-2">
                Global
              </h3>
              <p className="text-body-4 text-muted-foreground">
                Acesso de qualquer lugar do mundo, 24/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
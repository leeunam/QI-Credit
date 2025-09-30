import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Header } from '../components/layout/Header';
import { HeroSection } from '../components/sections/HeroSection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { AuthModal } from '../components/modals/AuthModal';
import { Dashboard } from './Dashboard';

const Index = () => {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard />;
  }

  const handleLoginClick = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleSignupClick = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  const handleGetStarted = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b px-4 py-4 space-y-4">
          <a href="#features" className="block text-body-3 text-muted-foreground hover:text-foreground">
            Recursos
          </a>
          <a href="#about" className="block text-body-3 text-muted-foreground hover:text-foreground">
            Sobre
          </a>
          <a href="#contact" className="block text-body-3 text-muted-foreground hover:text-foreground">
            Contato
          </a>
          <div className="pt-4 border-t space-y-2">
            <button
              onClick={handleLoginClick}
              className="block w-full text-left text-body-3 text-secondary hover:text-secondary/80"
            >
              Entrar
            </button>
            <button
              onClick={handleSignupClick}
              className="block w-full text-left text-body-3 text-primary hover:text-primary/80 font-semibold"
            >
              Cadastrar
            </button>
          </div>
        </div>
      )}

      <main>
        <HeroSection onGetStarted={handleGetStarted} />
        <FeaturesSection />
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};

export default Index;

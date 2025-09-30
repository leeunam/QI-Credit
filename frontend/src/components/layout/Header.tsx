import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CustomButton } from '../../components/ui/button-variants';
import { Menu, User, LogOut } from 'lucide-react';

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onMobileMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onLoginClick, 
  onSignupClick, 
  onMobileMenuClick 
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-h4 font-bold text-primary">
              Plataforma
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-body-3 text-muted-foreground hover:text-foreground transition-colors">
              Recursos
            </a>
            <a href="#about" className="text-body-3 text-muted-foreground hover:text-foreground transition-colors">
              Sobre
            </a>
            <a href="#contact" className="text-body-3 text-muted-foreground hover:text-foreground transition-colors">
              Contato
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2">
                  <User size={18} className="text-muted-foreground" />
                  <span className="text-body-4 text-foreground font-medium">
                    {user.name}
                  </span>
                </div>
                <CustomButton
                  variant="outline"
                  onClick={logout}
                  className="hidden sm:flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Sair</span>
                </CustomButton>
                <CustomButton
                  variant="outline"
                  onClick={logout}
                  className="sm:hidden p-2"
                >
                  <LogOut size={16} />
                </CustomButton>
              </div>
            ) : (
              <>
                <CustomButton
                  variant="outline-secondary"
                  onClick={onLoginClick}
                  className="hidden sm:inline-flex"
                >
                  Entrar
                </CustomButton>
                <CustomButton
                  variant="gradient"
                  onClick={onSignupClick}
                  className="hidden sm:inline-flex"
                >
                  Cadastrar
                </CustomButton>
              </>
            )}

            {/* Mobile menu button */}
            <CustomButton
              variant="outline"
              onClick={onMobileMenuClick}
              className="md:hidden p-2"
            >
              <Menu size={20} />
            </CustomButton>
          </div>
        </div>
      </div>
    </header>
  );
};
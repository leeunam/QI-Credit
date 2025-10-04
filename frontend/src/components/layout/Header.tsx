import { Link, useNavigate } from "react-router-dom";
import { Home, FileText, DollarSign, User, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const navigate = useNavigate();

  const navigationLinks = [
    { label: "Assinar Contrato Digital", path: "/IndexContract", icon: FileText },
    { label: "Requisitar Crédito", path: "/credit-request", icon: DollarSign },
    { label: "Voltar ao Menu", path: "/", icon: Home },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-tertiary)] bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
              <span className="text-white font-display font-bold text-body-3">C</span>
            </div>
            <span className="font-display font-bold text-h4 text-[var(--text-dark)] hidden sm:block">
              Contratos
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationLinks.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                onClick={() => navigate(link.path)}
                className="text-body-4 font-medium text-[var(--text-dark)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-light)]"
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </Button>
            ))}
          </nav>

          {/* Desktop Profile & Settings */}
          <div className="hidden md:flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuItem onClick={() => navigate("/perfil")} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/configuracoes")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-[var(--color-error)]">
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-white">
              <div className="flex flex-col space-y-4 mt-8">
                <h2 className="font-display font-bold text-h4 mb-4">Menu</h2>
                
                {navigationLinks.map((link) => (
                  <Button
                    key={link.path}
                    variant="ghost"
                    onClick={() => navigate(link.path)}
                    className="justify-start text-body-3 font-medium text-[var(--text-dark)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-light)]"
                  >
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Button>
                ))}
                
                <div className="border-t border-[var(--color-tertiary)] pt-4 mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/perfil")}
                    className="justify-start w-full text-body-3 font-medium text-[var(--text-dark)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-light)]"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/configuracoes")}
                    className="justify-start w-full text-body-3 font-medium text-[var(--text-dark)] hover:text-[var(--color-primary)] hover:bg-[var(--bg-light)]"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
import { Bell, User, LogOut, Settings } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  balance: number;
  unreadNotifications: number;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

export const Header = ({
  balance,
  unreadNotifications,
  onNotificationsClick,
  onProfileClick,
  onLogout,
}: HeaderProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 md:h-18 bg-background border-b shadow-sm">
      <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-lg md:text-xl">
              P2P
            </span>
          </div>
          <h1 className="hidden md:block font-display text-h4 text-foreground">Dashboard</h1>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Wallet summary */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
            <span className="text-body-4 text-muted-foreground">Saldo</span>
            <span className="text-body-3 font-semibold text-foreground">
              {formatCurrency(balance)}
            </span>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onNotificationsClick}
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadNotifications}
              </Badge>
            )}
          </Button>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="Menu do usuário"
              >
                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-5 w-5 text-secondary-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onProfileClick}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

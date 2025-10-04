import * as React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, User, LogOut, Settings, Bell, X, Wallet } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const PAGES = [
    { label: 'Início', to: '/', icon: '🏠' },
    { label: 'Dashboard', to: '/dashboard', icon: '📊' },
    { label: 'Carteira', to: '/wallet', icon: '💰' },
    { label: 'KYC', to: '/onboarding', icon: '🛂' },
    { label: 'Solicitar Crédito', to: '/credit-request', icon: '📋' },
    { label: 'Marketplace', to: '/marketplace', icon: '🛒' },
    { label: 'Dashboard do Investidor', to: '/investor-dashboard', icon: '📊' },
    { label: 'Documento Digital', to: '/indexContract', icon: '📄' },
    { label: 'Smart Contract', to: '/smart-contract/:id', icon: '🤖' },
    { label: 'Pagamentos', to: '/pagamentos/payment-001', icon: '💳' }

];

interface Header2Props {
    balance?: number;
    unreadNotifications?: number;
    onNotificationsClick?: () => void;
    onProfileClick?: () => void;
    onLogout?: () => void;
}

export const Header2: React.FC<Header2Props> = ({
    balance = 0,
    unreadNotifications = 0,
    onNotificationsClick = () => { },
    onProfileClick = () => { },
    onLogout = () => { },
}) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = React.useState(false);

    const toggleMenu = () => setMenuOpen(prev => !prev);

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
        onLogout();
        navigate('/');
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Fecha o menu ao clicar fora
    React.useEffect(() => {
        if (menuOpen) {
            const handleClickOutside = (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                if (!target.closest('.menu-container')) {
                    setMenuOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [menuOpen]);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">

                        {/* Logo com gradiente */}
                        <div
                            className="flex items-center cursor-pointer group"
                            onClick={() => navigate('/')}
                        >
                            <div className="text-2xl font-bold text-primary">
                                QI Credit
                            </div>
                        </div>

                        {/* Saldo com ícone */}
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-background">
                            <Wallet className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">Saldo</span>
                            <span className="text-base font-bold text-primary">
                                {formatCurrency(balance)}
                            </span>
                        </div>

                        {/* Botões de ação */}
                        <div className="flex items-center gap-2">
                            {/* Notificações */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative hover:bg-muted/50 transition-all duration-300 hover:scale-110"
                                onClick={onNotificationsClick}
                                aria-label="Notificações"
                            >
                                <Bell className="h-5 w-5" />
                                {unreadNotifications > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                                    >
                                        {unreadNotifications}
                                    </Badge>
                                )}
                            </Button>

                            {/* Perfil Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full transition-all duration-300 hover:scale-110"
                                        aria-label="Menu do usuário"
                                    >
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-soft transition-all duration-300 hover:shadow-elevated">
                                            <User className="h-5 w-5 text-primary-foreground" />
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 bg-popover/95 backdrop-blur-lg border-border/50 shadow-elevated"
                                >
                                    <DropdownMenuItem
                                        onClick={onProfileClick}
                                        className="cursor-pointer transition-colors duration-200"
                                    >
                                        <User className="mr-2 h-4 w-4 text-primary" />
                                        <span>Perfil</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer transition-colors duration-200">
                                        <Settings className="mr-2 h-4 w-4 text-primary" />
                                        <span>Configurações</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="cursor-pointer transition-colors duration-200 text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sair</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Menu Hambúrguer */}
                            <div className="menu-container relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleMenu}
                                    className="transition-all duration-300 hover:bg-muted/50 hover:scale-110"
                                    aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                                >
                                    {menuOpen ? (
                                        <X className="h-6 w-6 text-primary" />
                                    ) : (
                                        <Menu className="h-6 w-6 text-primary" />
                                    )}
                                </Button>

                                {/* Menu Slide */}
                                <div
                                    className={`
                    fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 
                    bg-background/95 backdrop-blur-xl border-l border-border/50 
                    shadow-elevated transition-transform duration-300 ease-in-out
                    ${menuOpen ? 'translate-x-0' : 'translate-x-full'}
                  `}
                                >
                                    <nav className="flex flex-col p-4 gap-2 overflow-y-auto max-h-[calc(100vh-6rem)]">
                                        <h3 className="text-sm font-semibold text-muted-foreground px-3 py-2">
                                            Navegação
                                        </h3>
                                        {PAGES.map((page, index) => (
                                            <Link
                                                to={page.to}
                                                key={page.to}
                                                className="group flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 border border-transparent hover:border-primary/20 transition-all duration-300 hover:translate-x-1"
                                                onClick={() => setMenuOpen(false)}
                                                style={{
                                                    animationDelay: `${index * 50}ms`
                                                }}
                                            >
                                                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                                                    {page.icon}
                                                </span>
                                                <span className="font-medium group-hover:text-primary transition-colors duration-300">
                                                    {page.label}
                                                </span>
                                            </Link>
                                        ))}
                                    </nav>

                                    {/* Footer do menu com saldo mobile */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-muted/30 sm:hidden">
                                        <div className="flex items-center justify-between px-3 py-2 bg-background/50 rounded-lg">
                                            <span className="text-sm text-muted-foreground">Saldo Total</span>
                                            <span className="text-base font-bold text-primary">
                                                {formatCurrency(balance)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Overlay escuro quando menu está aberto */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setMenuOpen(false)}
                />
            )}
        </>
    );
};
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WalletCardProps {
  balance: number;
  onViewWallet: () => void;
}

export const WalletCard = ({ balance, onViewWallet }: WalletCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-body-2 font-normal opacity-90">
          Saldo Disponível
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-h2 font-bold">{formatCurrency(balance)}</span>
          <TrendingUp className="h-6 w-6 opacity-75" />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onViewWallet}
          className="w-full sm:w-auto"
        >
          Ver carteira
        </Button>
      </CardContent>
    </Card>
  );
};

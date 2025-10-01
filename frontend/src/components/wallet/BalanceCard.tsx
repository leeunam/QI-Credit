import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface BalanceCardProps {
  balance: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance }) => {
  const [isVisible, setIsVisible] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-primary border-0 text-white shadow-elegant">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-body-3 text-white/80">Saldo disponível</span>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4 text-white/80" />
            ) : (
              <Eye className="h-4 w-4 text-white/80" />
            )}
          </button>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-h2 font-bold font-display">
            {isVisible ? formatCurrency(balance) : '••••••'}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span className="text-body-4 text-white/80">Conta ativa</span>
        </div>
      </CardContent>
    </Card>
  );
};
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, Shield, DollarSign } from 'lucide-react';
import type { CreditOffer } from '@/services/marketplaceService';

interface OfferCardProps {
  offer: CreditOffer;
  onInvest?: (offerId: string) => void;
}

export function OfferCard({ offer, onInvest }: OfferCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Baixo Risco':
        return 'bg-success/10 text-success border-success/20';
      case 'Médio Risco':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Alto Risco':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="p-6 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card">
      <div className="space-y-4">
        {/* Header com valor e badge de risco */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Valor do Empréstimo</p>
            <h3 className="text-heading-3 text-card-foreground font-bold">
              {formatCurrency(offer.amount)}
            </h3>
          </div>
          <Badge variant="outline" className={getRiskColor(offer.riskProfile)}>
            {offer.riskProfile}
          </Badge>
        </div>

        {/* Informações principais em grid */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Juros</p>
              <p className="text-body-1 font-semibold text-card-foreground">
                {offer.interestRate.toFixed(1)}% a.m.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Calendar className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">Prazo</p>
              <p className="text-body-1 font-semibold text-card-foreground">
                {offer.term} meses
              </p>
            </div>
          </div>
        </div>

        {/* Score e Retornos */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <p className="text-body-3 text-muted-foreground">
              Score do Tomador: <span className="font-semibold text-card-foreground">{offer.borrowerScore}</span>
            </p>
          </div>
          
          {offer.monthlyReturn && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-success" />
              <p className="text-body-3 text-muted-foreground">
                Retorno Mensal: <span className="font-semibold text-success">{formatCurrency(offer.monthlyReturn)}</span>
              </p>
            </div>
          )}
          
          {offer.totalReturn && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground mb-1">Retorno Total Estimado</p>
              <p className="text-body-2 font-bold text-success">
                {formatCurrency(offer.totalReturn)}
              </p>
            </div>
          )}
        </div>

        {/* Botão de Investir */}
        <Button
          onClick={() => onInvest?.(offer.id)}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          size="lg"
        >
          Investir Agora
        </Button>
      </div>
    </Card>
  );
}

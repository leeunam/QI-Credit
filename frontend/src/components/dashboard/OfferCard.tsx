import { Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OfferCardProps {
  id: string;
  borrowerName: string;
  amount: number;
  rate: number;
  term: number;
  riskProfile: 'A' | 'B' | 'C';
  onInvest: (offerId: string, amount: number) => void;
}

const riskColors = {
  A: 'bg-success text-success-foreground',
  B: 'bg-warning text-warning-foreground',
  C: 'bg-error text-error-foreground',
};

export const OfferCard = ({
  id,
  borrowerName,
  amount,
  rate,
  term,
  riskProfile,
  onInvest,
}: OfferCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-body-3 font-semibold text-foreground">{borrowerName}</p>
            <p className="text-body-4 text-muted-foreground">Tomador</p>
          </div>
          <Badge className={riskColors[riskProfile]} variant="secondary">
            Risco {riskProfile}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-body-4 text-muted-foreground">Valor solicitado</span>
            <span className="text-body-3 font-semibold">{formatCurrency(amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-body-4 text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Taxa
            </span>
            <span className="text-body-3 font-semibold text-success">{rate}% a.m.</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-body-4 text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Prazo
            </span>
            <span className="text-body-3">{term} meses</span>
          </div>
        </div>

        <Button
          className="w-full"
          size="sm"
          onClick={() => onInvest(id, amount)}
        >
          Investir
        </Button>
      </CardContent>
    </Card>
  );
};

import { Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LoanCardProps {
  outstandingPrincipal: number;
  nextDueDate: string;
  nextInstallment: number;
  onPayInstallment: () => void;
}

export const LoanCard = ({
  outstandingPrincipal,
  nextDueDate,
  nextInstallment,
  onPayInstallment,
}: LoanCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const daysUntilDue = Math.ceil(
    (new Date(nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-body-2">Empréstimos Ativos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-body-4 text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Saldo devedor
            </span>
            <span className="text-body-2 font-semibold">
              {formatCurrency(outstandingPrincipal)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-body-4 text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Próximo vencimento
            </span>
            <div className="text-right">
              <p className="text-body-3 font-semibold">{formatDate(nextDueDate)}</p>
              <p className="text-body-4 text-muted-foreground">
                {daysUntilDue} dias
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-body-3 font-medium">Próxima parcela</span>
            <span className="text-body-2 font-bold text-primary">
              {formatCurrency(nextInstallment)}
            </span>
          </div>
        </div>

        <Button className="w-full" onClick={onPayInstallment}>
          Pagar Parcela
        </Button>
      </CardContent>
    </Card>
  );
};

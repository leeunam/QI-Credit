import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, CreditCard, TrendingUp } from "lucide-react";
import { PaymentHistory as PaymentHistoryType } from "../../services/paymentMock";

interface PaymentHistoryProps {
  history: PaymentHistoryType[];
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ history }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: PaymentHistoryType['type']) => {
    return type === 'payment' ? (
      <CreditCard className="w-4 h-4 text-[hsl(var(--color-primary))]" />
    ) : (
      <TrendingUp className="w-4 h-4 text-[hsl(var(--color-secondary))]" />
    );
  };

  const getTypeColor = (type: PaymentHistoryType['type']) => {
    return type === 'payment' 
      ? 'bg-[hsl(var(--color-primary))] text-[hsl(var(--text-light))]'
      : 'bg-[hsl(var(--color-secondary))] text-[hsl(var(--text-light))]';
  };

  const getTypeText = (type: PaymentHistoryType['type']) => {
    return type === 'payment' ? 'Pagamento' : 'Antecipação';
  };

  if (history.length === 0) {
    return (
      <Card className="bg-[hsl(var(--text-light))] border-[hsl(var(--color-tertiary))]">
        <CardContent className="py-8">
          <div className="text-center space-y-2">
            <Calendar className="w-12 h-12 text-[hsl(var(--color-tertiary))] mx-auto" />
            <h3 className="text-body-2 font-semibold text-[hsl(var(--text-dark))]">
              Nenhum histórico encontrado
            </h3>
            <p className="text-body-4 text-[hsl(var(--color-tertiary))]">
              Os pagamentos realizados aparecerão aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[hsl(var(--text-light))] border-[hsl(var(--color-tertiary))]">
      <CardHeader>
        <CardTitle className="text-h3 font-display font-semibold text-[hsl(var(--text-dark))] flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Histórico de Pagamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile view */}
        <div className="block md:hidden space-y-4">
          {history.map((payment) => (
            <div key={payment.id} className="p-4 border border-[hsl(var(--color-tertiary))] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(payment.type)}
                  <Badge className={`${getTypeColor(payment.type)} text-body-4`}>
                    {getTypeText(payment.type)}
                  </Badge>
                </div>
                <span className="text-body-3 font-semibold text-[hsl(var(--text-dark))]">
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-body-4 text-[hsl(var(--color-tertiary))]">Data</span>
                  <span className="text-body-4 text-[hsl(var(--text-dark))]">
                    {formatDateTime(payment.paymentDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-4 text-[hsl(var(--color-tertiary))]">Método</span>
                  <span className="text-body-4 text-[hsl(var(--text-dark))]">
                    {payment.method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-4 text-[hsl(var(--color-tertiary))]">ID Transação</span>
                  <span className="text-body-4 text-[hsl(var(--text-dark))] font-mono">
                    {payment.transactionId}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop view */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-body-4 font-semibold text-[hsl(var(--color-tertiary))]">
                  Tipo
                </TableHead>
                <TableHead className="text-body-4 font-semibold text-[hsl(var(--color-tertiary))]">
                  Valor
                </TableHead>
                <TableHead className="text-body-4 font-semibold text-[hsl(var(--color-tertiary))]">
                  Data
                </TableHead>
                <TableHead className="text-body-4 font-semibold text-[hsl(var(--color-tertiary))]">
                  Método
                </TableHead>
                <TableHead className="text-body-4 font-semibold text-[hsl(var(--color-tertiary))]">
                  ID Transação
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(payment.type)}
                      <Badge className={`${getTypeColor(payment.type)} text-body-4`}>
                        {getTypeText(payment.type)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-body-3 font-semibold text-[hsl(var(--text-dark))]">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell className="text-body-4 text-[hsl(var(--text-dark))]">
                    {formatDateTime(payment.paymentDate)}
                  </TableCell>
                  <TableCell className="text-body-4 text-[hsl(var(--text-dark))]">
                    {payment.method}
                  </TableCell>
                  <TableCell className="text-body-4 text-[hsl(var(--text-dark))] font-mono">
                    {payment.transactionId}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
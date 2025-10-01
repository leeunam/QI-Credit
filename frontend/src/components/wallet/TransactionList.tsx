import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, CreditCard, Banknote } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4" />;
      case 'withdrawal':
        return <Banknote className="h-4 w-4" />;
      case 'transfer':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-success';
    if (type === 'withdrawal') return 'text-warning';
    return 'text-error';
  };

  const getIconBgColor = (type: string, amount: number) => {
    if (amount > 0) return 'bg-success/10 text-success';
    if (type === 'withdrawal') return 'bg-warning/10 text-warning';
    return 'bg-error/10 text-error';
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-h3 font-display">Histórico de transações</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-body-3 text-muted-foreground">
              Nenhuma transação encontrada
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${getIconBgColor(transaction.type, transaction.amount)}`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-body-3 font-medium truncate">
                          {transaction.description}
                        </p>
                        <p className="text-body-4 text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-body-3 font-semibold ${getTransactionColor(transaction.type, transaction.amount)}`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </p>
                        <p className={`text-body-4 ${
                          transaction.status === 'completed' 
                            ? 'text-success' 
                            : transaction.status === 'pending'
                            ? 'text-warning'
                            : 'text-error'
                        }`}>
                          {transaction.status === 'completed' && 'Concluída'}
                          {transaction.status === 'pending' && 'Pendente'}
                          {transaction.status === 'failed' && 'Falhou'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
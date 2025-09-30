import { Shield, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface EscrowStatusCardProps {
  activeEscrows: number;
  totalValue: number;
  reconciliationPercentage: number;
  events: Array<{
    id: string;
    type: string;
    amount: number;
    eventHash: string;
    timestamp: string;
  }>;
  onViewDetails: () => void;
}

export const EscrowStatusCard = ({
  activeEscrows,
  totalValue,
  reconciliationPercentage,
  events,
  onViewDetails,
}: EscrowStatusCardProps) => {
  const { toast } = useToast();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    toast({
      title: 'Hash copiado',
      description: 'Hash do evento copiado para área de transferência',
    });
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-body-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Status Escrow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-body-4 text-muted-foreground">Escrows ativos</p>
            <p className="text-h4 font-bold text-foreground">{activeEscrows}</p>
          </div>
          <div>
            <p className="text-body-4 text-muted-foreground">Valor total</p>
            <p className="text-body-2 font-semibold text-foreground">
              {formatCurrency(totalValue)}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-body-4 text-muted-foreground">Reconciliação</span>
            <span className="text-body-3 font-semibold text-success">
              {reconciliationPercentage}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-success h-2 rounded-full transition-all"
              style={{ width: `${reconciliationPercentage}%` }}
            />
          </div>
        </div>

        {events.length > 0 && (
          <div className="space-y-2">
            <p className="text-body-4 font-medium text-foreground">Eventos recentes</p>
            {events.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-body-4 font-medium capitalize">{event.type}</p>
                  <p className="text-body-4 text-muted-foreground font-mono truncate">
                    {event.eventHash.slice(0, 12)}...
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyHash(event.eventHash)}
                >
                  {copiedHash === event.eventHash ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={onViewDetails}>
          Ver detalhes
        </Button>
      </CardContent>
    </Card>
  );
};

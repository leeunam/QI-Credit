import { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InvestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: {
    id: string;
    borrowerName: string;
    amount: number;
    rate: number;
    term: number;
    riskProfile: 'A' | 'B' | 'C';
  } | null;
  onConfirm: (offerId: string, amount: number) => Promise<void>;
}

export const InvestModal = ({ open, onOpenChange, offer, onConfirm }: InvestModalProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [holdId, setHoldId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleConfirm = async () => {
    if (!offer) return;

    setLoading(true);
    setError(null);

    try {
      await onConfirm(offer.id, offer.amount);
      setHoldId(`hold_${Date.now()}`);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar investimento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSuccess(false);
      setError(null);
      setHoldId(null);
    }, 300);
  };

  if (!offer) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!success && !error && (
          <>
            <DialogHeader>
              <DialogTitle className="text-h3">Confirmar Investimento</DialogTitle>
              <DialogDescription>
                Revise os detalhes antes de confirmar seu investimento
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-body-3 text-muted-foreground">Tomador</span>
                  <span className="text-body-3 font-medium">{offer.borrowerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-3 text-muted-foreground">Valor</span>
                  <span className="text-body-2 font-semibold">
                    {formatCurrency(offer.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-3 text-muted-foreground">Taxa</span>
                  <span className="text-body-3 font-medium text-success">
                    {offer.rate}% a.m.
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-3 text-muted-foreground">Prazo</span>
                  <span className="text-body-3 font-medium">{offer.term} meses</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body-3 text-muted-foreground">Perfil de risco</span>
                  <Badge variant="secondary">Risco {offer.riskProfile}</Badge>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-body-4 text-muted-foreground">
                  Os fundos serão reservados (hold) até a validação de crédito e assinatura
                  do contrato. Você receberá uma notificação quando o processo for concluído.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar
              </Button>
            </div>
          </>
        )}

        {success && (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
              </div>
              <DialogTitle className="text-h3 text-center">
                Investimento Confirmado!
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-body-3 text-center text-muted-foreground">
                Fundos reservados com sucesso. Aguarde a validação de crédito.
              </p>

              {holdId && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-body-4 text-muted-foreground mb-1">ID do Hold</p>
                  <p className="text-body-3 font-mono">{holdId}</p>
                </div>
              )}

              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-body-4 text-foreground">
                  Status: <strong>Aguardando validação KYC</strong>
                </p>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </>
        )}

        {error && (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-error/10 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-error" />
                </div>
              </div>
              <DialogTitle className="text-h3 text-center">Erro no Investimento</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-body-3 text-center text-muted-foreground">{error}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleConfirm} className="flex-1">
                Tentar Novamente
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

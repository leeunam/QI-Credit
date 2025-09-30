import { Copy, Check, QrCode } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DepositModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DepositModal = ({ open, onOpenChange }: DepositModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Mock PIX code
  const pixCode =
    '00020126580014br.gov.bcb.pix0136a7f2c8d4-1234-5678-9abc-def012345678520400005303986540510.005802BR5925P2P Lending Platform6009Sao Paulo62070503***6304ABCD';

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast({
      title: 'Código copiado',
      description: 'Código PIX copiado para área de transferência',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-h3">Depositar via PIX</DialogTitle>
          <DialogDescription>
            Escaneie o QR Code ou copie o código PIX para fazer seu depósito
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* QR Code placeholder */}
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
              <QrCode className="h-32 w-32 text-muted-foreground" />
            </div>
          </div>

          {/* PIX Code */}
          <div className="space-y-2">
            <label className="text-body-3 font-medium">Código PIX Copia e Cola</label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-muted rounded-lg overflow-hidden">
                <p className="text-body-4 font-mono truncate">{pixCode}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyPixCode}
                aria-label="Copiar código PIX"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <p className="text-body-3 font-medium">Instruções:</p>
            <ol className="text-body-4 text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Abra o app do seu banco</li>
              <li>Escolha pagar via PIX QR Code ou Copia e Cola</li>
              <li>Escaneie o código ou cole o código acima</li>
              <li>Confirme o pagamento no seu banco</li>
              <li>Aguarde a confirmação (geralmente instantâneo)</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-body-4 text-foreground">
              <strong>Atenção:</strong> O depósito será confirmado em até 2 minutos. Você
              receberá uma notificação quando os fundos estiverem disponíveis.
            </p>
          </div>
        </div>

        <Button onClick={() => onOpenChange(false)} className="w-full">
          Entendi
        </Button>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CreditCard, TrendingUp, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Installment, payInstallment, anticipateInstallment, getAvailablePaymentMethods } from "../../services/paymentMock";

interface PaymentInstallmentsProps {
  installments: Installment[];
  onPaymentSuccess: () => void;
}

export const PaymentInstallments: React.FC<PaymentInstallmentsProps> = ({ installments, onPaymentSuccess }) => {
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAnticipationModalOpen, setIsAnticipationModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const getStatusIcon = (status: Installment['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-[hsl(var(--color-success))]" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-[hsl(var(--color-warning))]" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-[hsl(var(--color-error))]" />;
      case 'anticipated':
        return <TrendingUp className="w-4 h-4 text-[hsl(var(--color-info))]" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Installment['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-[hsl(var(--color-success))] text-[hsl(var(--text-light))]';
      case 'pending':
        return 'bg-[hsl(var(--color-warning))] text-[hsl(var(--text-dark))]';
      case 'overdue':
        return 'bg-[hsl(var(--color-error))] text-[hsl(var(--text-light))]';
      case 'anticipated':
        return 'bg-[hsl(var(--color-info))] text-[hsl(var(--text-light))]';
      default:
        return 'bg-[hsl(var(--color-tertiary))] text-[hsl(var(--text-light))]';
    }
  };

  const getStatusText = (status: Installment['status']) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Em Atraso';
      case 'anticipated':
        return 'Antecipado';
      default:
        return status;
    }
  };

  const openPaymentModal = async (installment: Installment) => {
    setSelectedInstallment(installment);
    try {
      const methods = await getAvailablePaymentMethods();
      setPaymentMethods(methods);
      setIsPaymentModalOpen(true);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os métodos de pagamento.",
        variant: "destructive",
      });
    }
  };

  const openAnticipationModal = (installment: Installment) => {
    setSelectedInstallment(installment);
    setIsAnticipationModalOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedInstallment || !selectedPaymentMethod) return;

    setIsProcessing(true);
    try {
      const result = await payInstallment(selectedInstallment.id, selectedPaymentMethod);
      
      if (result.success) {
        toast({
          title: "Pagamento Realizado",
          description: `Parcela ${selectedInstallment.installmentNumber} paga com sucesso!`,
        });
        setIsPaymentModalOpen(false);
        onPaymentSuccess();
      } else {
        toast({
          title: "Erro no Pagamento",
          description: result.error || "Falha no processamento do pagamento.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha na comunicação com o servidor.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAnticipation = async () => {
    if (!selectedInstallment) return;

    setIsProcessing(true);
    try {
      const result = await anticipateInstallment(selectedInstallment.id);
      
      if (result.success) {
        toast({
          title: "Antecipação Realizada",
          description: `Parcela ${selectedInstallment.installmentNumber} antecipada com desconto de R$ ${result.discount?.toFixed(2)}!`,
        });
        setIsAnticipationModalOpen(false);
        onPaymentSuccess();
      } else {
        toast({
          title: "Erro na Antecipação",
          description: result.error || "Falha no processamento da antecipação.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha na comunicação com o servidor.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-h3 font-display font-semibold text-[hsl(var(--text-dark))]">
        Parcelas
      </h3>

      <div className="grid gap-4 mobile:grid-cols-1 md:grid-cols-2 desktop-sm:grid-cols-3">
        {installments.map((installment) => (
          <Card key={installment.id} className="bg-[hsl(var(--text-light))] border-[hsl(var(--color-tertiary))]">
            <CardHeader className="pb-3">
              <CardTitle className="text-body-2 font-display font-semibold flex items-center justify-between">
                <span>Parcela {installment.installmentNumber}</span>
                {getStatusIcon(installment.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body-4 text-[hsl(var(--color-tertiary))]">Valor</span>
                <span className="text-body-3 font-semibold text-[hsl(var(--text-dark))]">
                  {formatCurrency(installment.amount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-4 text-[hsl(var(--color-tertiary))]">Vencimento</span>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[hsl(var(--color-tertiary))]" />
                  <span className="text-body-4 text-[hsl(var(--text-dark))]">
                    {formatDate(installment.dueDate)}
                  </span>
                </div>
              </div>

              {installment.paymentDate && (
                <div className="flex items-center justify-between">
                  <span className="text-body-4 text-[hsl(var(--color-tertiary))]">Pago em</span>
                  <span className="text-body-4 text-[hsl(var(--text-dark))]">
                    {formatDate(installment.paymentDate)}
                  </span>
                </div>
              )}

              <Badge className={`${getStatusColor(installment.status)} text-body-4 justify-center`}>
                {getStatusText(installment.status)}
              </Badge>

              {installment.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => openPaymentModal(installment)}
                    className="flex-1 bg-[hsl(var(--color-primary))] text-[hsl(var(--text-light))] hover:brightness-95"
                    size="sm"
                  >
                    <CreditCard className="w-3 h-3 mr-1" />
                    Pagar
                  </Button>
                  
                  {installment.anticipationDiscount && (
                    <Button
                      onClick={() => openAnticipationModal(installment)}
                      variant="outline"
                      className="flex-1 border-[hsl(var(--color-secondary))] text-[hsl(var(--color-secondary))] hover:bg-[hsl(var(--color-secondary))] hover:text-[hsl(var(--text-light))]"
                      size="sm"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Antecipar
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="bg-[hsl(var(--text-light))] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-h4 font-display font-semibold text-[hsl(var(--text-dark))]">
              Pagar Parcela {selectedInstallment?.installmentNumber}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-[hsl(var(--bg-light))] rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-body-3 text-[hsl(var(--color-tertiary))]">Valor a pagar</span>
                <span className="text-body-2 font-semibold text-[hsl(var(--text-dark))]">
                  {selectedInstallment && formatCurrency(selectedInstallment.amount)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-body-3 font-medium text-[hsl(var(--text-dark))]">
                Método de Pagamento
              </label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger className="border-[hsl(var(--color-tertiary))] focus:border-[hsl(var(--color-primary))]">
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!selectedPaymentMethod || isProcessing}
                className="flex-1 bg-[hsl(var(--color-primary))] text-[hsl(var(--text-light))] hover:brightness-95"
              >
                {isProcessing ? "Processando..." : "Confirmar Pagamento"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Anticipation Modal */}
      <Dialog open={isAnticipationModalOpen} onOpenChange={setIsAnticipationModalOpen}>
        <DialogContent className="bg-[hsl(var(--text-light))] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-h4 font-display font-semibold text-[hsl(var(--text-dark))]">
              Antecipar Parcela {selectedInstallment?.installmentNumber}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-[hsl(var(--bg-light))] rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-body-3 text-[hsl(var(--color-tertiary))]">Valor original</span>
                <span className="text-body-3 text-[hsl(var(--text-dark))]">
                  {selectedInstallment && formatCurrency(selectedInstallment.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-body-3 text-[hsl(var(--color-tertiary))]">Desconto</span>
                <span className="text-body-3 text-[hsl(var(--color-success))]">
                  - {selectedInstallment && formatCurrency(selectedInstallment.anticipationDiscount || 0)}
                </span>
              </div>
              <hr className="border-[hsl(var(--color-tertiary))]" />
              <div className="flex justify-between items-center">
                <span className="text-body-2 font-semibold text-[hsl(var(--text-dark))]">Valor final</span>
                <span className="text-body-2 font-semibold text-[hsl(var(--text-dark))]">
                  {selectedInstallment && formatCurrency(
                    selectedInstallment.amount - (selectedInstallment.anticipationDiscount || 0)
                  )}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAnticipationModalOpen(false)}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAnticipation}
                disabled={isProcessing}
                className="flex-1 bg-[hsl(var(--color-secondary))] text-[hsl(var(--text-light))] hover:brightness-95"
              >
                {isProcessing ? "Processando..." : "Confirmar Antecipação"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Header2 } from '@/components/layout/Header2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getPaymentContract,
  getPaymentHistory,
  payInstallment,
  anticipateInstallment,
  getAvailablePaymentMethods,
  type PaymentContract,
  type PaymentHistory,
  type Installment,
} from '@/services/paymentMock';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  History,
  Zap,
} from 'lucide-react';

export default function Payments() {
  const [contract, setContract] = useState<PaymentContract | null>(null);
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isAnticipationDialogOpen, setIsAnticipationDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contractData, historyData, methods] = await Promise.all([
        getPaymentContract('payment-001'),
        getPaymentHistory('payment-001'),
        getAvailablePaymentMethods(),
      ]);
      setContract(contractData);
      setHistory(historyData);
      setPaymentMethods(methods);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedInstallment || !selectedMethod) return;

    setProcessing(true);
    try {
      const result = await payInstallment(selectedInstallment.id, selectedMethod);
      if (result.success) {
        toast({
          title: 'Pagamento realizado!',
          description: `Parcela ${selectedInstallment.installmentNumber} paga com sucesso.`,
        });
        setIsPaymentDialogOpen(false);
        loadData();
      } else {
        toast({
          title: 'Erro no pagamento',
          description: result.error,
          variant: 'destructive',
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleAnticipation = async () => {
    if (!selectedInstallment) return;

    setProcessing(true);
    try {
      const result = await anticipateInstallment(selectedInstallment.id);
      if (result.success) {
        toast({
          title: 'Antecipação realizada!',
          description: `Desconto de ${formatCurrency(result.discount || 0)} aplicado.`,
        });
        setIsAnticipationDialogOpen(false);
        loadData();
      } else {
        toast({
          title: 'Erro na antecipação',
          description: result.error,
          variant: 'destructive',
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: Installment['status']) => {
    const variants = {
      paid: { variant: 'default' as const, icon: CheckCircle2, label: 'Pago', color: 'text-green-600' },
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pendente', color: 'text-yellow-600' },
      overdue: { variant: 'destructive' as const, icon: AlertCircle, label: 'Atrasado', color: 'text-red-600' },
      anticipated: { variant: 'default' as const, icon: Zap, label: 'Antecipado', color: 'text-purple-600' },
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header2 />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header2 />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Contrato não encontrado.</p>
        </div>
      </div>
    );
  }

  const progressPercentage = (contract.paidAmount / contract.totalAmount) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header2 />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
            Pagamentos
          </h1>
          <p className="text-muted-foreground">{contract.title}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Valor Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {formatCurrency(contract.totalAmount)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Valor Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(contract.paidAmount)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-600" />
                Valor Restante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">
                {formatCurrency(contract.remainingAmount)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="mb-8 bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Progresso do Pagamento</CardTitle>
            <CardDescription>
              {progressPercentage.toFixed(1)}% pago
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Installments */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Parcelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contract.installments.map((installment) => (
                  <div
                    key={installment.id}
                    className="p-4 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">Parcela {installment.installmentNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Vencimento: {formatDate(installment.dueDate)}
                        </p>
                        {installment.paymentDate && (
                          <p className="text-sm text-muted-foreground">
                            Pago em: {formatDate(installment.paymentDate)}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(installment.status)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold">{formatCurrency(installment.amount)}</p>
                      
                      {installment.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedInstallment(installment);
                              setIsPaymentDialogOpen(true);
                            }}
                          >
                            Pagar
                          </Button>
                          {installment.anticipationDiscount && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedInstallment(installment);
                                setIsAnticipationDialogOpen(true);
                              }}
                            >
                              <Zap className="h-4 w-4 mr-1" />
                              Antecipar
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {installment.anticipationDiscount && installment.status === 'pending' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Desconto para antecipação: {formatCurrency(installment.anticipationDiscount)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum pagamento realizado ainda.
                  </p>
                ) : (
                  history.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 rounded-lg border border-border bg-background/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(payment.paymentDate)}
                          </p>
                        </div>
                        <Badge variant={payment.type === 'anticipation' ? 'default' : 'secondary'}>
                          {payment.type === 'anticipation' ? 'Antecipação' : 'Pagamento'}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Método: {payment.method}</p>
                        <p>ID: {payment.transactionId}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Realizar Pagamento</DialogTitle>
            <DialogDescription>
              Parcela {selectedInstallment?.installmentNumber} - {formatCurrency(selectedInstallment?.amount || 0)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Método de Pagamento</label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePayment} disabled={!selectedMethod || processing}>
              {processing ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Anticipation Dialog */}
      <Dialog open={isAnticipationDialogOpen} onOpenChange={setIsAnticipationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Antecipar Pagamento</DialogTitle>
            <DialogDescription>
              Parcela {selectedInstallment?.installmentNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Valor Original</p>
              <p className="text-2xl font-bold">{formatCurrency(selectedInstallment?.amount || 0)}</p>
            </div>
            
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-muted-foreground mb-1">Desconto</p>
              <p className="text-2xl font-bold text-green-600">
                - {formatCurrency(selectedInstallment?.anticipationDiscount || 0)}
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Valor Final</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {formatCurrency(
                  (selectedInstallment?.amount || 0) - (selectedInstallment?.anticipationDiscount || 0)
                )}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnticipationDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAnticipation} disabled={processing}>
              {processing ? 'Processando...' : 'Confirmar Antecipação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
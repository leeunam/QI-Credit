import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Wallet, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { PaymentInstallments } from "@/components/payment/PaymentInstallments";
import { PaymentHistory } from "@/components/payment/PaymentHistory";
import { 
  PaymentContract, 
  PaymentHistory as PaymentHistoryType, 
  getPaymentContract, 
  getPaymentHistory 
} from "../services/paymentMock";

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<PaymentContract | null>(null);
  const [history, setHistory] = useState<PaymentHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const { toast } = useToast();

  const loadContractData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const contractData = await getPaymentContract(id);
      
      if (contractData) {
        setContract(contractData);
      } else {
        toast({
          title: "Contrato não encontrado",
          description: "O contrato solicitado não existe ou foi removido.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar contrato",
        description: "Não foi possível carregar os dados do contrato.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentHistory = async () => {
    if (!id) return;

    try {
      setHistoryLoading(true);
      const historyData = await getPaymentHistory(id);
      setHistory(historyData);
    } catch (error) {
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de pagamentos.",
        variant: "destructive",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadContractData();
    loadPaymentHistory();
  }, [id]);

  const handlePaymentSuccess = () => {
    // Reload contract data to get updated payment status
    loadContractData();
    loadPaymentHistory();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getProgressPercentage = () => {
    if (!contract) return 0;
    return (contract.paidAmount / contract.totalAmount) * 100;
  };

  const getPendingInstallments = () => {
    if (!contract) return 0;
    return contract.installments.filter(i => i.status === 'pending' || i.status === 'overdue').length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-light))] p-4 mobile:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-64" />
          </div>
          
          <div className="grid gap-6 mobile:grid-cols-1 lg:grid-cols-4">
            <Skeleton className="h-32 lg:col-span-1" />
            <Skeleton className="h-32 lg:col-span-1" />
            <Skeleton className="h-32 lg:col-span-1" />
            <Skeleton className="h-32 lg:col-span-1" />
          </div>
          
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-[hsl(var(--bg-light))] p-4 mobile:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-[hsl(var(--text-light))] border-[hsl(var(--color-tertiary))]">
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <Wallet className="w-16 h-16 text-[hsl(var(--color-tertiary))] mx-auto" />
                <h2 className="text-h2 font-display font-semibold text-[hsl(var(--text-dark))]">
                  Contrato não encontrado
                </h2>
                <p className="text-body-2 text-[hsl(var(--color-tertiary))]">
                  O contrato solicitado não existe ou foi removido.
                </p>
                <Button 
                  onClick={() => window.history.back()}
                  className="bg-[hsl(var(--color-primary))] text-[hsl(var(--text-light))] hover:brightness-95"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-light))] p-4 mobile:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.history.back()}
            className="border-[hsl(var(--color-tertiary))] hover:bg-[hsl(var(--color-tertiary))] hover:text-[hsl(var(--text-light))]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-h1 font-display font-bold text-[hsl(var(--text-dark))]">
              Pagamentos e Acompanhamento
            </h1>
            <p className="text-body-2 text-[hsl(var(--color-tertiary))] mt-1">
              {contract.title}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 mobile:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[hsl(var(--text-light))] border-[hsl(var(--color-tertiary))]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-[hsl(var(--color-primary))]" />
                <div>
                  <p className="text-body-4 text-[hsl(var(--color-tertiary))]">Valor Total</p>
                  <p className="text-body-2 font-semibold text-[hsl(var(--text-dark))]">
                    {formatCurrency(contract.totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(var(--text-light))] border-[hsl(var(--color-tertiary))]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-[hsl(var(--color-success))]" />
                <div>
                  <p className="text-body-4 text-[hsl(var(--color-tertiary))]">Valor Pago</p>
                  <p className="text-body-2 font-semibold text-[hsl(var(--text-dark))]">
                    {formatCurrency(contract.paidAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(var(--text-light))] border-[hsl(var(--color-tertiary))]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Wallet className="w-8 h-8 text-[hsl(var(--color-warning))]" />
                <div>
                  <p className="text-body-4 text-[hsl(var(--color-tertiary))]">Valor Restante</p>
                  <p className="text-body-2 font-semibold text-[hsl(var(--text-dark))]">
                    {formatCurrency(contract.remainingAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(var(--text-light))] border-[hsl(var(--color-tertiary))]">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-[hsl(var(--color-info))]" />
                <div>
                  <p className="text-body-4 text-[hsl(var(--color-tertiary))]">Parcelas Pendentes</p>
                  <p className="text-body-2 font-semibold text-[hsl(var(--text-dark))]">
                    {getPendingInstallments()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="bg-[hsl(var(--text-light))] border-[hsl(var(--color-tertiary))]">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-body-3 font-medium text-[hsl(var(--text-dark))]">
                  Progresso do Pagamento
                </span>
                <Badge className="bg-[hsl(var(--color-info))] text-[hsl(var(--text-light))] text-body-4">
                  {getProgressPercentage().toFixed(1)}%
                </Badge>
              </div>
              <div className="w-full bg-[hsl(var(--bg-light))] rounded-full h-3">
                <div 
                  className="bg-[hsl(var(--color-success))] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="installments" className="space-y-6">
          <TabsList className="bg-[hsl(var(--bg-light))] p-1">
            <TabsTrigger 
              value="installments"
              className="data-[state=active]:bg-[hsl(var(--text-light))] data-[state=active]:text-[hsl(var(--text-dark))]"
            >
              Parcelas
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-[hsl(var(--text-light))] data-[state=active]:text-[hsl(var(--text-dark))]"
            >
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installments">
            <PaymentInstallments 
              installments={contract.installments}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </TabsContent>

          <TabsContent value="history">
            {historyLoading ? (
              <Card className="bg-[hsl(var(--text-light))] border-[hsl(var(--color-tertiary))]">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <PaymentHistory history={history} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PaymentPage;
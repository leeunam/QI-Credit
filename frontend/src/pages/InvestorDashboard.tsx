import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Wallet, AlertTriangle, DollarSign } from 'lucide-react';
import {
  getInvestorDashboardData,
  type InvestorDashboardData,
} from '@/services/investorService';
import { toast } from 'sonner';

/**
 * Componente de Métrica - Card exibindo uma métrica principal
 */
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}

function MetricCard({ title, value, icon, colorClass }: MetricCardProps) {
  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-body-3 text-muted-foreground">{title}</span>
          <div className={colorClass}>{icon}</div>
        </div>
        <p className={`text-heading-2 font-bold ${colorClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Componente de Gráfico de Barras Simples
 */
interface SimpleBarChartProps {
  data: { label: string; value: number }[];
}

function SimpleBarChart({ data }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <span className="text-body-3 text-muted-foreground w-12">
            {item.label}
          </span>
          <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            >
              <span className="text-xs font-semibold text-primary-foreground">
                R$ {item.value.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Componente de Card de Investimento
 */
interface InvestmentCardProps {
  investment: {
    id: string;
    amount: number;
    interestRate: number;
    term: number;
    borrowerScore: number;
    riskProfile: string;
    status: string;
    nextPaymentDate: string;
    accumulatedReturn: number;
  };
}

function InvestmentCard({ investment }: InvestmentCardProps) {
  const isDelayed = investment.status === 'Atrasado';

  return (
    <Card className="border border-border bg-card hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-heading-4 text-card-foreground">
            {investment.id}
          </CardTitle>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isDelayed
                ? 'bg-error/10 text-error'
                : 'bg-success/10 text-success'
            }`}
          >
            {investment.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Valor Investido</p>
            <p className="text-body-2 font-semibold text-foreground">
              R$ {investment.amount.toLocaleString('pt-BR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Retorno Acumulado</p>
            <p className="text-body-2 font-semibold text-success">
              R$ {investment.accumulatedReturn.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Taxa de Juros</p>
            <p className="text-body-3 text-foreground">
              {investment.interestRate}% a.m.
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Prazo</p>
            <p className="text-body-3 text-foreground">
              {investment.term} meses
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Score do Tomador</p>
            <p className="text-body-3 text-foreground">
              {investment.borrowerScore} ({investment.riskProfile})
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Próximo Pagamento</p>
            <p className="text-body-3 text-foreground">
              {new Date(investment.nextPaymentDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Página de Dashboard do Investidor
 */
export default function InvestorDashboard() {
  const [data, setData] = useState<InvestorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Substituir por chamada real à API quando backend estiver pronto
      const dashboardData = await getInvestorDashboardData();
      setData(dashboardData);
    } catch (error) {
      toast.error('Erro ao carregar dados do dashboard. Tente novamente.');
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = () => {
    // TODO: Implementar lógica de retirada de ganhos quando backend estiver pronto
    toast.success('Funcionalidade de retirada em desenvolvimento...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-body-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-body-2 text-muted-foreground">
          Erro ao carregar dados
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 desktop-sm:py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-8 h-8 text-primary" />
                <h1 className="text-heading-1 text-card-foreground">
                  Acompanhamento de Investimentos
                </h1>
              </div>
              <p className="text-body-2 text-muted-foreground">
                Monitore o desempenho dos seus investimentos P2P
              </p>
            </div>
            <Button
              onClick={handleWithdraw}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Retirar Ganhos
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 desktop-sm:py-8">
        {/* Métricas Principais */}
        <section className="mb-8">
          <div className="grid grid-cols-1 mobile:grid-cols-1 desktop-sm:grid-cols-3 gap-6">
            <MetricCard
              title="Retorno Acumulado"
              value={`R$ ${data.metrics.totalReturn.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              icon={<TrendingUp className="w-6 h-6" />}
              colorClass="text-success"
            />
            <MetricCard
              title="Investimentos Ativos"
              value={data.metrics.activeInvestmentsCount.toString()}
              icon={<Wallet className="w-6 h-6" />}
              colorClass="text-info"
            />
            <MetricCard
              title="Taxa de Inadimplência"
              value={`${(data.metrics.defaultRate * 100).toFixed(1)}%`}
              icon={<AlertTriangle className="w-6 h-6" />}
              colorClass="text-error"
            />
          </div>
        </section>

        {/* Gráfico de Retorno */}
        <section className="mb-8">
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-heading-3 text-card-foreground">
                Retorno Acumulado por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={data.returnHistory} />
            </CardContent>
          </Card>
        </section>

        {/* Investimentos Ativos */}
        <section>
          <h2 className="text-heading-2 text-foreground mb-6">
            Investimentos Ativos
          </h2>
          <div className="grid gap-6 mobile:grid-cols-1 desktop-sm:grid-cols-2 desktop-lg:grid-cols-2">
            {data.activeInvestments.map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

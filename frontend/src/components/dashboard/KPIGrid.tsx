import { Clock, FileCheck, TrendingUp, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface KPIGridProps {
  avgOnboardingTime: string;
  contractsReleased: number;
  paymentsOnTime: number;
  escrowReconciled: number;
}

const kpiConfig = [
  {
    key: 'avgOnboardingTime' as const,
    label: 'Tempo médio onboarding',
    icon: Clock,
    color: 'text-info',
  },
  {
    key: 'contractsReleased' as const,
    label: 'Contratos liberados',
    icon: FileCheck,
    color: 'text-success',
    suffix: '%',
  },
  {
    key: 'paymentsOnTime' as const,
    label: 'Pagamentos on-time',
    icon: TrendingUp,
    color: 'text-primary',
    suffix: '%',
  },
  {
    key: 'escrowReconciled' as const,
    label: 'Escrow reconciliado',
    icon: Shield,
    color: 'text-secondary',
    suffix: '%',
  },
];

export const KPIGrid = ({
  avgOnboardingTime,
  contractsReleased,
  paymentsOnTime,
  escrowReconciled,
}: KPIGridProps) => {
  const values = {
    avgOnboardingTime,
    contractsReleased,
    paymentsOnTime,
    escrowReconciled,
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-body-2 font-semibold mb-4">KPIs do Sistema</h3>
        <div className="grid grid-cols-2 gap-3">
          {kpiConfig.map((kpi) => {
            const Icon = kpi.icon;
            const value = values[kpi.key];
            const displayValue = typeof value === 'number' ? `${value}${kpi.suffix || ''}` : value;

            return (
              <div
                key={kpi.key}
                className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Icon className={`h-5 w-5 ${kpi.color}`} />
                <div>
                  <p className="text-h4 font-bold text-foreground">{displayValue}</p>
                  <p className="text-body-4 text-muted-foreground leading-tight">
                    {kpi.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

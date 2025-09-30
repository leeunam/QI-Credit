/**
 * Serviço de Mock para Dados do Dashboard do Investidor
 * TODO: Substituir por chamadas reais à API quando backend estiver pronto
 */

export interface InvestmentMetrics {
  totalReturn: number;
  activeInvestmentsCount: number;
  defaultRate: number;
}

export interface ReturnHistory {
  label: string;
  value: number;
}

export interface ActiveInvestment {
  id: string;
  amount: number;
  interestRate: number;
  term: number;
  borrowerScore: number;
  riskProfile: string;
  status: string;
  nextPaymentDate: string;
  accumulatedReturn: number;
}

export interface InvestorDashboardData {
  metrics: InvestmentMetrics;
  returnHistory: ReturnHistory[];
  activeInvestments: ActiveInvestment[];
}

/**
 * Simula a busca dos dados do dashboard do investidor
 * @returns Promise com os dados do dashboard
 */
export async function getInvestorDashboardData(): Promise<InvestorDashboardData> {
  // Simula latência da rede
  await new Promise(resolve => setTimeout(resolve, 500));

  // Dados mocados para o dashboard
  const mockData: InvestorDashboardData = {
    metrics: {
      totalReturn: 1845.72,
      activeInvestmentsCount: 4,
      defaultRate: 0.035, // 3.5%
    },
    returnHistory: [
      { label: 'Abr', value: 250.30 },
      { label: 'Mai', value: 320.15 },
      { label: 'Jun', value: 285.40 },
      { label: 'Jul', value: 410.25 },
      { label: 'Ago', value: 295.80 },
      { label: 'Set', value: 283.82 },
    ],
    activeInvestments: [
      {
        id: 'INV-A0123',
        amount: 5000,
        interestRate: 1.8,
        term: 24,
        borrowerScore: 780,
        riskProfile: 'Médio Risco',
        status: 'Em dia',
        nextPaymentDate: '2025-10-15',
        accumulatedReturn: 540.50,
      },
      {
        id: 'INV-A0145',
        amount: 3500,
        interestRate: 2.2,
        term: 18,
        borrowerScore: 720,
        riskProfile: 'Médio Risco',
        status: 'Em dia',
        nextPaymentDate: '2025-10-20',
        accumulatedReturn: 462.30,
      },
      {
        id: 'INV-A0198',
        amount: 8000,
        interestRate: 1.5,
        term: 36,
        borrowerScore: 850,
        riskProfile: 'Baixo Risco',
        status: 'Em dia',
        nextPaymentDate: '2025-10-10',
        accumulatedReturn: 720.40,
      },
      {
        id: 'INV-A0234',
        amount: 2000,
        interestRate: 3.0,
        term: 12,
        borrowerScore: 650,
        riskProfile: 'Alto Risco',
        status: 'Atrasado',
        nextPaymentDate: '2025-09-25',
        accumulatedReturn: 122.52,
      },
    ],
  };

  return mockData;
}

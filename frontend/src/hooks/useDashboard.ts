import { useState, useEffect } from 'react';

export type UserRole = 'investor' | 'borrower';

export interface DashboardData {
  userRole: UserRole;
  balance: number;
  kycStatus: 'approved' | 'pending' | 'denied';
  riskProfile: 'A' | 'B' | 'C';
  investments?: {
    active: number;
    totalInvested: number;
    expectedIRR: number;
  };
  loans?: {
    outstandingPrincipal: number;
    nextDueDate: string;
    nextInstallment: number;
  };
  marketplaceOffers: Array<{
    id: string;
    borrowerName: string;
    amount: number;
    rate: number;
    term: number;
    riskProfile: 'A' | 'B' | 'C';
  }>;
  activities: Array<{
    id: string;
    type: 'deposit' | 'contract' | 'payment' | 'alert';
    title: string;
    timestamp: string;
    actionLink?: string;
  }>;
  escrow: {
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
  };
  kpis: {
    avgOnboardingTime: string;
    contractsReleased: number;
    paymentsOnTime: number;
    escrowReconciled: number;
  };
  creditScore?: number;
  notifications: Array<{
    id: string;
    message: string;
    read: boolean;
    timestamp: string;
  }>;
}

// Mock data generator
const generateMockData = (role: UserRole): DashboardData => {
  const baseData = {
    userRole: role,
    balance: 12350.0,
    kycStatus: 'approved' as const,
    riskProfile: 'B' as const,
    marketplaceOffers: [
      {
        id: 'offer-1',
        borrowerName: 'João S.',
        amount: 50000,
        rate: 1.8,
        term: 12,
        riskProfile: 'B' as const,
      },
      {
        id: 'offer-2',
        borrowerName: 'Maria P.',
        amount: 30000,
        rate: 2.1,
        term: 6,
        riskProfile: 'C' as const,
      },
      {
        id: 'offer-3',
        borrowerName: 'Carlos A.',
        amount: 75000,
        rate: 1.5,
        term: 18,
        riskProfile: 'A' as const,
      },
    ],
    activities: [
      {
        id: 'act-1',
        type: 'deposit' as const,
        title: 'Depósito via PIX confirmado',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actionLink: '/wallet/deposit-1',
      },
      {
        id: 'act-2',
        type: 'contract' as const,
        title: 'Contrato #1234 assinado',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        actionLink: '/contracts/1234',
      },
      {
        id: 'act-3',
        type: 'payment' as const,
        title: 'Pagamento recebido - Empréstimo #5678',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    escrow: {
      activeEscrows: 5,
      totalValue: 125000,
      reconciliationPercentage: 98.5,
      events: [
        {
          id: 'escrow-1',
          type: 'hold',
          amount: 50000,
          eventHash: '0x1a2b3c4d5e6f7890abcdef',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    kpis: {
      avgOnboardingTime: '2.5 dias',
      contractsReleased: 95,
      paymentsOnTime: 98,
      escrowReconciled: 99,
    },
    notifications: [
      {
        id: 'notif-1',
        message: 'Novo investimento disponível no seu perfil',
        read: false,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'notif-2',
        message: 'Pagamento recebido com sucesso',
        read: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };

  if (role === 'investor') {
    return {
      ...baseData,
      investments: {
        active: 8,
        totalInvested: 250000,
        expectedIRR: 18.5,
      },
    };
  } else {
    return {
      ...baseData,
      loans: {
        outstandingPrincipal: 45000,
        nextDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextInstallment: 4250,
      },
      creditScore: 780,
    };
  }
};

export const useDashboard = (userRole: UserRole = 'investor') => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockData = generateMockData(userRole);
      setData(mockData);
      setError(null);
    } catch (err) {
      setError('Falha ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchDashboard();
  };

  useEffect(() => {
    fetchDashboard();

    // Poll every 10s for escrow updates
    const interval = setInterval(() => {
      fetchDashboard();
    }, 10000);

    return () => clearInterval(interval);
  }, [userRole]);

  return { data, loading, error, refresh };
};

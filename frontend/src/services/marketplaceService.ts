/**
 * Marketplace Service
 * Simula chamadas à API para obter ofertas de crédito P2P
 */

export interface CreditOffer {
  id: string;
  amount: number;
  interestRate: number;
  term: number;
  borrowerScore: number;
  riskProfile: 'Baixo Risco' | 'Médio Risco' | 'Alto Risco';
  monthlyReturn?: number;
  totalReturn?: number;
}

export interface MarketplaceFilters {
  minAmount?: number;
  maxAmount?: number;
  minInterestRate?: number;
  maxInterestRate?: number;
  term?: number;
  riskProfile?: string;
}

// Mock data com ofertas variadas para teste dos filtros
const mockOffers: CreditOffer[] = [
  {
    id: 'offer-001',
    amount: 5000.00,
    interestRate: 1.8,
    term: 24,
    borrowerScore: 780,
    riskProfile: 'Médio Risco',
  },
  {
    id: 'offer-002',
    amount: 10000.00,
    interestRate: 2.2,
    term: 36,
    borrowerScore: 720,
    riskProfile: 'Médio Risco',
  },
  {
    id: 'offer-003',
    amount: 3000.00,
    interestRate: 1.5,
    term: 12,
    borrowerScore: 850,
    riskProfile: 'Baixo Risco',
  },
  {
    id: 'offer-004',
    amount: 15000.00,
    interestRate: 2.8,
    term: 48,
    borrowerScore: 680,
    riskProfile: 'Alto Risco',
  },
  {
    id: 'offer-005',
    amount: 7500.00,
    interestRate: 2.0,
    term: 24,
    borrowerScore: 760,
    riskProfile: 'Médio Risco',
  },
  {
    id: 'offer-006',
    amount: 20000.00,
    interestRate: 1.6,
    term: 36,
    borrowerScore: 820,
    riskProfile: 'Baixo Risco',
  },
  {
    id: 'offer-007',
    amount: 4500.00,
    interestRate: 3.2,
    term: 18,
    borrowerScore: 640,
    riskProfile: 'Alto Risco',
  },
  {
    id: 'offer-008',
    amount: 12000.00,
    interestRate: 1.9,
    term: 30,
    borrowerScore: 790,
    riskProfile: 'Médio Risco',
  },
  {
    id: 'offer-009',
    amount: 8000.00,
    interestRate: 1.7,
    term: 24,
    borrowerScore: 800,
    riskProfile: 'Baixo Risco',
  },
  {
    id: 'offer-010',
    amount: 6000.00,
    interestRate: 2.5,
    term: 36,
    borrowerScore: 700,
    riskProfile: 'Médio Risco',
  },
];

/**
 * Busca ofertas de crédito com filtros opcionais
 * @param filters - Filtros para aplicar na busca
 * @returns Promise com array de ofertas filtradas
 */
export async function getCreditOffers(filters?: MarketplaceFilters): Promise<CreditOffer[]> {
  // Simula latência de rede
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredOffers = [...mockOffers];

  // Aplica filtros se fornecidos
  if (filters) {
    if (filters.minAmount !== undefined) {
      filteredOffers = filteredOffers.filter(offer => offer.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filteredOffers = filteredOffers.filter(offer => offer.amount <= filters.maxAmount!);
    }
    if (filters.minInterestRate !== undefined) {
      filteredOffers = filteredOffers.filter(offer => offer.interestRate >= filters.minInterestRate!);
    }
    if (filters.maxInterestRate !== undefined) {
      filteredOffers = filteredOffers.filter(offer => offer.interestRate <= filters.maxInterestRate!);
    }
    if (filters.term !== undefined) {
      filteredOffers = filteredOffers.filter(offer => offer.term === filters.term);
    }
    if (filters.riskProfile) {
      filteredOffers = filteredOffers.filter(offer => offer.riskProfile === filters.riskProfile);
    }
  }

  // Calcula retornos mensais e totais
  return filteredOffers.map(offer => ({
    ...offer,
    monthlyReturn: (offer.amount * offer.interestRate) / 100,
    totalReturn: (offer.amount * offer.interestRate * offer.term) / 100,
  }));
}

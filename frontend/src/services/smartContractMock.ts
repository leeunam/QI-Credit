// Mock service para execução via Smart Contract
// TODO: Substituir por APIs reais quando backend estiver disponível

export interface SmartContract {
  id: string;
  title: string;
  contractAddress: string;
  totalAmount: number;
  currency: string;
  status: 'funds_held' | 'release_pending' | 'funds_released';
  executionStatus: 'approved' | 'rejected' | 'in_progress';
  createdAt: string;
  updatedAt: string;
  parties: ContractParty[];
  milestones: Milestone[];
  transactions: Transaction[];
}

export interface ContractParty {
  id: string;
  name: string;
  address: string;
  role: 'payer' | 'payee' | 'escrow';
  walletAddress: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'completed' | 'disputed';
  dueDate: string;
  completedAt?: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'release' | 'refund';
  amount: number;
  txHash: string;
  timestamp: string;
  fromAddress: string;
  toAddress: string;
  gasUsed: number;
  status: 'pending' | 'confirmed' | 'failed';
}

// Mock de dados
const mockSmartContract: SmartContract = {
  id: '1',
  title: 'Desenvolvimento de Aplicativo Web',
  contractAddress: '0x742d35Cc6734C0532925a3b8D404c4C2Fc7B2aD4',
  totalAmount: 50000,
  currency: 'BRL',
  status: 'release_pending',
  executionStatus: 'in_progress',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
  parties: [
    {
      id: '1',
      name: 'TechCorp Ltda',
      address: 'Rua das Flores, 123 - São Paulo/SP',
      role: 'payer',
      walletAddress: '0x8ba1f109551bD432803012645Hac136c22C177c9'
    },
    {
      id: '2',
      name: 'DevStudio Inc',
      address: 'Av. Paulista, 456 - São Paulo/SP', 
      role: 'payee',
      walletAddress: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db'
    },
    {
      id: '3',
      name: 'Smart Escrow Service',
      address: 'Sistema Automatizado',
      role: 'escrow',
      walletAddress: '0x742d35Cc6734C0532925a3b8D404c4C2Fc7B2aD4'
    }
  ],
  milestones: [
    {
      id: '1',
      title: 'Entrega do MVP',
      description: 'Versão mínima viável do aplicativo com funcionalidades básicas',
      amount: 20000,
      status: 'completed',
      dueDate: '2024-01-30T23:59:59Z',
      completedAt: '2024-01-28T16:45:00Z'
    },
    {
      id: '2',
      title: 'Implementação de Funcionalidades Avançadas',
      description: 'Dashboard analytics, relatórios e integrações',
      amount: 20000,
      status: 'pending',
      dueDate: '2024-02-15T23:59:59Z'
    },
    {
      id: '3',
      title: 'Entrega Final e Deploy',
      description: 'Aplicação completa, testes e deploy em produção',
      amount: 10000,
      status: 'pending',
      dueDate: '2024-02-28T23:59:59Z'
    }
  ],
  transactions: [
    {
      id: '1',
      type: 'deposit',
      amount: 50000,
      txHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
      timestamp: '2024-01-15T10:30:00Z',
      fromAddress: '0x8ba1f109551bD432803012645Hac136c22C177c9',
      toAddress: '0x742d35Cc6734C0532925a3b8D404c4C2Fc7B2aD4',
      gasUsed: 21000,
      status: 'confirmed'
    },
    {
      id: '2', 
      type: 'release',
      amount: 20000,
      txHash: '0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567a',
      timestamp: '2024-01-28T17:00:00Z',
      fromAddress: '0x742d35Cc6734C0532925a3b8D404c4C2Fc7B2aD4',
      toAddress: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
      gasUsed: 25000,
      status: 'confirmed'
    }
  ]
};

// Simulação de APIs
export const smartContractService = {
  // GET /api/smart-contracts/:id
  async getSmartContract(id: string): Promise<SmartContract> {
    await delay(1000); // Simula latência da rede
    return { ...mockSmartContract, id };
  },

  // POST /api/smart-contracts/:id/approve-milestone
  async approveMilestone(contractId: string, milestoneId: string): Promise<SmartContract> {
    await delay(1500);
    
    const contract = { ...mockSmartContract };
    contract.milestones = contract.milestones.map(milestone => 
      milestone.id === milestoneId 
        ? { ...milestone, status: 'completed' as const, completedAt: new Date().toISOString() }
        : milestone
    );
    
    // Simula mudança de status baseado nos milestones
    const completedMilestones = contract.milestones.filter(m => m.status === 'completed');
    if (completedMilestones.length === contract.milestones.length) {
      contract.status = 'funds_released';
      contract.executionStatus = 'approved';
    } else {
      contract.status = 'release_pending';
      contract.executionStatus = 'in_progress';
    }
    
    contract.updatedAt = new Date().toISOString();
    return contract;
  },

  // POST /api/smart-contracts/:id/reject-milestone
  async rejectMilestone(contractId: string, milestoneId: string, reason: string): Promise<SmartContract> {
    await delay(1200);
    
    const contract = { ...mockSmartContract };
    contract.milestones = contract.milestones.map(milestone => 
      milestone.id === milestoneId 
        ? { ...milestone, status: 'disputed' as const }
        : milestone
    );
    
    contract.executionStatus = 'rejected';
    contract.status = 'funds_held';
    contract.updatedAt = new Date().toISOString();
    return contract;
  },

  // POST /api/smart-contracts/:id/release-funds
  async releaseFunds(contractId: string): Promise<SmartContract> {
    await delay(2000);
    
    const contract = { ...mockSmartContract };
    contract.status = 'funds_released';
    contract.executionStatus = 'approved';
    contract.updatedAt = new Date().toISOString();
    
    // Adiciona transação de liberação
    const releaseTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'release',
      amount: contract.totalAmount,
      txHash: '0x' + Math.random().toString(16).substring(2, 66),
      timestamp: new Date().toISOString(),
      fromAddress: contract.parties.find(p => p.role === 'escrow')?.walletAddress || '',
      toAddress: contract.parties.find(p => p.role === 'payee')?.walletAddress || '',
      gasUsed: Math.floor(Math.random() * 50000) + 21000,
      status: 'confirmed'
    };
    
    contract.transactions.push(releaseTransaction);
    return contract;
  },

  // GET /api/smart-contracts/:id/real-time-status
  async getRealTimeStatus(id: string): Promise<{ status: string; lastUpdate: string }> {
    await delay(300);
    return {
      status: mockSmartContract.status,
      lastUpdate: new Date().toISOString()
    };
  }
};

// Utility para simular delay de rede
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* 
DOCUMENTAÇÃO PARA INTEGRAÇÃO COM API REAL:

1. GET /api/smart-contracts/:id
   - Retorna: SmartContract object
   - Headers: Authorization: Bearer <token>

2. POST /api/smart-contracts/:id/approve-milestone
   - Body: { milestoneId: string }
   - Retorna: SmartContract updated
   - Headers: Authorization: Bearer <token>

3. POST /api/smart-contracts/:id/reject-milestone
   - Body: { milestoneId: string, reason: string }
   - Retorna: SmartContract updated
   - Headers: Authorization: Bearer <token>

4. POST /api/smart-contracts/:id/release-funds
   - Body: { amount?: number } (opcional para liberação parcial)
   - Retorna: SmartContract updated
   - Headers: Authorization: Bearer <token>

5. GET /api/smart-contracts/:id/real-time-status
   - Retorna: { status: string, lastUpdate: string }
   - Headers: Authorization: Bearer <token>
   - Recomendação: usar WebSocket para updates em tempo real

6. Autenticação e Blockchain:
   - Implementar conexão com MetaMask/WalletConnect
   - Validar assinaturas de transações
   - Monitorar eventos do smart contract
   - Implementar fallback para RPC nodes
*/
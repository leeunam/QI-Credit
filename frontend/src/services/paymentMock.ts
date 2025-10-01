// Mock service for payment functionality
// TODO: Replace with real API calls when backend is ready

export interface Installment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'anticipated';
  paymentDate?: string;
  anticipationDiscount?: number;
}

export interface PaymentContract {
  id: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  installments: Installment[];
  createdAt: string;
}

export interface PaymentHistory {
  id: string;
  installmentId: string;
  amount: number;
  paymentDate: string;
  method: string;
  transactionId: string;
  type: 'payment' | 'anticipation';
}

// Mock data
const mockPaymentContracts: PaymentContract[] = [
  {
    id: "payment-001",
    title: "Contrato de Desenvolvimento de Software",
    totalAmount: 50000,
    paidAmount: 20000,
    remainingAmount: 30000,
    installments: [
      {
        id: "inst-001",
        installmentNumber: 1,
        amount: 10000,
        dueDate: "2024-01-15",
        status: "paid",
        paymentDate: "2024-01-10"
      },
      {
        id: "inst-002",
        installmentNumber: 2,
        amount: 10000,
        dueDate: "2024-02-15",
        status: "paid",
        paymentDate: "2024-02-12"
      },
      {
        id: "inst-003",
        installmentNumber: 3,
        amount: 10000,
        dueDate: "2024-03-15",
        status: "pending",
        anticipationDiscount: 150
      },
      {
        id: "inst-004",
        installmentNumber: 4,
        amount: 10000,
        dueDate: "2024-04-15",
        status: "pending",
        anticipationDiscount: 300
      },
      {
        id: "inst-005",
        installmentNumber: 5,
        amount: 10000,
        dueDate: "2024-05-15",
        status: "pending",
        anticipationDiscount: 450
      }
    ],
    createdAt: "2024-01-01"
  }
];

const mockPaymentHistory: PaymentHistory[] = [
  {
    id: "hist-001",
    installmentId: "inst-001",
    amount: 10000,
    paymentDate: "2024-01-10",
    method: "PIX",
    transactionId: "TXN-001-2024",
    type: "payment"
  },
  {
    id: "hist-002",
    installmentId: "inst-002",
    amount: 10000,
    paymentDate: "2024-02-12",
    method: "Transferência Bancária",
    transactionId: "TXN-002-2024",
    type: "payment"
  }
];

// API functions
export const getPaymentContract = async (id: string): Promise<PaymentContract | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const contract = mockPaymentContracts.find(c => c.id === id);
  return contract || null;
};

export const getPaymentHistory = async (contractId: string): Promise<PaymentHistory[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return mockPaymentHistory;
};

export const payInstallment = async (installmentId: string, method: string): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate success/failure
  const success = Math.random() > 0.1; // 90% success rate
  
  if (success) {
    return {
      success: true,
      transactionId: `TXN-${Date.now()}`
    };
  } else {
    return {
      success: false,
      error: "Falha no processamento do pagamento. Tente novamente."
    };
  }
};

export const anticipateInstallment = async (installmentId: string): Promise<{ success: boolean; transactionId?: string; discount?: number; error?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate success/failure
  const success = Math.random() > 0.05; // 95% success rate
  
  if (success) {
    const installment = mockPaymentContracts[0].installments.find(i => i.id === installmentId);
    return {
      success: true,
      transactionId: `ANT-${Date.now()}`,
      discount: installment?.anticipationDiscount || 0
    };
  } else {
    return {
      success: false,
      error: "Falha na antecipação. Tente novamente."
    };
  }
};

export const getAvailablePaymentMethods = async (): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return ["PIX", "Transferência Bancária", "Cartão de Crédito", "Boleto"];
};
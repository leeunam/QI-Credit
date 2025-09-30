import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  addMoney: (amount: number, description?: string) => Promise<boolean>;
  withdrawMoney: (amount: number, description?: string) => Promise<boolean>;
  transferMoney: (amount: number, recipient: string, description?: string) => Promise<boolean>;
  isLoading: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Mock transactions database
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 1000,
    description: 'Depósito inicial',
    date: '2024-01-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: '2',
    type: 'payment',
    amount: -25.50,
    description: 'Pagamento - Café Central',
    date: '2024-01-14T15:45:00Z',
    status: 'completed'
  },
  {
    id: '3',
    type: 'transfer',
    amount: -100,
    description: 'Transferência para João Silva',
    date: '2024-01-13T09:20:00Z',
    status: 'completed'
  },
  {
    id: '4',
    type: 'deposit',
    amount: 500,
    description: 'Recarga via PIX',
    date: '2024-01-12T14:15:00Z',
    status: 'completed'
  },
  {
    id: '5',
    type: 'payment',
    amount: -75.80,
    description: 'Compra online - Loja ABC',
    date: '2024-01-11T18:30:00Z',
    status: 'completed'
  }
];

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState(1298.70); // Initial mock balance
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isLoading, setIsLoading] = useState(false);

  const addMoney = async (amount: number, description: string = 'Depósito'): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'deposit',
        amount: amount,
        description,
        date: new Date().toISOString(),
        status: 'completed'
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setBalance(prev => prev + amount);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const withdrawMoney = async (amount: number, description: string = 'Saque'): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (balance < amount) {
      setIsLoading(false);
      return false; // Insufficient funds
    }
    
    try {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'withdrawal',
        amount: -amount,
        description,
        date: new Date().toISOString(),
        status: 'completed'
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setBalance(prev => prev - amount);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const transferMoney = async (amount: number, recipient: string, description?: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (balance < amount) {
      setIsLoading(false);
      return false; // Insufficient funds
    }
    
    try {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: 'transfer',
        amount: -amount,
        description: description || `Transferência para ${recipient}`,
        date: new Date().toISOString(),
        status: 'completed'
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      setBalance(prev => prev - amount);
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  return (
    <WalletContext.Provider value={{ 
      balance, 
      transactions, 
      addMoney, 
      withdrawMoney, 
      transferMoney, 
      isLoading 
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
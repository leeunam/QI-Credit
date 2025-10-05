import { createContext, useContext, useState, ReactNode } from 'react';

export interface CreditApplication {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  amount: number;
  term: number;
  purpose: string;
  personalInfo: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
    birthDate: string;
    maritalStatus: string;
  };
  financialInfo: {
    monthlyIncome: number;
    employmentType: string;
    companyName: string;
    workTime: string;
    monthlyExpenses: number;
  };
  documents: {
    id: string;
    rg: string;
    cpf: string;
    incomeProof: string;
    bankStatement: string;
  };
  createdAt: string;
  interestRate?: number;
  monthlyPayment?: number;
}

interface CreditContextType {
  applications: CreditApplication[];
  currentApplication: Partial<CreditApplication> | null;
  submitApplication: (application: Omit<CreditApplication, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
  updateCurrentApplication: (data: Partial<CreditApplication>) => void;
  clearCurrentApplication: () => void;
  isLoading: boolean;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

// Mock applications database
const mockApplications: CreditApplication[] = [
  {
    id: '1',
    status: 'approved',
    amount: 50000,
    term: 24,
    purpose: 'Reforma da casa',
    personalInfo: {
      name: 'João Silva',
      cpf: '123.456.789-00',
      email: 'joao@example.com',
      phone: '(11) 99999-9999',
      birthDate: '1990-01-01',
      maritalStatus: 'casado'
    },
    financialInfo: {
      monthlyIncome: 8000,
      employmentType: 'clt',
      companyName: 'Empresa XYZ',
      workTime: '3 anos',
      monthlyExpenses: 4000
    },
    documents: {
      id: 'doc1.pdf',
      rg: 'doc2.pdf',
      cpf: 'doc3.pdf',
      incomeProof: 'doc4.pdf',
      bankStatement: 'doc5.pdf'
    },
    createdAt: '2024-01-15',
    interestRate: 2.5,
    monthlyPayment: 2287.5
  }
];

export const CreditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<CreditApplication[]>(mockApplications);
  const [currentApplication, setCurrentApplication] = useState<Partial<CreditApplication> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submitApplication = async (applicationData: Omit<CreditApplication, 'id' | 'status' | 'createdAt'>): Promise<boolean> => {
    setIsLoading(true);
    
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock credit analysis - approve if income > 5000 and amount < income * 10
    const { financialInfo, amount } = applicationData;
    const isApproved = financialInfo.monthlyIncome >= 5000 && amount <= financialInfo.monthlyIncome * 10;
    
    const newApplication: CreditApplication = {
      ...applicationData,
      id: Date.now().toString(),
      status: isApproved ? 'approved' : 'under_review',
      createdAt: new Date().toISOString().split('T')[0],
      interestRate: isApproved ? 2.5 : undefined,
      monthlyPayment: isApproved ? (amount * (1 + (2.5 / 100))) / applicationData.term : undefined
    };
    
    setApplications(prev => [newApplication, ...prev]);
    setCurrentApplication(null);
    setIsLoading(false);
    
    return true;
  };

  const updateCurrentApplication = (data: Partial<CreditApplication>) => {
    setCurrentApplication(prev => ({ ...prev, ...data }));
  };

  const clearCurrentApplication = () => {
    setCurrentApplication(null);
  };

  return (
    <CreditContext.Provider value={{
      applications,
      currentApplication,
      submitApplication,
      updateCurrentApplication,
      clearCurrentApplication,
      isLoading
    }}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredit = () => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredit must be used within a CreditProvider');
  }
  return context;
};
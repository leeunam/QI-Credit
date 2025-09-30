// Mock service para contratos digitais
// TODO: Substituir por APIs reais quando backend estiver disponível

export interface Contract {
  id: string;
  title: string;
  content: string;
  parties: ContractParty[];
  status: 'draft' | 'pending' | 'signed' | 'expired';
  createdAt: string;
  expiresAt: string;
  signatures: Signature[];
}

export interface ContractParty {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: 'contractor' | 'contractee';
  signed: boolean;
}

export interface Signature {
  partyId: string;
  signedAt: string;
  ipAddress: string;
  signatureData: string; // Base64 da assinatura
}

// Mock de dados
const mockContract: Contract = {
  id: '1',
  title: 'Contrato de Prestação de Serviços Digitais',
  content: `
CONTRATO DE PRESTAÇÃO DE SERVIÇOS DIGITAIS

1. OBJETO
O presente contrato tem por objeto a prestação de serviços digitais conforme especificações técnicas em anexo.

2. PRAZO
O prazo de vigência deste contrato é de 12 (doze) meses, iniciando-se na data de assinatura.

3. VALOR
O valor total dos serviços é de R$ 50.000,00 (cinquenta mil reais), a ser pago conforme cronograma estabelecido.

4. RESPONSABILIDADES DO CONTRATANTE
- Fornecer informações necessárias para execução dos serviços
- Efetuar pagamentos nas datas estabelecidas
- Disponibilizar ambiente adequado para desenvolvimento

5. RESPONSABILIDADES DO CONTRATADO
- Executar os serviços com qualidade e dentro dos prazos
- Manter confidencialidade das informações
- Fornecer suporte técnico durante a vigência

6. RESCISÃO
O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 30 dias.

7. FORO
Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer questões oriundas deste contrato.
  `,
  parties: [
    {
      id: '1',
      name: 'João Silva Santos',
      email: 'joao.silva@empresa.com',
      cpf: '123.456.789-00',
      role: 'contractor',
      signed: false
    },
    {
      id: '2',
      name: 'Maria Oliveira Costa',
      email: 'maria.oliveira@cliente.com',
      cpf: '987.654.321-00',
      role: 'contractee',
      signed: false
    }
  ],
  status: 'pending',
  createdAt: '2024-01-15T10:00:00Z',
  expiresAt: '2024-02-15T23:59:59Z',
  signatures: []
};

// Simulação de APIs
export const contractService = {
  // GET /api/contracts/:id
  async getContract(id: string): Promise<Contract> {
    await delay(800); // Simula latência da rede
    return { ...mockContract, id };
  },

  // POST /api/contracts/:id/sign
  async signContract(contractId: string, partyId: string, signatureData: string): Promise<Contract> {
    await delay(1200);
    
    const contract = { ...mockContract };
    const signature: Signature = {
      partyId,
      signedAt: new Date().toISOString(),
      ipAddress: '192.168.1.100', // Mock IP
      signatureData
    };
    
    contract.signatures.push(signature);
    contract.parties = contract.parties.map(party => 
      party.id === partyId ? { ...party, signed: true } : party
    );
    
    // Se todas as partes assinaram, marca como signed
    const allSigned = contract.parties.every(party => party.signed);
    if (allSigned) {
      contract.status = 'signed';
    }
    
    return contract;
  },

  // GET /api/contracts/:id/download
  async downloadContract(id: string): Promise<Blob> {
    await delay(500);
    // Mock de PDF - na API real retornaria um blob do PDF gerado
    const pdfContent = 'Mock PDF content for contract ' + id;
    return new Blob([pdfContent], { type: 'application/pdf' });
  },

  // POST /api/contracts/:id/validate
  async validateSignatures(id: string): Promise<{ valid: boolean; details: string[] }> {
    await delay(600);
    return {
      valid: true,
      details: [
        'Todas as assinaturas são válidas',
        'Certificados digitais verificados',
        'Timestamps consistentes'
      ]
    };
  }
};

// Utility para simular delay de rede
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* 
DOCUMENTAÇÃO PARA INTEGRAÇÃO COM API REAL:

1. GET /api/contracts/:id
   - Retorna: Contract object
   - Headers: Authorization: Bearer <token>

2. POST /api/contracts/:id/sign
   - Body: { partyId: string, signatureData: string }
   - Retorna: Contract updated
   - Headers: Authorization: Bearer <token>

3. GET /api/contracts/:id/download
   - Retorna: PDF blob
   - Headers: Authorization: Bearer <token>

4. POST /api/contracts/:id/validate
   - Retorna: { valid: boolean, details: string[] }
   - Headers: Authorization: Bearer <token>

5. Autenticação:
   - Implementar JWT token management
   - Refresh token quando necessário
   - Logout em caso de 401
*/
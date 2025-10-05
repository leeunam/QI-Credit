import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCredit } from '../../contexts/CreditContext';
import { Separator } from '@/components/ui/separator';
import { CheckCircle } from 'lucide-react';

interface ReviewSubmitProps {
  onSubmit: () => void;
}

export const ReviewSubmit: React.FC<ReviewSubmitProps> = ({ onSubmit }) => {
  const { currentApplication, isLoading } = useCredit();

  if (!currentApplication) return null;

  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getEmploymentTypeLabel = (type?: string) => {
    const types: { [key: string]: string } = {
      'clt': 'CLT',
      'pj': 'Pessoa Jurídica',
      'autonomo': 'Autônomo',
      'funcionario_publico': 'Funcionário Público',
      'aposentado': 'Aposentado',
      'outros': 'Outros'
    };
    return types[type || ''] || type;
  };

  const getMaritalStatusLabel = (status?: string) => {
    const statuses: { [key: string]: string } = {
      'solteiro': 'Solteiro(a)',
      'casado': 'Casado(a)',
      'divorciado': 'Divorciado(a)',
      'viuvo': 'Viúvo(a)',
      'uniao_estavel': 'União Estável'
    };
    return statuses[status || ''] || status;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-h3">Revisão da Solicitação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-body-2 font-semibold mb-3">Informações Pessoais</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-3">
              <div>
                <span className="text-muted-foreground">Nome:</span>
                <p className="font-medium">{currentApplication.personalInfo?.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">CPF:</span>
                <p className="font-medium">{currentApplication.personalInfo?.cpf}</p>
              </div>
              <div>
                <span className="text-muted-foreground">E-mail:</span>
                <p className="font-medium">{currentApplication.personalInfo?.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Telefone:</span>
                <p className="font-medium">{currentApplication.personalInfo?.phone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Estado Civil:</span>
                <p className="font-medium">{getMaritalStatusLabel(currentApplication.personalInfo?.maritalStatus)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div>
            <h4 className="text-body-2 font-semibold mb-3">Informações Financeiras</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-3">
              <div>
                <span className="text-muted-foreground">Renda Mensal:</span>
                <p className="font-medium">{formatCurrency(currentApplication.financialInfo?.monthlyIncome)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Gastos Mensais:</span>
                <p className="font-medium">{formatCurrency(currentApplication.financialInfo?.monthlyExpenses)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo de Emprego:</span>
                <p className="font-medium">{getEmploymentTypeLabel(currentApplication.financialInfo?.employmentType)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Empresa:</span>
                <p className="font-medium">{currentApplication.financialInfo?.companyName}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Loan Details */}
          <div>
            <h4 className="text-body-2 font-semibold mb-3">Detalhes do Empréstimo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-3">
              <div>
                <span className="text-muted-foreground">Valor Solicitado:</span>
                <p className="font-medium text-primary">{formatCurrency(currentApplication.amount)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Prazo:</span>
                <p className="font-medium">{currentApplication.term} meses</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-muted-foreground">Finalidade:</span>
                <p className="font-medium">{currentApplication.purpose}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Documents */}
          <div>
            <h4 className="text-body-2 font-semibold mb-3">Documentos Enviados</h4>
            <div className="space-y-2">
              {Object.entries(currentApplication.documents || {}).map(([key, value]) => (
                value && (
                  <div key={key} className="flex items-center gap-2 text-body-3">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span>{value}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onSubmit}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Enviando Solicitação...' : 'Enviar Solicitação'}
        </Button>
      </div>

      <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
        <p className="text-body-4 text-muted-foreground">
          Ao enviar esta solicitação, você declara que todas as informações fornecidas são verdadeiras 
          e aceita os termos e condições da nossa política de crédito.
        </p>
      </div>
    </div>
  );
};
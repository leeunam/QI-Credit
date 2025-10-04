import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCredit } from '../../contexts/CreditContext';

export const LoanDetailsForm: React.FC = () => {
  const { currentApplication, updateCurrentApplication } = useCredit();

  const handleInputChange = (field: string, value: string | number) => {
    updateCurrentApplication({
      [field]: value
    });
  };

  const calculateEstimate = () => {
    const amount = currentApplication?.amount || 0;
    const term = currentApplication?.term || 12;
    const interestRate = 2.5; // 2.5% monthly
    
    if (amount && term) {
      const monthlyPayment = (amount * (1 + (interestRate / 100))) / term;
      return {
        monthlyPayment: monthlyPayment.toFixed(2),
        totalAmount: (monthlyPayment * term).toFixed(2)
      };
    }
    return null;
  };

  const estimate = calculateEstimate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">Detalhes do Empréstimo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-body-3 font-medium">Valor Solicitado (R$)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="10000"
              value={currentApplication?.amount || ''}
              onChange={(e) => handleInputChange('amount', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="term" className="text-body-3 font-medium">Prazo (meses)</Label>
            <Select 
              value={currentApplication?.term?.toString() || ''} 
              onValueChange={(value) => handleInputChange('term', Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o prazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 meses</SelectItem>
                <SelectItem value="18">18 meses</SelectItem>
                <SelectItem value="24">24 meses</SelectItem>
                <SelectItem value="36">36 meses</SelectItem>
                <SelectItem value="48">48 meses</SelectItem>
                <SelectItem value="60">60 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose" className="text-body-3 font-medium">Finalidade do Empréstimo</Label>
          <Textarea
            id="purpose"
            placeholder="Descreva para que você utilizará o empréstimo..."
            value={currentApplication?.purpose || ''}
            onChange={(e) => handleInputChange('purpose', e.target.value)}
            rows={3}
          />
        </div>

        {estimate && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="text-body-2 font-semibold text-primary mb-2">Simulação do Empréstimo</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-body-4 text-muted-foreground">Parcela Mensal</p>
                <p className="text-body-1 font-semibold text-primary">R$ {estimate.monthlyPayment}</p>
              </div>
              <div>
                <p className="text-body-4 text-muted-foreground">Total a Pagar</p>
                <p className="text-body-1 font-semibold text-primary">R$ {estimate.totalAmount}</p>
              </div>
            </div>
            <p className="text-body-4 text-muted-foreground mt-2">
              * Taxa de juros estimada: 2,5% ao mês. Valores sujeitos à análise de crédito.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
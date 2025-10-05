import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCredit } from '../../contexts/CreditContext';

export const FinancialInfoForm: React.FC = () => {
  const { currentApplication, updateCurrentApplication } = useCredit();

  const handleInputChange = (field: string, value: string | number) => {
    updateCurrentApplication({
      financialInfo: {
        ...currentApplication?.financialInfo,
        [field]: value
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">Informações Financeiras</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome" className="text-body-3 font-medium">Renda Mensal</Label>
            <Input
              id="monthlyIncome"
              type="number"
              placeholder="5000"
              value={currentApplication?.financialInfo?.monthlyIncome || ''}
              onChange={(e) => handleInputChange('monthlyIncome', Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyExpenses" className="text-body-3 font-medium">Gastos Mensais</Label>
            <Input
              id="monthlyExpenses"
              type="number"
              placeholder="2000"
              value={currentApplication?.financialInfo?.monthlyExpenses || ''}
              onChange={(e) => handleInputChange('monthlyExpenses', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employmentType" className="text-body-3 font-medium">Tipo de Emprego</Label>
            <Select 
              value={currentApplication?.financialInfo?.employmentType || ''} 
              onValueChange={(value) => handleInputChange('employmentType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de emprego" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clt">CLT</SelectItem>
                <SelectItem value="pj">Pessoa Jurídica</SelectItem>
                <SelectItem value="autonomo">Autônomo</SelectItem>
                <SelectItem value="funcionario_publico">Funcionário Público</SelectItem>
                <SelectItem value="aposentado">Aposentado</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workTime" className="text-body-3 font-medium">Tempo no Emprego</Label>
            <Select 
              value={currentApplication?.financialInfo?.workTime || ''} 
              onValueChange={(value) => handleInputChange('workTime', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tempo no emprego" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="menos_6_meses">Menos de 6 meses</SelectItem>
                <SelectItem value="6_12_meses">6 a 12 meses</SelectItem>
                <SelectItem value="1_2_anos">1 a 2 anos</SelectItem>
                <SelectItem value="2_5_anos">2 a 5 anos</SelectItem>
                <SelectItem value="mais_5_anos">Mais de 5 anos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-body-3 font-medium">Nome da Empresa</Label>
          <Input
            id="companyName"
            placeholder="Digite o nome da empresa"
            value={currentApplication?.financialInfo?.companyName || ''}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
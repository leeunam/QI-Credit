import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCredit } from '../../contexts/CreditContext';

export const PersonalInfoForm: React.FC = () => {
  const { currentApplication, updateCurrentApplication } = useCredit();

  const handleInputChange = (field: string, value: string) => {
    updateCurrentApplication({
      personalInfo: {
        ...currentApplication?.personalInfo,
        [field]: value
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">Informações Pessoais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-body-3 font-medium">Nome Completo</Label>
            <Input
              id="name"
              placeholder="Digite seu nome completo"
              value={currentApplication?.personalInfo?.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-body-3 font-medium">CPF</Label>
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={currentApplication?.personalInfo?.cpf || ''}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-body-3 font-medium">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={currentApplication?.personalInfo?.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-body-3 font-medium">Telefone</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={currentApplication?.personalInfo?.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-body-3 font-medium">Data de Nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              value={currentApplication?.personalInfo?.birthDate || ''}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maritalStatus" className="text-body-3 font-medium">Estado Civil</Label>
            <Select 
              value={currentApplication?.personalInfo?.maritalStatus || ''} 
              onValueChange={(value) => handleInputChange('maritalStatus', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu estado civil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                <SelectItem value="casado">Casado(a)</SelectItem>
                <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                <SelectItem value="uniao_estavel">União Estável</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
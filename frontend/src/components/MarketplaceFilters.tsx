import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';
import type { MarketplaceFilters as FilterType } from '@/services/marketplaceService';

interface MarketplaceFiltersProps {
  onFilterChange: (filters: FilterType) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
}

export function MarketplaceFilters({ onFilterChange, onClearFilters, isMobile = false }: MarketplaceFiltersProps) {
  const [minAmount, setMinAmount] = useState<number>(0);
  const [maxAmount, setMaxAmount] = useState<number>(25000);
  const [minRate, setMinRate] = useState<number>(1.0);
  const [maxRate, setMaxRate] = useState<number>(4.0);
  const [term, setTerm] = useState<string>('');
  const [riskProfile, setRiskProfile] = useState<string>('');

  const handleApplyFilters = () => {
    const filters: FilterType = {
      minAmount: minAmount > 0 ? minAmount : undefined,
      maxAmount: maxAmount < 25000 ? maxAmount : undefined,
      minInterestRate: minRate > 1.0 ? minRate : undefined,
      maxInterestRate: maxRate < 4.0 ? maxRate : undefined,
      term: term ? parseInt(term) : undefined,
      riskProfile: riskProfile || undefined,
    };
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setMinAmount(0);
    setMaxAmount(25000);
    setMinRate(1.0);
    setMaxRate(4.0);
    setTerm('');
    setRiskProfile('');
    onClearFilters();
  };

  return (
    <Card className="p-6 border border-border bg-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="text-heading-3 text-card-foreground">Filtros</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 mr-1" />
          Limpar
        </Button>
      </div>

      <div className="space-y-6">
        {/* Valor do Investimento */}
        <div className="space-y-3">
          <Label className="text-body-3 font-semibold text-card-foreground">
            Valor do Investimento
          </Label>
          <div className="space-y-4">
            <Slider
              value={[minAmount, maxAmount]}
              onValueChange={(values) => {
                if (Array.isArray(values) && values.length === 2) {
                  setMinAmount(values[0]);
                  setMaxAmount(values[1]);
                }
              }}
              min={0}
              max={25000}
              step={500}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">Mínimo</Label>
                <Input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  placeholder="R$ 0"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Máximo</Label>
                <Input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(Number(e.target.value))}
                  placeholder="R$ 25.000"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Taxa de Juros */}
        <div className="space-y-3">
          <Label className="text-body-3 font-semibold text-card-foreground">
            Taxa de Juros (% a.m.)
          </Label>
          <div className="space-y-4">
            <Slider
              value={[minRate, maxRate]}
              onValueChange={(values) => {
                if (Array.isArray(values) && values.length === 2) {
                  setMinRate(values[0]);
                  setMaxRate(values[1]);
                }
              }}
              min={1.0}
              max={4.0}
              step={0.1}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">Mínima</Label>
                <Input
                  type="number"
                  value={minRate}
                  onChange={(e) => setMinRate(Number(e.target.value))}
                  placeholder="1.0%"
                  step="0.1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Máxima</Label>
                <Input
                  type="number"
                  value={maxRate}
                  onChange={(e) => setMaxRate(Number(e.target.value))}
                  placeholder="4.0%"
                  step="0.1"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Prazo */}
        <div className="space-y-3">
          <Label className="text-body-3 font-semibold text-card-foreground">
            Prazo
          </Label>
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os prazos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os prazos</SelectItem>
              <SelectItem value="12">12 meses</SelectItem>
              <SelectItem value="18">18 meses</SelectItem>
              <SelectItem value="24">24 meses</SelectItem>
              <SelectItem value="30">30 meses</SelectItem>
              <SelectItem value="36">36 meses</SelectItem>
              <SelectItem value="48">48 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Perfil de Risco */}
        <div className="space-y-3">
          <Label className="text-body-3 font-semibold text-card-foreground">
            Perfil de Risco
          </Label>
          <Select value={riskProfile} onValueChange={setRiskProfile}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os perfis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os perfis</SelectItem>
              <SelectItem value="Baixo Risco">Baixo Risco</SelectItem>
              <SelectItem value="Médio Risco">Médio Risco</SelectItem>
              <SelectItem value="Alto Risco">Alto Risco</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botão Aplicar */}
        <Button
          onClick={handleApplyFilters}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Aplicar Filtros
        </Button>
      </div>
    </Card>
  );
}

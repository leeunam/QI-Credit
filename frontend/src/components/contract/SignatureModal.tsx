import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, RotateCcw, PenTool } from 'lucide-react';
import { ContractParty } from '../../services/contractMock';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signatureData: string, partyId: string) => void;
  parties: ContractParty[];
  isLoading?: boolean;
}

export const SignatureModal = ({ isOpen, onClose, onSign, parties, isLoading = false }: SignatureModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [selectedParty, setSelectedParty] = useState<string>('');

  useEffect(() => {
    if (isOpen && parties.length > 0) {
      // Seleciona automaticamente a primeira parte não assinada
      const firstUnsigned = parties.find(party => !party.signed);
      if (firstUnsigned) {
        setSelectedParty(firstUnsigned.id);
      }
    }
  }, [isOpen, parties]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = () => {
    if (!hasSignature || !selectedParty) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL();
    onSign(signatureData, selectedParty);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurações do canvas
    ctx.strokeStyle = '#2952CC';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Limpa o canvas quando o modal abre
    if (isOpen) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  }, [isOpen]);

  const selectedPartyData = parties.find(party => party.id === selectedParty);
  const unsignedParties = parties.filter(party => !party.signed);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-h3 font-display">Assinatura Digital</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de Parte */}
          {unsignedParties.length > 1 && (
            <Card className="card-base">
              <h3 className="text-h4 font-display mb-3">Selecione quem está assinando</h3>
              <div className="space-y-2">
                {unsignedParties.map((party) => (
                  <label
                    key={party.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedParty === party.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="party"
                      value={party.id}
                      checked={selectedParty === party.id}
                      onChange={(e) => setSelectedParty(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <h4 className="text-body-2 font-semibold">{party.name}</h4>
                      <p className="text-body-4 text-muted-foreground">{party.email}</p>
                      <Badge variant="outline" className="mt-1">
                        {party.role === 'contractor' ? 'Contratante' : 'Contratado'}
                      </Badge>
                    </div>
                    {selectedParty === party.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </label>
                ))}
              </div>
            </Card>
          )}

          {/* Dados da Parte Selecionada */}
          {selectedPartyData && (
            <Card className="card-base">
              <h3 className="text-h4 font-display mb-3">Dados do Assinante</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-body-4 text-muted-foreground">Nome</p>
                  <p className="text-body-2 font-semibold">{selectedPartyData.name}</p>
                </div>
                <div>
                  <p className="text-body-4 text-muted-foreground">Email</p>
                  <p className="text-body-2">{selectedPartyData.email}</p>
                </div>
                <div>
                  <p className="text-body-4 text-muted-foreground">CPF</p>
                  <p className="text-body-2">{selectedPartyData.cpf}</p>
                </div>
                <div>
                  <p className="text-body-4 text-muted-foreground">Função</p>
                  <p className="text-body-2">
                    {selectedPartyData.role === 'contractor' ? 'Contratante' : 'Contratado'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Separator />

          {/* Área de Assinatura */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-h4 font-display">Desenhe sua assinatura</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSignature}
                disabled={!hasSignature}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            </div>

            <div className="border-2 border-dashed border-primary/30 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full h-48 border border-border rounded-lg cursor-crosshair bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <div className="flex items-center justify-center mt-2 text-muted-foreground">
                <PenTool className="h-4 w-4 mr-2" />
                <span className="text-body-4">Clique e arraste para desenhar sua assinatura</span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSign}
              disabled={!hasSignature || !selectedParty || isLoading}
              className="btn-primary flex-1"
            >
              {isLoading ? 'Processando...' : 'Confirmar Assinatura'}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
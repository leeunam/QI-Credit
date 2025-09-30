import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, CheckCircle, Clock, Users } from 'lucide-react';
import { Contract } from '../../services/contractMock';

interface ContractViewerProps {
  contract: Contract;
  onSignRequest: () => void;
  onDownload: () => void;
}

export const ContractViewer = ({ contract, onSignRequest, onDownload }: ContractViewerProps) => {
  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'bg-tertiary';
      case 'pending': return 'bg-warning';
      case 'signed': return 'bg-success';
      case 'expired': return 'bg-error';
      default: return 'bg-tertiary';
    }
  };

  const getStatusText = (status: Contract['status']) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'pending': return 'Aguardando Assinaturas';
      case 'signed': return 'Assinado';
      case 'expired': return 'Expirado';
      default: return 'Desconhecido';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const signedCount = contract.parties.filter(party => party.signed).length;
  const totalParties = contract.parties.length;

  return (
    <div className="space-y-6">
      {/* Header do Contrato */}
      <Card className="card-base">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-h3 font-display text-foreground">{contract.title}</h1>
              <p className="text-body-4 text-muted-foreground">ID: {contract.id}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(contract.status)} text-white`}>
            {getStatusText(contract.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-body-4 text-muted-foreground">Criado em</p>
              <p className="text-body-3 font-medium">{formatDate(contract.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-body-4 text-muted-foreground">Expira em</p>
              <p className="text-body-3 font-medium">{formatDate(contract.expiresAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-body-4 text-muted-foreground">Assinaturas</p>
              <p className="text-body-3 font-medium">{signedCount}/{totalParties}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={onSignRequest}
            className="btn-primary"
            disabled={contract.status === 'signed' || contract.status === 'expired'}
          >
            Assinar Contrato
          </Button>
          <Button 
            variant="outline" 
            onClick={onDownload}
            className="btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </Card>

      {/* Partes do Contrato */}
      <Card className="card-base">
        <h2 className="text-h4 font-display mb-4">Partes do Contrato</h2>
        <div className="space-y-3">
          {contract.parties.map((party) => (
            <div key={party.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <h3 className="text-body-2 font-semibold">{party.name}</h3>
                <p className="text-body-4 text-muted-foreground">{party.email}</p>
                <p className="text-body-4 text-muted-foreground">CPF: {party.cpf}</p>
                <Badge variant="outline" className="mt-1">
                  {party.role === 'contractor' ? 'Contratante' : 'Contratado'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {party.signed ? (
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-body-4 font-medium">Assinado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-warning">
                    <Clock className="h-5 w-5" />
                    <span className="text-body-4 font-medium">Pendente</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Conteúdo do Contrato */}
      <Card className="card-base">
        <h2 className="text-h4 font-display mb-4">Conteúdo do Contrato</h2>
        <ScrollArea className="h-96 w-full border rounded-lg p-4">
          <pre className="text-body-3 whitespace-pre-wrap leading-relaxed">
            {contract.content}
          </pre>
        </ScrollArea>
      </Card>

      {/* Histórico de Assinaturas */}
      {contract.signatures.length > 0 && (
        <Card className="card-base">
          <h2 className="text-h4 font-display mb-4">Histórico de Assinaturas</h2>
          <div className="space-y-3">
            {contract.signatures.map((signature, index) => {
              const party = contract.parties.find(p => p.id === signature.partyId);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
                  <div>
                    <h3 className="text-body-2 font-semibold">{party?.name}</h3>
                    <p className="text-body-4 text-muted-foreground">
                      Assinado em {formatDate(signature.signedAt)}
                    </p>
                    <p className="text-body-4 text-muted-foreground">
                      IP: {signature.ipAddress}
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertCircle, Clock, ExternalLink, Copy } from "lucide-react";
import { SmartContract, Milestone, Transaction } from "../../services/smartContractMock";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SmartContractStatusProps {
  contract: SmartContract;
  isLoading?: boolean;
  onApproveMilestone: (milestoneId: string) => void;
  onRejectMilestone: (milestoneId: string, reason: string) => void;
  onReleaseFunds: () => void;
}

export const SmartContractStatus = ({
  contract,
  isLoading = false,
  onApproveMilestone,
  onRejectMilestone,
  onReleaseFunds
}: SmartContractStatusProps) => {
  const [rejectReason, setRejectReason] = useState("");
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-error" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-warning" />;
      default:
        return <Clock className="w-5 h-5 text-tertiary" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'funds_held':
        return 'Fundos Retidos';
      case 'release_pending':
        return 'Liberação Pendente';
      case 'funds_released':
        return 'Fundos Liberados';
      default:
        return 'Status Desconhecido';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Endereço copiado para a área de transferência",
    });
  };

  const completedMilestones = contract.milestones.filter(m => m.status === 'completed').length;
  const progressPercentage = (completedMilestones / contract.milestones.length) * 100;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Principal */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(contract.executionStatus)}
              <h2 className="text-h3 font-display font-semibold text-foreground">
                {contract.title}
              </h2>
            </div>
            <Badge variant={getStatusVariant(contract.executionStatus)} className="mb-4">
              {getStatusText(contract.status)}
            </Badge>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-3">
              <div>
                <span className="text-muted-foreground">Valor Total:</span>
                <p className="font-semibold text-foreground">
                  {contract.currency} {contract.totalAmount.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Último Update:</span>
                <p className="font-semibold text-foreground">
                  {new Date(contract.updatedAt).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-body-4 text-muted-foreground">Contrato:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(contract.contractAddress)}
                className="h-auto p-1"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-body-4 font-mono text-muted-foreground">
              {contract.contractAddress.slice(0, 6)}...{contract.contractAddress.slice(-4)}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => window.open(`https://etherscan.io/address/${contract.contractAddress}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver no Explorer
            </Button>
          </div>
        </div>
      </Card>

      {/* Progresso dos Milestones */}
      <Card className="p-6">
        <h3 className="text-h4 font-display font-semibold mb-4 text-foreground">
          Progresso dos Milestones
        </h3>
        <div className="mb-4">
          <div className="flex justify-between text-body-4 text-muted-foreground mb-2">
            <span>Concluído</span>
            <span>{completedMilestones} de {contract.milestones.length}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="space-y-4">
          {contract.milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onApprove={() => onApproveMilestone(milestone.id)}
              onReject={(reason) => onRejectMilestone(milestone.id, reason)}
            />
          ))}
        </div>
      </Card>

      {/* Ações de Controle */}
      <Card className="p-6">
        <h3 className="text-h4 font-display font-semibold mb-4 text-foreground">
          Ações de Controle
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onReleaseFunds}
            disabled={contract.status === 'funds_released'}
            className="flex-1"
          >
            {contract.status === 'funds_released' ? 'Fundos Liberados' : 'Liberar Fundos'}
          </Button>
          <Button
            variant="destructive"
            onClick={() => onRejectMilestone('all', 'Solicitação de estorno')}
            disabled={contract.executionStatus === 'rejected'}
            className="flex-1"
          >
            Solicitar Estorno
          </Button>
        </div>
      </Card>

      {/* Histórico de Transações */}
      <Card className="p-6">
        <h3 className="text-h4 font-display font-semibold mb-4 text-foreground">
          Histórico de Transações
        </h3>
        <div className="space-y-3">
          {contract.transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </Card>
    </div>
  );
};

const MilestoneCard = ({ 
  milestone, 
  onApprove, 
  onReject 
}: { 
  milestone: Milestone;
  onApprove: () => void;
  onReject: (reason: string) => void;
}) => {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'disputed':
        return 'text-error';
      default:
        return 'text-warning';
    }
  };

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason);
      setRejectReason("");
      setShowRejectInput(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-body-2 font-semibold text-foreground">{milestone.title}</h4>
            <Badge 
              variant={milestone.status === 'completed' ? 'default' : 'outline'}
              className={getStatusColor(milestone.status)}
            >
              {milestone.status === 'completed' ? 'Concluído' : 
               milestone.status === 'disputed' ? 'Disputado' : 'Pendente'}
            </Badge>
          </div>
          <p className="text-body-4 text-muted-foreground mb-2">{milestone.description}</p>
          <div className="flex items-center gap-4 text-body-4">
            <span className="text-muted-foreground">
              Valor: <span className="font-semibold text-foreground">BRL {milestone.amount.toLocaleString('pt-BR')}</span>
            </span>
            <span className="text-muted-foreground">
              Prazo: <span className="font-semibold text-foreground">{new Date(milestone.dueDate).toLocaleDateString('pt-BR')}</span>
            </span>
          </div>
        </div>
        
        {milestone.status === 'pending' && (
          <div className="flex gap-2 ml-4">
            <Button size="sm" onClick={onApprove}>
              Aprovar
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => setShowRejectInput(true)}
            >
              Rejeitar
            </Button>
          </div>
        )}
      </div>

      {showRejectInput && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Motivo da rejeição..."
            className="w-full p-2 border border-border rounded text-body-4 bg-background"
            rows={2}
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleReject} disabled={!rejectReason.trim()}>
              Confirmar Rejeição
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowRejectInput(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '📥';
      case 'release':
        return '📤';
      case 'refund':
        return '↩️';
      default:
        return '💳';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Depósito';
      case 'release':
        return 'Liberação';
      case 'refund':
        return 'Estorno';
      default:
        return 'Transação';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-xl">{getTypeIcon(transaction.type)}</span>
        <div>
          <p className="text-body-3 font-semibold text-foreground">{getTypeText(transaction.type)}</p>
          <p className="text-body-4 text-muted-foreground">
            {new Date(transaction.timestamp).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-body-3 font-semibold text-foreground">
          BRL {transaction.amount.toLocaleString('pt-BR')}
        </p>
        <Badge variant={transaction.status === 'confirmed' ? 'default' : 'secondary'}>
          {transaction.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
        </Badge>
      </div>
    </div>
  );
};
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SmartContractStatus } from "../components/contract/SmartContractStatus";
import { smartContractService, SmartContract } from "../services/smartContractMock";

const SmartContractPage = () => {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<SmartContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const loadContract = async (showLoading = true) => {
    if (!id) return;
    
    try {
      if (showLoading) setIsLoading(true);
      const contractData = await smartContractService.getSmartContract(id);
      setContract(contractData);
    } catch (error) {
      toast({
        title: "Erro ao carregar contrato",
        description: "Não foi possível carregar os dados do smart contract.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadContract(false);
    setIsRefreshing(false);
    
    toast({
      title: "Atualizado!",
      description: "Status do contrato atualizado com sucesso.",
    });
  };

  const handleApproveMilestone = async (milestoneId: string) => {
    if (!id || !contract) return;

    try {
      const updatedContract = await smartContractService.approveMilestone(id, milestoneId);
      setContract(updatedContract);
      
      toast({
        title: "Milestone Aprovado!",
        description: "O milestone foi aprovado e os fundos serão liberados.",
      });
    } catch (error) {
      toast({
        title: "Erro ao aprovar milestone",
        description: "Não foi possível aprovar o milestone. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleRejectMilestone = async (milestoneId: string, reason: string) => {
    if (!id || !contract) return;

    try {
      const updatedContract = await smartContractService.rejectMilestone(id, milestoneId, reason);
      setContract(updatedContract);
      
      toast({
        title: "Milestone Rejeitado",
        description: "O milestone foi rejeitado e a disputa foi iniciada.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro ao rejeitar milestone",
        description: "Não foi possível rejeitar o milestone. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleReleaseFunds = async () => {
    if (!id || !contract) return;

    try {
      const updatedContract = await smartContractService.releaseFunds(id);
      setContract(updatedContract);
      
      toast({
        title: "Fundos Liberados!",
        description: "Todos os fundos foram liberados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao liberar fundos",
        description: "Não foi possível liberar os fundos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadContract();
  }, [id]);

  // Auto-refresh a cada 30 segundos para simular tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        handleRefresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoading, isRefreshing]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-h2 font-display font-bold text-foreground">
                  Smart Contract
                </h1>
                <p className="text-body-3 text-muted-foreground">
                  Execução automatizada e status em tempo real
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="min-w-[120px]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {contract ? (
          <SmartContractStatus
            contract={contract}
            isLoading={isLoading}
            onApproveMilestone={handleApproveMilestone}
            onRejectMilestone={handleRejectMilestone}
            onReleaseFunds={handleReleaseFunds}
          />
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-body-2 text-muted-foreground">Carregando smart contract...</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-h3 font-display font-semibold text-foreground mb-2">
              Smart Contract não encontrado
            </h2>
            <p className="text-body-2 text-muted-foreground mb-6">
              O contrato solicitado não foi encontrado ou não existe.
            </p>
            <Link to="/">
              <Button>Voltar ao Início</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Footer com informações técnicas */}
      <div className="border-t border-border bg-muted/50 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
            <div>
              <h4 className="text-body-3 font-semibold text-foreground mb-1">
                Status da Rede
              </h4>
              <p className="text-body-4 text-muted-foreground">
                ✅ Ethereum Mainnet - Online
              </p>
            </div>
            <div>
              <h4 className="text-body-3 font-semibold text-foreground mb-1">
                Gas Tracker
              </h4>
              <p className="text-body-4 text-muted-foreground">
                ⛽ 25 Gwei (Rápido)
              </p>
            </div>
            <div>
              <h4 className="text-body-3 font-semibold text-foreground mb-1">
                Última Sincronização
              </h4>
              <p className="text-body-4 text-muted-foreground">
                {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartContractPage;
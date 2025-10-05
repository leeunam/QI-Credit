import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header2 } from '@/components/layout/Header2';
import { ContractViewer } from '../components/contract/ContractViewer';
import { SignatureModal } from '../components/contract/SignatureModal';
import { contractService, Contract } from '../services/contractMock';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContractPage = () => {
  const { id } = useParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadContract();
  }, [id]);

  const loadContract = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const contractData = await contractService.getContract(id);
      setContract(contractData);
    } catch (error) {
      toast({
        title: "Erro ao carregar contrato",
        description: "Não foi possível carregar os dados do contrato.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignRequest = () => {
    if (!contract) return;

    const unsignedParties = contract.parties.filter(party => !party.signed);
    if (unsignedParties.length === 0) {
      toast({
        title: "Contrato já assinado",
        description: "Todas as partes já assinaram este contrato.",
        variant: "default"
      });
      return;
    }

    setIsSignModalOpen(true);
  };

  const handleSign = async (signatureData: string, partyId: string) => {
    if (!contract) return;

    try {
      setIsSigning(true);
      const updatedContract = await contractService.signContract(contract.id, partyId, signatureData);
      setContract(updatedContract);
      setIsSignModalOpen(false);

      const party = contract.parties.find(p => p.id === partyId);
      toast({
        title: "Assinatura realizada com sucesso!",
        description: `${party?.name} assinou o contrato digitalmente.`,
        variant: "default"
      });

      // Verifica se todas as partes assinaram
      const allSigned = updatedContract.parties.every(p => p.signed);
      if (allSigned) {
        toast({
          title: "Contrato finalizado!",
          description: "Todas as partes assinaram o contrato. O documento está pronto.",
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao assinar contrato",
        description: "Não foi possível processar a assinatura. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownload = async () => {
    if (!contract) return;

    try {
      const blob = await contractService.downloadContract(contract.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${contract.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download iniciado",
        description: "O arquivo PDF do contrato está sendo baixado.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o contrato. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-h4 font-display mb-2">Carregando contrato...</h2>
          <p className="text-body-3 text-muted-foreground">Por favor, aguarde.</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-h2 font-display mb-4">Contrato não encontrado</h2>
          <p className="text-body-2 text-muted-foreground mb-6">
            O contrato solicitado não foi encontrado ou não existe.
          </p>
          <a href="/" className="btn-primary">
            Voltar ao início
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header2 />
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link to="/dashboard">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
                <h1 className="text-h2 font-display">Contrato Digital</h1>
              </div>
              <p className="text-body-3 text-muted-foreground">
                Visualização e assinatura de contratos eletrônicos
              </p>
            </div>
            <div className="text-right">
              <p className="text-body-4 text-muted-foreground">ID do Contrato</p>
              <p className="text-body-2 font-mono">{contract?.id}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        <ContractViewer
          contract={contract}
          onSignRequest={handleSignRequest}
          onDownload={handleDownload}
        />
      </main>

      {/* Modal de Assinatura */}
      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSign={handleSign}
        parties={contract.parties}
        isLoading={isSigning}
      />
    </div>
  );
};

export default ContractPage;
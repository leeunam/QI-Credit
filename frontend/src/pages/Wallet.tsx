import { useState } from 'react';
import { BalanceCard } from '../components/wallet/BalanceCard';
import { QuickActions } from '../components/wallet/QuickActions';
import { TransactionList } from '../components/wallet/TransactionList';
import { ActionModal } from '@/components/wallet/ActionModal';
import { useWallet } from '../contexts/walletContext';
import { toast } from '@/hooks/use-toast';

const Wallet = () => {
  const { balance, transactions } = useWallet();
  const [modalAction, setModalAction] = useState<'add' | 'withdraw' | 'transfer' | null>(null);

  const handleAddMoney = () => {
    setModalAction('add');
  };

  const handleWithdraw = () => {
    setModalAction('withdraw');
  };

  const handleTransfer = () => {
    setModalAction('transfer');
  };

  const handleScanQR = () => {
    toast({
      title: "QR Code",
      description: "Funcionalidade em desenvolvimento",
      variant: "default"
    });
  };

  const closeModal = () => {
    setModalAction(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-h1 font-display font-bold text-foreground">
            Carteira Digital
          </h1>
          <p className="text-body-2 text-muted-foreground mt-2">
            Gerencie seu dinheiro de forma fácil e segura
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column - Balance and Quick Actions */}
          <div className="lg:col-span-5 space-y-6">
            <BalanceCard balance={balance} />
            <QuickActions
              onAddMoney={handleAddMoney}
              onWithdraw={handleWithdraw}
              onTransfer={handleTransfer}
              onScanQR={handleScanQR}
            />
          </div>

          {/* Right Column - Transaction History */}
          <div className="lg:col-span-7">
            <TransactionList transactions={transactions} />
          </div>
        </div>
      </div>

      {/* Action Modal */}
      <ActionModal
        isOpen={modalAction !== null}
        onClose={closeModal}
        action={modalAction}
      />
    </div>
  );
};

export default Wallet;